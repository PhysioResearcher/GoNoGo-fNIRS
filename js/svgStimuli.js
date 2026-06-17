/* ============================================================================
 * svgStimuli.js — Çizgi film hayvan uyaranları (gömülü SVG)
 * Harici görsel dosyası gerektirmez; tamamen çevrimdışı çalışır.
 * Her fonksiyon 200x200 viewBox'lı bir SVG döndürür.
 * ========================================================================== */

const ANIMAL_STIMULI = {
  /* ---- Kedi (hedef varsayılan) ---- */
  cat: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="kedi">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <polygon points="55,55 45,15 85,40" fill="#f4a23b"/>
      <polygon points="145,55 155,15 115,40" fill="#f4a23b"/>
      <polygon points="58,52 52,28 78,44" fill="#ffd9a0"/>
      <polygon points="142,52 148,28 122,44" fill="#ffd9a0"/>
      <circle cx="100" cy="105" r="62" fill="#f4a23b"/>
      <circle cx="78" cy="95" r="11" fill="#fff"/>
      <circle cx="122" cy="95" r="11" fill="#fff"/>
      <circle cx="78" cy="97" r="6" fill="#2b2b2b"/>
      <circle cx="122" cy="97" r="6" fill="#2b2b2b"/>
      <polygon points="100,112 92,120 108,120" fill="#e76f51"/>
      <path d="M100 120 q-12 12 -26 8 M100 120 q12 12 26 8" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g stroke="#2b2b2b" stroke-width="2" stroke-linecap="round">
        <line x1="70" y1="118" x2="40" y2="112"/><line x1="70" y1="124" x2="40" y2="124"/>
        <line x1="130" y1="118" x2="160" y2="112"/><line x1="130" y1="124" x2="160" y2="124"/>
      </g>
    </svg>`,

  /* ---- Köpek (standart/no-go varsayılan) ---- */
  dog: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="köpek">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <ellipse cx="52" cy="95" rx="20" ry="38" fill="#8d5a3c"/>
      <ellipse cx="148" cy="95" rx="20" ry="38" fill="#8d5a3c"/>
      <circle cx="100" cy="100" r="62" fill="#b07a52"/>
      <ellipse cx="100" cy="125" rx="40" ry="34" fill="#e7cba9"/>
      <circle cx="80" cy="92" r="10" fill="#fff"/>
      <circle cx="120" cy="92" r="10" fill="#fff"/>
      <circle cx="80" cy="94" r="6" fill="#2b2b2b"/>
      <circle cx="120" cy="94" r="6" fill="#2b2b2b"/>
      <ellipse cx="100" cy="118" rx="11" ry="8" fill="#2b2b2b"/>
      <path d="M100 126 v12 M100 138 q-12 8 -22 2 M100 138 q12 8 22 2" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,

  /* ---- Aslan (ek) ---- */
  lion: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="aslan">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <g fill="#cf7a2e">
        ${Array.from({length:14}).map((_,i)=>{const a=i*(360/14)*Math.PI/180;const x=100+58*Math.cos(a);const y=100+58*Math.sin(a);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20"/>`;}).join('')}
      </g>
      <circle cx="100" cy="100" r="52" fill="#f0b65b"/>
      <circle cx="82" cy="93" r="9" fill="#fff"/><circle cx="118" cy="93" r="9" fill="#fff"/>
      <circle cx="82" cy="95" r="5" fill="#2b2b2b"/><circle cx="118" cy="95" r="5" fill="#2b2b2b"/>
      <polygon points="100,108 92,116 108,116" fill="#5a3a1a"/>
      <path d="M100 116 q-10 10 -22 6 M100 116 q10 10 22 6" stroke="#5a3a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,

  /* ---- Fil (ek) ---- */
  elephant: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="fil">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <ellipse cx="55" cy="92" rx="32" ry="38" fill="#9aa7b0"/>
      <ellipse cx="145" cy="92" rx="32" ry="38" fill="#9aa7b0"/>
      <circle cx="100" cy="95" r="58" fill="#aab6bf"/>
      <path d="M100 120 q-6 40 -28 52 q-14 8 -10 -8 q10 -18 20 -44" fill="#aab6bf"/>
      <circle cx="82" cy="88" r="8" fill="#fff"/><circle cx="118" cy="88" r="8" fill="#fff"/>
      <circle cx="82" cy="90" r="5" fill="#2b2b2b"/><circle cx="118" cy="90" r="5" fill="#2b2b2b"/>
    </svg>`,

  /* ---- Kurbağa (ek) ---- */
  frog: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="kurbağa">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <circle cx="70" cy="58" r="24" fill="#7cc24a"/>
      <circle cx="130" cy="58" r="24" fill="#7cc24a"/>
      <circle cx="70" cy="58" r="12" fill="#fff"/><circle cx="130" cy="58" r="12" fill="#fff"/>
      <circle cx="70" cy="60" r="6" fill="#2b2b2b"/><circle cx="130" cy="60" r="6" fill="#2b2b2b"/>
      <ellipse cx="100" cy="115" rx="62" ry="50" fill="#7cc24a"/>
      <path d="M70 125 q30 28 60 0" stroke="#3f6e22" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="82" cy="118" r="3" fill="#3f6e22"/><circle cx="118" cy="118" r="3" fill="#3f6e22"/>
    </svg>`,

  /* ---- Tavuk (Go/No-Go hedef = bas) ---- */
  chicken: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="tavuk">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <g fill="#e0473b">
        <circle cx="86" cy="44" r="11"/><circle cx="100" cy="36" r="12"/><circle cx="114" cy="44" r="11"/>
      </g>
      <circle cx="100" cy="106" r="58" fill="#fff3d6"/>
      <circle cx="74" cy="120" r="9" fill="#f7b6a6"/><circle cx="126" cy="120" r="9" fill="#f7b6a6"/>
      <circle cx="82" cy="96" r="10" fill="#fff"/><circle cx="118" cy="96" r="10" fill="#fff"/>
      <circle cx="82" cy="98" r="6" fill="#2b2b2b"/><circle cx="118" cy="98" r="6" fill="#2b2b2b"/>
      <polygon points="90,110 110,110 100,102" fill="#f7b733"/>
      <polygon points="90,110 110,110 100,122" fill="#f4a020"/>
      <circle cx="100" cy="130" r="5" fill="#e0473b"/>
    </svg>`,

  /* ---- Ördek (Go/No-Go standart = basma) ---- */
  duck: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ördek">
      <ellipse cx="100" cy="185" rx="55" ry="10" fill="#00000018"/>
      <path d="M118 48 q14 -10 8 6 q-4 8 -14 6 z" fill="#ffe14d"/>
      <circle cx="100" cy="104" r="58" fill="#ffe14d"/>
      <circle cx="84" cy="92" r="10" fill="#fff"/><circle cx="116" cy="92" r="10" fill="#fff"/>
      <circle cx="84" cy="94" r="6" fill="#2b2b2b"/><circle cx="116" cy="94" r="6" fill="#2b2b2b"/>
      <ellipse cx="100" cy="122" rx="30" ry="13" fill="#f59e1b"/>
      <ellipse cx="100" cy="118" rx="30" ry="6" fill="#fbb43c"/>
      <circle cx="92" cy="118" r="1.6" fill="#7a4a08"/><circle cx="108" cy="118" r="1.6" fill="#7a4a08"/>
    </svg>`
};

window.ANIMAL_STIMULI = ANIMAL_STIMULI;
