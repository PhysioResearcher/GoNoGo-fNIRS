/* ============================================================================
 * config.js — Go/No-Go görevi yapılandırması
 * Tüm zamanlama ve tasarım parametreleri buradan ayarlanır.
 * Miao ve ark. (2017), Monden ve ark. (2012, 2015) paradigmaları temel alınmıştır.
 * ========================================================================== */

const TASK_CONFIG = {
  /* ---- Blok yapısı ---- */
  numBlockSets: 6,          // blok seti sayısı (her set: 1 Go + 1 Go/No-Go bloğu)
  trialsPerBlock: 24,       // her bloktaki uyaran sayısı

  /* ---- Zamanlama (ms) ---- */
  stimulusDuration: 300,    // uyaran ekranda kalma süresi
  isiDuration: 700,         // uyaranlar arası süre (ISI)  -> SOA = 1000 ms
  instructionDuration: 3000,// her blok öncesi yönerge ekranı süresi
  restDuration: 10000,      // blok setleri arası dinlenme süresi (fNIRS toparlanma)

  /* ---- Go/No-Go bloğu hedef oranı ----
   * Hedef (Go) uyaranların bloktaki oranı. 0.5 = dengeli.
   * İnhibisyonu güçlendirmek için 0.67-0.75 tercih edilebilir. */
  goNoGoTargetRatio: 0.75,   // 24 denemede 18 Go (hedef) / 6 No-Go (standart)

  /* ---- Yanıt ---- */
  responseKeys: [' '],      // kabul edilen yanıt tuşları (Boşluk). Dokunmatik de desteklenir.
  responseKeyLabel: 'BOŞLUK tuşu',

  /* ---- Uyaranlar (svgStimuli.js içindeki hayvan adları) ----
   * Go bloğu (temel görev): iki hayvanın da görüldüğünde BAS (her ikisi go).
   * Go/No-Go bloğu (hedef görev): target = BAS, standard = BASMA (No-Go). */
  animals: {
    goBlock: { a: 'cat', b: 'dog' },  // Go bloğu uyaranları (ikisi de bas)
    target: 'chicken',                // Go/No-Go hedef (tavuk → bas)
    standard: 'duck'                  // Go/No-Go standart (ördek → basma)
  },

  /* ---- Alıştırma (pratik) oturumu ---- */
  practice: {
    enabled: true,
    goTrials: 6,            // alıştırmada Go bloğu deneme sayısı
    goNoGoTrials: 8,        // alıştırmada Go/No-Go bloğu deneme sayısı
    feedback: true          // alıştırmada doğru/yanlış geri bildirimi göster
  },

  /* ---- fNIRS senkronizasyonu ---- */
  fnirs: {
    photodiodeSync: true,   // uyaran başlangıcında köşedeki senkron karesini yak
    serialTriggers: false,  // Web Serial üzerinden TTL tetikleyici (Chrome/Edge)
    triggerCodes: {         // olay -> tetik kodu (byte)
      blockStart: 10,
      goOnset: 1,           // Go bloğu uyaran başlangıcı
      targetOnset: 2,       // Go/No-Go hedef (go) uyaran başlangıcı
      standardOnset: 3,     // Go/No-Go standart (no-go) uyaran başlangıcı
      response: 8,          // katılımcı yanıtı
      blockEnd: 20,
      rest: 15              // setler arası dinlenme başlangıcı
    }
  },

  /* ---- Dışa aktarma ---- */
  export: {
    includeJSON: false      // tam arşiv JSON'u da indir (varsayılan kapalı; okunabilir CSV'ler yeterli)
  },

  /* ---- Görünüm ---- */
  stimulusSizePx: 320,      // uyaran kenar uzunluğu (px)
  fullscreenOnStart: true   // başlarken tam ekran iste
};

/* Tarayıcı global'i olarak erişilebilir */
window.TASK_CONFIG = TASK_CONFIG;
