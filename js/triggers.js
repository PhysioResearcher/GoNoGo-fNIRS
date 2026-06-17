/* ============================================================================
 * triggers.js — fNIRS senkronizasyonu
 *  1) Fotodiyot senkron karesi (uyaran başlangıcında köşede beyaz kare)
 *  2) Web Serial TTL tetikleyicileri (isteğe bağlı, Chrome/Edge)
 *  3) Yüksek çözünürlüklü olay işaretleyici günlüğü
 * ========================================================================== */

const Triggers = (() => {
  let serialPort = null;
  let serialWriter = null;
  const markers = []; // {code, label, t_perf, t_unix}

  /* Web Serial bağlantısı (kullanıcı etkileşimiyle çağrılmalı) */
  async function connectSerial(baudRate = 115200) {
    if (!('serial' in navigator)) {
      console.warn('Web Serial bu tarayıcıda desteklenmiyor (Chrome/Edge gerekir).');
      return false;
    }
    try {
      serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate });
      serialWriter = serialPort.writable.getWriter();
      return true;
    } catch (e) {
      console.warn('Seri port bağlanamadı:', e);
      return false;
    }
  }

  async function disconnectSerial() {
    try {
      if (serialWriter) { serialWriter.releaseLock(); serialWriter = null; }
      if (serialPort) { await serialPort.close(); serialPort = null; }
    } catch (e) { /* yok say */ }
  }

  /* Fotodiyot senkron karesini yak/söndür */
  function flashPhotodiode(on) {
    if (!TASK_CONFIG.fnirs.photodiodeSync) return;
    const el = document.getElementById('photodiode');
    if (el) el.style.background = on ? '#ffffff' : '#000000';
  }

  /* Tek noktadan olay işaretle: günlük + (varsa) TTL + fotodiyot */
  function mark(code, label, { flash = false } = {}) {
    const t_perf = performance.now();
    const t_unix = Date.now();
    markers.push({ code, label, t_perf: +t_perf.toFixed(3), t_unix });

    if (flash) flashPhotodiode(true);

    if (TASK_CONFIG.fnirs.serialTriggers && serialWriter) {
      // TTL kodu gönder (tek byte). Bloklayıcı beklemeden gönder.
      serialWriter.write(new Uint8Array([code & 0xff])).catch(() => {});
    }
    return t_perf;
  }

  function getMarkers() { return markers.slice(); }
  function reset() { markers.length = 0; }

  return { connectSerial, disconnectSerial, flashPhotodiode, mark, getMarkers, reset };
})();

window.Triggers = Triggers;
