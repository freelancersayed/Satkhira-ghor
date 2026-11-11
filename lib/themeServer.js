import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

export const DEFAULT_THEME = {
  primary: '#016831',
  secondary: '#FAB116',
  buttonBg: '#016831',
  buttonText: '#FFFFFF',
  textColor: '#14241E',
  textHover: '#02833E',
  buttonHoverBg: '#014D24',
};

const THEME_FILE_PATH = path.join(process.cwd(), 'data', 'site-theme.json');

/**
 * Read the current active theme on the server (SSR).
 * First checks file cache for 0ms ultra-fast response, then MongoDB if needed.
 */
export async function getSavedTheme() {
  try {
    // 1. Try reading from server file cache (super fast)
    if (fs.existsSync(THEME_FILE_PATH)) {
      const raw = fs.readFileSync(THEME_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.primary) {
        return { ...DEFAULT_THEME, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Error reading theme file cache:', err.message);
  }

  // 2. Fallback to MongoDB
  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: 'theme' }).lean();
    if (doc && doc.data && doc.data.primary) {
      const theme = { ...DEFAULT_THEME, ...doc.data };
      // Save to file cache for next time
      try {
        fs.writeFileSync(THEME_FILE_PATH, JSON.stringify(theme, null, 2), 'utf-8');
      } catch (e) {
        // ignore write error in readonly environments
      }
      return theme;
    }
  } catch (err) {
    console.warn('Error reading theme from DB:', err.message);
  }

  return DEFAULT_THEME;
}

/**
 * Save theme to file cache on the server
 */
export function saveThemeToFile(themeData) {
  try {
    const fullTheme = { ...DEFAULT_THEME, ...themeData };
    fs.writeFileSync(THEME_FILE_PATH, JSON.stringify(fullTheme, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Could not write theme to local file:', err.message);
    return false;
  }
}

/**
 * Generate CSS rules to inject directly into <head> during SSR
 */
export function generateThemeCSS(theme) {
  const current = theme || DEFAULT_THEME;
  const primary = current.primary || '#016831';
  const secondary = current.secondary || '#FAB116';
  const buttonBg = current.buttonBg || '#016831';
  const buttonText = current.buttonText || '#FFFFFF';
  const textColor = current.textColor || '#14241E';
  const textHover = current.textHover || '#02833E';
  const buttonHoverBg = current.buttonHoverBg || '#014D24';

  return `
    :root {
      --color-primary: ${primary};
      --color-honey: ${secondary};
      --site-primary: ${primary};
      --site-secondary: ${secondary};
      --site-button-bg: ${buttonBg};
      --site-button-text: ${buttonText};
      --site-text: ${textColor};
      --site-text-hover: ${textHover};
      --site-button-hover-bg: ${buttonHoverBg};
    }

    /* ─── Primary Background Overrides ─── */
    nav[aria-label="Mobile Bottom Navigation"],
    .bg-\\[\\#016831\\],
    .bg-\\[\\#014D24\\],
    [class*="bg-[#016831]"],
    [class*="bg-[#014D24]"],
    .dynamic-bg-primary {
      background-color: ${primary} !important;
    }

    /* ─── Primary Text & Border Overrides ─── */
    .text-\\[\\#016831\\],
    [class*="text-[#016831]"],
    .dynamic-text-primary {
      color: ${primary} !important;
    }

    .border-\\[\\#016831\\],
    .border-\\[\\#014D24\\],
    [class*="border-[#016831]"],
    .dynamic-border-primary {
      border-color: ${primary} !important;
    }

    /* ─── Secondary / Honey Overrides ─── */
    .text-\\[\\#FAB116\\],
    [class*="text-[#FAB116]"],
    .dynamic-text-secondary {
      color: ${secondary} !important;
    }

    .bg-\\[\\#FAB116\\],
    [class*="bg-[#FAB116]"],
    .dynamic-bg-secondary {
      background-color: ${secondary} !important;
    }

    .border-\\[\\#FAB116\\],
    [class*="border-[#FAB116]"] {
      border-color: ${secondary} !important;
    }

    /* ─── Action Buttons (Order, Cart, Submit) ─── */
    button.bg-\\[\\#016831\\],
    a.bg-\\[\\#016831\\],
    button[type="submit"],
    .btn-cta-primary,
    .dynamic-btn-primary {
      background-color: ${buttonBg} !important;
      color: ${buttonText} !important;
    }

    button.bg-\\[\\#016831\\]:hover,
    a.bg-\\[\\#016831\\]:hover,
    button[type="submit"]:hover,
    .btn-cta-primary:hover,
    .dynamic-btn-primary:hover {
      background-color: ${buttonHoverBg} !important;
    }

    /* ─── Floating Side Cart ─── */
    aside[aria-label="Open Cart Drawer"] {
      background-color: ${buttonBg} !important;
    }

    /* ─── Headings & Main Text Color ─── */
    h1, h2, h3, h4, h5, h6,
    .product-title,
    .dynamic-text-main {
      color: ${textColor};
    }

    /* ─── Link & Text Hover States ─── */
    a:hover,
    .dynamic-hover-text:hover,
    [class*="hover:text-[#016831]"]:hover,
    [class*="hover:text-[#02833E]"]:hover {
      color: ${textHover} !important;
    }
  `;
}

