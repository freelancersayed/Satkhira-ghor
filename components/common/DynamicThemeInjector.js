'use client';

import { useEffect } from 'react';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function DynamicThemeInjector({ initialTheme }) {
  const { content, fetchContent } = useSiteContentStore();
  const theme = content?.theme || initialTheme;

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const activeTheme = theme || initialTheme;
    if (!activeTheme) return;

    const primary = activeTheme.primary || '#016831';
    const secondary = activeTheme.secondary || '#FAB116';
    const buttonBg = activeTheme.buttonBg || '#016831';
    const buttonText = activeTheme.buttonText || '#FFFFFF';
    const textColor = activeTheme.textColor || '#14241E';
    const textHover = activeTheme.textHover || '#02833E';
    const buttonHoverBg = activeTheme.buttonHoverBg || '#014D24';

    // 1. Set CSS Custom Properties on document root
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-honey', secondary);
    root.style.setProperty('--site-primary', primary);
    root.style.setProperty('--site-secondary', secondary);
    root.style.setProperty('--site-button-bg', buttonBg);
    root.style.setProperty('--site-button-text', buttonText);
    root.style.setProperty('--site-text', textColor);
    root.style.setProperty('--site-text-hover', textHover);
    root.style.setProperty('--site-button-hover-bg', buttonHoverBg);

    // 2. Inject or update dynamic style tag for live overrides across all elements
    const styleId = 'satkhira-ghor-dynamic-theme-overrides';
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --color-primary: ${primary};
        --color-honey: ${secondary};
        --site-primary: ${primary};
        --site-secondary: ${secondary};
        --site-button-bg: ${buttonBg};
        --site-button-text: ${buttonText};
        --site-text: ${textColor};
        --site-text-hover: ${textHover};
      }

      /* ─── Dynamic Primary Background Elements ─── */
      nav[aria-label="Mobile Bottom Navigation"],
      [class*="bg-[#016831]"],
      .dynamic-bg-primary {
        background-color: ${primary} !important;
      }

      /* ─── Dynamic Primary Text & Border Elements ─── */
      [class*="text-[#016831]"],
      .dynamic-text-primary {
        color: ${primary} !important;
      }

      [class*="border-[#016831]"],
      .dynamic-border-primary {
        border-color: ${primary} !important;
      }

      /* ─── Dynamic Secondary / Honey Elements ─── */
      [class*="text-[#FAB116]"],
      .dynamic-text-secondary {
        color: ${secondary} !important;
      }

      [class*="bg-[#FAB116]"],
      .dynamic-bg-secondary {
        background-color: ${secondary} !important;
      }

      /* ─── Dynamic Buttons (Order, Cart, Submit) ─── */
      button.bg-\\[\\#016831\\],
      a.bg-\\[\\#016831\\],
      button[type="submit"],
      .dynamic-btn-primary {
        background-color: ${buttonBg} !important;
        color: ${buttonText} !important;
      }

      button.bg-\\[\\#016831\\]:hover,
      a.bg-\\[\\#016831\\]:hover,
      button[type="submit"]:hover,
      .dynamic-btn-primary:hover {
        background-color: ${buttonHoverBg} !important;
      }

      /* ─── Dynamic Headings & Main Text Color ─── */
      h1, h2, h3, h4, h5, h6,
      .dynamic-text-main {
        color: ${textColor} !important;
      }

      /* ─── Dynamic Text Hover ─── */
      a:hover,
      .dynamic-hover-text:hover,
      [class*="hover:text-[#016831]"]:hover,
      [class*="hover:text-[#02833E]"]:hover {
        color: ${textHover} !important;
      }
    `;
  }, [theme]);

  return null;
}
