// global.d.ts
export {}; // força o TS a tratar como módulo

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
