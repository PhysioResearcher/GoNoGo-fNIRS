/* ============================================================================
 * data.js — Veri kaydı, özet hesaplama ve dışa aktarma
 *  - Deneme-bazlı CSV
 *  - BIDS benzeri events.tsv (onset / duration / trial_type) -> fNIRS GLM için
 *  - Özet (doğruluk, ortalama TS, komisyon/omisyon hataları, d')
 *  - Tam oturum JSON
 * ========================================================================== */

const DataLogger = (() => {
  let session = null;

  function startSession(meta) {
    session = {
      meta: Object.assign({
        participantId: '',
        sessionId: '',
        group: '',
        age: '',
        notes: '',
        startedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        config: TASK_CONFIG
      }, meta),
      trials: []
    };
    Triggers.reset();
    return session;
  }

  /* Bir deneme kaydı ekle.
   * t = {
   *   phase: 'practice'|'main', blockSet, blockType:'Go'|'GoNoGo',
   *   trialInBlock, animal, stimType:'go'|'target'|'standard',
   *   requiredResponse: true|false,
   *   onset_perf, onset_unix,
   *   responded: true|false, rt: number|null,
   *   outcome: 'hit'|'miss'|'cr'|'fa'
   * } */
  function logTrial(t) {
    if (!session) return;
    session.trials.push(t);
  }

  /* ---- Özet istatistikler ---- */
  function zphi(p) { // ters normal CDF yaklaşımı (Acklam algoritması)
    p = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
    const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
    const b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
    const c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
    const d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
    const pl=0.02425, ph=1-pl; let q,r;
    if (p<pl){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
    if (p<=ph){q=p-0.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
    q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }

  function summarize(phase = 'main') {
    const trials = session.trials.filter(t => t.phase === phase);
    const out = {};
    for (const blockType of ['Go', 'GoNoGo']) {
      const bt = trials.filter(t => t.blockType === blockType);
      if (!bt.length) continue;
      const correct = bt.filter(t => t.outcome === 'hit' || t.outcome === 'cr').length;
      const goTrials = bt.filter(t => t.requiredResponse);
      const nogoTrials = bt.filter(t => !t.requiredResponse);
      const hits = goTrials.filter(t => t.outcome === 'hit');
      const rts = hits.map(t => t.rt).filter(v => v != null);
      const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : null;
      const sdRT = rts.length > 1 ? Math.sqrt(rts.reduce((a, b) => a + (b - meanRT) ** 2, 0) / (rts.length - 1)) : null;

      const summary = {
        nTrials: bt.length,
        accuracy: +(correct / bt.length).toFixed(4),
        meanRT: meanRT != null ? +meanRT.toFixed(1) : null,
        sdRT: sdRT != null ? +sdRT.toFixed(1) : null,
        omissionErrors: goTrials.filter(t => t.outcome === 'miss').length, // Go'ya yanıt yok
        nGo: goTrials.length
      };
      if (blockType === 'GoNoGo') {
        const fa = nogoTrials.filter(t => t.outcome === 'fa').length;
        summary.commissionErrors = fa; // No-Go'ya yanlış basma (inhibisyon hatası)
        summary.nNoGo = nogoTrials.length;
        const hitRate = goTrials.length ? hits.length / goTrials.length : 0;
        const faRate = nogoTrials.length ? fa / nogoTrials.length : 0;
        summary.dPrime = +(zphi(hitRate) - zphi(faRate)).toFixed(3);
      }
      out[blockType] = summary;
    }
    return out;
  }

  /* ---- Dışa aktarma yardımcıları ---- */
  function download(filename, text, mime = 'text/plain') {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function fileStem() {
    const m = session.meta;
    const safe = s => String(s || 'NA').replace(/[^\w.-]/g, '_');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `GoNoGo_${safe(m.participantId)}_ses-${safe(m.sessionId)}_${stamp}`;
  }

  function toCSV() {
    const cols = ['participantId','sessionId','group','age','phase','blockSet','blockType',
      'trialInBlock','animal','stimType','requiredResponse','responded','rt_ms',
      'outcome','onset_perf_ms','onset_unix_ms'];
    const m = session.meta;
    const rows = [cols.join(',')];
    for (const t of session.trials) {
      rows.push([
        m.participantId, m.sessionId, m.group, m.age, t.phase, t.blockSet, t.blockType,
        t.trialInBlock, t.animal, t.stimType, t.requiredResponse, t.responded,
        t.rt != null ? t.rt.toFixed(1) : '', t.outcome,
        t.onset_perf != null ? t.onset_perf.toFixed(3) : '', t.onset_unix
      ].map(v => `"${String(v ?? '')}"`).join(','));
    }
    return rows.join('\n');
  }

  /* BIDS benzeri events.tsv — sadece ana görev. onset = ilk uyarana göre saniye. */
  function toEventsTSV() {
    const main = session.trials.filter(t => t.phase === 'main');
    if (!main.length) return 'onset\tduration\ttrial_type\tresponse_time\n';
    const t0 = main[0].onset_perf;
    const lines = ['onset\tduration\ttrial_type\tresponse_time'];
    for (const t of main) {
      const onset = ((t.onset_perf - t0) / 1000).toFixed(3);
      const dur = (TASK_CONFIG.stimulusDuration / 1000).toFixed(3);
      const type = `${t.blockType}_${t.stimType}`; // ör. GoNoGo_target
      const rt = t.rt != null ? (t.rt / 1000).toFixed(3) : 'n/a';
      lines.push(`${onset}\t${dur}\t${type}\t${rt}`);
    }
    return lines.join('\n');
  }

  /* Okunabilir ÖZET tablosu (her satır = bir faz × blok tipi). Excel'de açılır. */
  function toSummaryCSV() {
    const m = session.meta;
    const cols = ['participantId','sessionId','group','age','phase','blockType',
      'nTrials','nGo','nNoGo','accuracy_pct','meanRT_ms','sdRT_ms',
      'omissionErrors','commissionErrors','dPrime'];
    const rows = [cols.join(',')];
    for (const phase of ['practice', 'main']) {
      const sum = summarize(phase);
      for (const blockType of ['Go', 'GoNoGo']) {
        const s = sum[blockType];
        if (!s) continue;
        rows.push([
          m.participantId, m.sessionId, m.group, m.age, phase, blockType,
          s.nTrials, s.nGo ?? '', s.nNoGo ?? '',
          s.accuracy != null ? (s.accuracy * 100).toFixed(1) : '',
          s.meanRT ?? '', s.sdRT ?? '',
          s.omissionErrors ?? '', s.commissionErrors ?? '', s.dPrime ?? ''
        ].map(v => `"${String(v ?? '')}"`).join(','));
      }
    }
    return rows.join('\n');
  }

  /* Olay işaretleyicileri düz CSV (fNIRS hizalaması için, JSON'a gerek kalmadan) */
  function toMarkersCSV() {
    const cols = ['code', 'label', 't_perf_ms', 't_unix_ms'];
    const rows = [cols.join(',')];
    for (const k of Triggers.getMarkers()) {
      rows.push([k.code, k.label, k.t_perf, k.t_unix].map(v => `"${String(v ?? '')}"`).join(','));
    }
    return rows.join('\n');
  }

  function toJSON() {
    return JSON.stringify({
      meta: session.meta,
      markers: Triggers.getMarkers(),
      trials: session.trials,
      summary: { practice: summarize('practice'), main: summarize('main') }
    }, null, 2);
  }

  function exportAll() {
    const stem = fileStem();
    // Okunabilir tablolar (asıl kullanılacak dosyalar)
    download(`${stem}_summary.csv`, toSummaryCSV(), 'text/csv');
    download(`${stem}_trials.csv`, toCSV(), 'text/csv');
    download(`${stem}_events.tsv`, toEventsTSV(), 'text/tab-separated-values');
    download(`${stem}_markers.csv`, toMarkersCSV(), 'text/csv');
    // Tam arşiv (yedek/yeniden üretilebilirlik; günlük kullanımda gerekmez)
    if (TASK_CONFIG.export && TASK_CONFIG.export.includeJSON) {
      download(`${stem}_session.json`, toJSON(), 'application/json');
    }
  }

  return { startSession, logTrial, summarize, exportAll,
    toCSV, toSummaryCSV, toMarkersCSV, toJSON, getSession: () => session };
})();

window.DataLogger = DataLogger;
