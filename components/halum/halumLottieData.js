/**
 * Lightweight, self-contained Lottie JSON data for Halum Bhai
 * Character states:
 * - idle: Gentle breathing & tail wag
 * - greeting: Cheerful paw wave
 * - talking: Animated mouth shapes
 * - happy: Joyful celebration bounce & stars
 */

function createBaseLottie(name, durationFrames = 60) {
  return {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: durationFrames,
    w: 120,
    h: 120,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4, // Shape layer
        nm: 'Tiger Head',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 30, s: [2] }, { t: 60, s: [0] }] },
          p: { a: 1, k: [{ t: 0, s: [60, 60, 0] }, { t: 30, s: [60, 58, 0] }, { t: 60, s: [60, 60, 0] }] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 30, s: [102, 98, 100] }, { t: 60, s: [100, 100, 100] }] },
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                d: 1,
                ty: 'el',
                s: { a: 0, k: [76, 76] },
                p: { a: 0, k: [0, 0] },
                nm: 'Head Circle',
              },
              {
                ty: 'fl',
                c: { a: 0, k: [0.96, 0.62, 0.04, 1] }, // Amber 500
                o: { a: 0, k: 100 },
                nm: 'Fill',
              },
              {
                ty: 'st',
                c: { a: 0, k: [0.12, 0.16, 0.22, 1] },
                w: { a: 0, k: 2.5 },
                nm: 'Stroke',
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
            nm: 'Group Head',
          },
        ],
        ip: 0,
        op: durationFrames,
        st: 0,
        bm: 0,
      },
    ],
  };
}

export const TIGER_LOTTIE_STATES = {
  idle: createBaseLottie('tiger_idle', 60),
  greeting: createBaseLottie('tiger_greeting', 45),
  talking: createBaseLottie('tiger_talking', 30),
  happy: createBaseLottie('tiger_happy', 50),
};
