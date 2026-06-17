/* ============================================================================
 * task.js — Go/No-Go deney motoru
 * Yüksek çözünürlüklü, sürüklenmeyi düzelten zamanlama (performance.now + rAF).
 * Akış: Kurulum -> Alıştırma -> Ana görev (6 blok seti) -> Bitiş/Dışa aktarma
 * ========================================================================== */

(() => {
  const C = TASK_CONFIG;
  const SOA = C.stimulusDuration + C.isiDuration; // 1000 ms

  /* ---- DOM ---- */
  const $ = id => document.getElementById(id);
  const screens = ['setup', 'instruction', 'stage', 'end'];
  function show(name) {
    screens.forEach(s => $(s).classList.toggle('hidden', s !== name));
    // Kontrol çubuğu yalnızca yönerge ve sahne ekranlarında görünür
    $('controls').classList.toggle('hidden', !(name === 'instruction' || name === 'stage'));
  }

  /* ---- Yanıt durumu (açık deneme için) ---- */
  let trialOpen = false;
  let trialOnset = 0;
  let responded = false;
  let responseRT = null;

  /* ---- Duraklat / Bitir kontrolü ---- */
  let aborted = false;
  let paused = false;
  let resumeResolvers = [];   // duraklatmadan çıkışı bekleyenler
  let abortResolvers = [];    // erken bitişte serbest bırakılacak bekleyenler

  function setPaused(p) {
    paused = p;
    $('pauseBtn').textContent = p ? '▶ Devam Et' : '⏸ Duraklat';
    $('pauseOverlay').classList.toggle('hidden', !p);
    if (!p) { const r = resumeResolvers; resumeResolvers = []; r.forEach(fn => fn()); }
  }
  // Duraklatılmışsa çözülene kadar bekle; geçen duraklama süresini (ms) döndür
  function waitWhilePaused() {
    if (!paused || aborted) return Promise.resolve(0);
    const t0 = performance.now();
    return new Promise(res => resumeResolvers.push(() => res(performance.now() - t0)));
  }
  function endEarly() {
    if (aborted) return;
    aborted = true;
    if (paused) setPaused(false);
    const r = abortResolvers; abortResolvers = []; r.forEach(fn => fn());
  }

  function handleResponse() {
    if (!trialOpen || responded) return;
    responded = true;
    responseRT = performance.now() - trialOnset;
    Triggers.mark(C.fnirs.triggerCodes.response, 'response');
    $('stimulus').classList.add('pressed');
  }

  window.addEventListener('keydown', e => {
    if (C.responseKeys.includes(e.key)) {
      e.preventDefault();
      handleResponse();
    }
    if (e.key === 'Escape') endEarly();
  });
  // Kontrol butonları
  $('pauseBtn').addEventListener('click', () => setPaused(!paused));
  $('finishBtn').addEventListener('click', () => {
    if (confirm('Görevi şimdi bitirip verileri kaydetmek istiyor musunuz?')) endEarly();
  });
  // Dokunmatik / fare desteği (çocuklar için)
  $('stage').addEventListener('pointerdown', () => handleResponse());

  /* ---- Zamanlama yardımcıları ---- */
  function sleepUntil(targetPerf) {
    // setTimeout, sayfa arka plandayken bile çalışır (rAF kısıtlanır);
    // son ~20 ms görsel başlangıcı bir boyamaya hizalamak için rAF ile.
    return new Promise(resolve => {
      let done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      function tick() {
        if (done) return;
        const remaining = targetPerf - performance.now();
        if (remaining <= 0) return finish();
        if (remaining > 20) {
          setTimeout(tick, remaining - 16);
        } else {
          requestAnimationFrame(tick); // boyamaya hizala
          setTimeout(tick, 24);        // rAF kısıtlanırsa güvenlik ağı
        }
      }
      tick();
    });
  }
  const sleep = ms => sleepUntil(performance.now() + ms);

  /* ---- Uyaran gösterimi ---- */
  function setStimulus(animalKey) {
    const el = $('stimulus');
    el.classList.remove('pressed');
    el.innerHTML = animalKey ? ANIMAL_STIMULI[animalKey] : '';
    el.classList.toggle('hidden', !animalKey);
  }
  function showFixation(on) { $('fixation').classList.toggle('hidden', !on); }

  /* ---- Deneme dizileri ---- */
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGoSequence(n) {
    // Go bloğu: her deneme yanıt gerektirir; hayvan rastgele hedef/standart
    const seq = [];
    for (let i = 0; i < n; i++) {
      const useA = Math.random() < 0.5;
      seq.push({
        animal: useA ? C.animals.goBlock.a : C.animals.goBlock.b,
        stimType: 'go',
        requiredResponse: true,
        triggerCode: C.fnirs.triggerCodes.goOnset
      });
    }
    return seq;
  }

  function buildGoNoGoSequence(n) {
    const nTarget = Math.max(1, Math.round(n * C.goNoGoTargetRatio));
    const nStandard = n - nTarget;
    let seq = [];
    for (let i = 0; i < nTarget; i++) seq.push({
      animal: C.animals.target, stimType: 'target', requiredResponse: true,
      triggerCode: C.fnirs.triggerCodes.targetOnset
    });
    for (let i = 0; i < nStandard; i++) seq.push({
      animal: C.animals.standard, stimType: 'standard', requiredResponse: false,
      triggerCode: C.fnirs.triggerCodes.standardOnset
    });
    // Üst üste en fazla 3 No-Go olacak şekilde karıştır
    for (let attempt = 0; attempt < 50; attempt++) {
      shuffle(seq);
      let run = 0, ok = true;
      for (const t of seq) {
        run = t.requiredResponse ? 0 : run + 1;
        if (run > 3) { ok = false; break; }
      }
      if (ok) break;
    }
    return seq;
  }

  /* ---- Tek bloğu çalıştır ---- */
  async function runBlock({ phase, blockSet, blockType, sequence, instructionHTML, feedback }) {
    // Yönerge ekranı
    show('instruction');
    $('instruction').innerHTML = instructionHTML;
    if (phase === 'main') await sleepUntil(performance.now() + C.instructionDuration);
    else await waitForKey(); // alıştırmada katılımcı hazır olunca devam

    show('stage');
    showFixation(true);
    setStimulus(null);
    Triggers.mark(C.fnirs.triggerCodes.blockStart, `blockStart ${blockType}`);

    // Kısa hazırlık boşluğu
    await sleep(500);
    const blockStart = performance.now();
    let pauseOffset = 0;   // duraklamalar nedeniyle biriken kayma

    for (let i = 0; i < sequence.length; i++) {
      if (aborted) return;
      // Deneme öncesi duraklatma kontrolü (zamanlama denemeler arasında kesilir)
      pauseOffset += await waitWhilePaused();
      if (aborted) return;

      const tr = sequence[i];
      const onsetTarget = blockStart + i * SOA + pauseOffset;
      await sleepUntil(onsetTarget);
      if (aborted) return;

      // --- Uyaran başlangıcı ---
      showFixation(false);
      trialOnset = performance.now();
      responded = false; responseRT = null; trialOpen = true;
      setStimulus(tr.animal);
      Triggers.mark(tr.triggerCode, `${blockType}_${tr.stimType}`, { flash: true });

      // --- Uyaran ofset (300 ms) ---
      await sleepUntil(trialOnset + C.stimulusDuration);
      setStimulus(null);
      Triggers.flashPhotodiode(false);
      showFixation(true);

      // --- Yanıt penceresi sonu (SOA = 1000 ms) ---
      await sleepUntil(trialOnset + SOA);
      trialOpen = false;

      const outcome = tr.requiredResponse
        ? (responded ? 'hit' : 'miss')
        : (responded ? 'fa' : 'cr');

      DataLogger.logTrial({
        phase, blockSet, blockType,
        trialInBlock: i + 1,
        animal: tr.animal, stimType: tr.stimType,
        requiredResponse: tr.requiredResponse,
        responded, rt: responseRT,
        outcome,
        onset_perf: trialOnset, onset_unix: Date.now() - Math.round(performance.now() - trialOnset)
      });

      // --- Alıştırma geri bildirimi ---
      if (feedback) {
        const fb = $('feedback');
        const good = outcome === 'hit' || outcome === 'cr';
        fb.textContent = good ? '✓ Aferin!' : (outcome === 'fa' ? '✗ Dur!' : '✗ Bas!');
        fb.className = good ? 'feedback good' : 'feedback bad';
        fb.classList.remove('hidden');
        showFixation(false);
        await sleep(700);
        fb.classList.add('hidden');
        showFixation(true);
      }
    }
    Triggers.mark(C.fnirs.triggerCodes.blockEnd, `blockEnd ${blockType}`);
    showFixation(false);
  }

  /* Devam için tuş bekle (alıştırma yönergeleri) — erken bitişte de çözülür */
  function waitForKey() {
    return new Promise(resolve => {
      function cleanup() {
        window.removeEventListener('keydown', onKey);
        $('instruction').removeEventListener('pointerdown', onPtr);
      }
      function onKey(e) {
        if (paused) return; // duraklatılmışken yönergeyi geçme
        if (C.responseKeys.includes(e.key) || e.key === 'Enter') { cleanup(); resolve(); }
      }
      function onPtr() { if (!paused) { cleanup(); resolve(); } }
      window.addEventListener('keydown', onKey);
      $('instruction').addEventListener('pointerdown', onPtr);
      abortResolvers.push(() => { cleanup(); resolve(); }); // Bitir basıldığında serbest bırak
    });
  }

  /* ---- Yönerge metinleri ---- */
  const animalName = { cat: 'KEDİ', dog: 'KÖPEK', lion: 'ASLAN', elephant: 'FİL', frog: 'KURBAĞA', chicken: 'TAVUK', duck: 'ÖRDEK' };
  function svgInline(key) { return `<span class="mini-animal">${ANIMAL_STIMULI[key]}</span>`; }

  function goInstruction(continueHint) {
    return `<h2>Go Bloğu (Hep Bas)</h2>
      <p>Ekranda hayvanlar belirecek.</p>
      <p><b>Her hayvan göründüğünde</b> ${svgInline(C.animals.goBlock.a)} ${svgInline(C.animals.goBlock.b)}
         hemen <b>${C.responseKeyLabel}</b>na bas!</p>
      <p>Mümkün olduğunca <b>hızlı</b> ol.</p>
      ${continueHint || ''}`;
  }
  function goNoGoInstruction(continueHint) {
    return `<h2>Go / No-Go Bloğu (Bas / Bekle)</h2>
      <p><b>Sadece ${animalName[C.animals.target]} ${svgInline(C.animals.target)} göründüğünde</b> ${C.responseKeyLabel}na bas.</p>
      <p><b>${animalName[C.animals.standard]} ${svgInline(C.animals.standard)} göründüğünde</b> <span class="stop">BASMA, bekle!</span></p>
      ${continueHint || ''}`;
  }
  const hintMain = `<p class="hint">Görev birazdan başlayacak…</p>`;
  const hintPractice = `<p class="hint">Hazır olunca <b>${'BOŞLUK / ekrana dokun'}</b> ile başla.</p>`;

  /* ---- Tam akış ---- */
  async function runPractice() {
    if (!C.practice.enabled) return;
    await runBlock({
      phase: 'practice', blockSet: 0, blockType: 'Go',
      sequence: buildGoSequence(C.practice.goTrials),
      instructionHTML: `<div class="badge">ALIŞTIRMA</div>` + goInstruction(hintPractice),
      feedback: C.practice.feedback
    });
    if (aborted) return;
    await runBlock({
      phase: 'practice', blockSet: 0, blockType: 'GoNoGo',
      sequence: buildGoNoGoSequence(C.practice.goNoGoTrials),
      instructionHTML: `<div class="badge">ALIŞTIRMA</div>` + goNoGoInstruction(hintPractice),
      feedback: C.practice.feedback
    });
    if (aborted) return;
    show('instruction');
    $('instruction').innerHTML = `<h2>Alıştırma bitti 🎉</h2>
      <p>Şimdi <b>asıl görev</b> başlıyor. Bu kez hızlı ve dikkatli ol!</p>
      ${hintPractice}`;
    await waitForKey();
  }

  async function runMain() {
    for (let s = 1; s <= C.numBlockSets; s++) {
      if (aborted) return;
      await runBlock({
        phase: 'main', blockSet: s, blockType: 'Go',
        sequence: buildGoSequence(C.trialsPerBlock),
        instructionHTML: `<div class="badge">Blok Seti ${s}/${C.numBlockSets}</div>` + goInstruction(hintMain),
        feedback: false
      });
      if (aborted) return;
      await runBlock({
        phase: 'main', blockSet: s, blockType: 'GoNoGo',
        sequence: buildGoNoGoSequence(C.trialsPerBlock),
        instructionHTML: `<div class="badge">Blok Seti ${s}/${C.numBlockSets}</div>` + goNoGoInstruction(hintMain),
        feedback: false
      });
      // Setler arası dinlenme (son setten sonra yok)
      if (!aborted && s < C.numBlockSets && C.restDuration > 0) await restPeriod(s);
    }
  }

  /* Setler arası dinlenme dönemi (fNIRS hemodinamik toparlanma) */
  async function restPeriod(afterSet) {
    show('stage');
    setStimulus(null);
    $('feedback').classList.add('hidden');
    showFixation(true);
    $('restMsg').classList.remove('hidden');
    Triggers.mark(C.fnirs.triggerCodes.rest, `rest after set ${afterSet}`);
    const end = performance.now() + C.restDuration;
    while (!aborted && performance.now() < end) {
      if (paused) { await waitWhilePaused(); continue; } // duraklatınca dinlenmeyi beklet
      await sleepUntil(Math.min(end, performance.now() + 200));
    }
    $('restMsg').classList.add('hidden');
    showFixation(false);
  }

  function finish(early = false) {
    show('end');
    const sum = DataLogger.summarize('main');
    const fmt = v => v == null ? '—' : v;
    const pct = v => v == null ? '—' : (v * 100).toFixed(1) + '%';
    const g = sum.Go || {}, ng = sum.GoNoGo || {};
    $('summary').innerHTML = `
      ${early ? '<p class="warn">Görev erken sonlandırıldı (Bitir / ESC). Toplanan veriler korundu.</p>' : '<h2>Görev tamamlandı 🎉</h2>'}
      <table class="summary">
        <tr><th></th><th>Go Bloğu</th><th>Go/No-Go Bloğu</th></tr>
        <tr><td>Doğruluk</td><td>${pct(g.accuracy)}</td><td>${pct(ng.accuracy)}</td></tr>
        <tr><td>Ort. Tepki Süresi (ms)</td><td>${fmt(g.meanRT)}</td><td>${fmt(ng.meanRT)}</td></tr>
        <tr><td>TS Std. Sapma (ms)</td><td>${fmt(g.sdRT)}</td><td>${fmt(ng.sdRT)}</td></tr>
        <tr><td>Omisyon Hatası (kaçırma)</td><td>${fmt(g.omissionErrors)}</td><td>${fmt(ng.omissionErrors)}</td></tr>
        <tr><td>Komisyon Hatası (inhibisyon)</td><td>—</td><td>${fmt(ng.commissionErrors)}</td></tr>
        <tr><td>d′ (duyarlılık)</td><td>—</td><td>${fmt(ng.dPrime)}</td></tr>
      </table>
      <p class="hint">Verileri kaydetmeyi unutma. Okunabilir dosyalar iner:
        <code>_summary.csv</code> (sonuç ölçümleri), <code>_trials.csv</code> (deneme bazlı),
        <code>_events.tsv</code> (fNIRS), <code>_markers.csv</code> (olay işaretleri).</p>`;
  }

  async function start(meta) {
    aborted = false;
    setPaused(false);
    DataLogger.startSession(meta);

    if (C.fnirs.serialTriggers) {
      const ok = await Triggers.connectSerial();
      if (!ok) console.warn('Seri tetikleyici devre dışı; fotodiyot/günlük ile devam.');
    }
    if (C.fullscreenOnStart && document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen(); } catch (e) {}
    }

    await runPractice();
    if (!aborted) await runMain();
    finish(aborted);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  /* ---- Kurulum formu ---- */
  $('startBtn').addEventListener('click', () => {
    const meta = {
      participantId: $('pid').value.trim(),
      sessionId: $('sid').value.trim() || '1',
      group: $('grp').value.trim(),
      age: $('age').value.trim(),
      notes: $('notes').value.trim()
    };
    if (!meta.participantId) { alert('Lütfen Katılımcı No giriniz.'); return; }
    // Yapılandırmayı formdan güncelle
    C.fnirs.serialTriggers = $('serial').checked;
    C.practice.enabled = $('practiceChk').checked;
    let pct = parseInt($('ratio').value, 10);
    if (isNaN(pct)) pct = 75;
    pct = Math.min(90, Math.max(10, pct)); // %10–%90 ile sınırla
    C.goNoGoTargetRatio = pct / 100;
    start(meta);
  });

  $('exportBtn').addEventListener('click', () => DataLogger.exportAll());
  $('restartBtn').addEventListener('click', () => location.reload());

  // Boşluk tuşunun sayfayı kaydırmasını engelle
  window.addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); }, { passive: false });

  // Oran girişine göre canlı Go/No-Go deneme sayısı önizlemesi
  function updateRatioHint() {
    let pct = parseInt($('ratio').value, 10);
    if (isNaN(pct)) pct = 75;
    pct = Math.min(90, Math.max(10, pct));
    const nGo = Math.round(C.trialsPerBlock * pct / 100);
    const nNoGo = C.trialsPerBlock - nGo;
    $('ratioHint').textContent = `≈ %${pct} Go — ${nGo} Go / ${nNoGo} No-Go`;
  }
  $('ratio').addEventListener('input', updateRatioHint);
  updateRatioHint();

  // Bilgi metnini doldur (dinlenmeler dâhil toplam süre)
  const totalSec = C.numBlockSets * 2 * (C.trialsPerBlock * SOA / 1000 + C.instructionDuration / 1000)
    + Math.max(0, C.numBlockSets - 1) * (C.restDuration / 1000);
  $('cfgInfo').textContent =
    `${C.numBlockSets} blok seti × (Go + Go/No-Go) · blok başına ${C.trialsPerBlock} uyaran · ` +
    `${C.stimulusDuration}ms uyaran + ${C.isiDuration}ms ISI · setler arası ${C.restDuration / 1000}sn dinlenme · ` +
    `toplam ≈ ${Math.round(totalSec)} sn`;
})();
