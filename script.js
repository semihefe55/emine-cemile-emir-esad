/* ============================================================
   Emine Cemile & Emir Esad — Dijital Davetiye
   Saf JavaScript, bağımlılık yok.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- YAPILANDIRMA ----------------
     Düzenlemek için yalnızca bu bölümü değiştirin.        */
  var CONFIG = {
    siteUrl: 'https://emine-cemile-emir-esad.vercel.app/',
    couple: 'Emine Cemile & Emir Es’ad',
    // Katılım bildirimlerinin ulaşacağı WhatsApp numarası (ülke kodu ile, sadece rakam).
    // Boş bırakılırsa WhatsApp kişi seçme ekranı açılır.
    rsvpWhatsapp: '905541863452',
    // İsteğe bağlı: Formspree/Google Form gibi bir POST adresi. Boşsa form yerel olarak saklanır.
    rsvpEndpoint: '',
    // İletişim: numarası boş olanlar sayfada gösterilmez. Örn. tel: '0532 000 00 00'
    contacts: [
      { name: 'Mesut Gürses', tel: '+90 535 602 04 29' },
      { name: 'İbrahim Çelen', tel: '+90 533 630 03 88' }
    ],
    events: {
      kina: {
        label: 'Kına',
        title: 'Kına Gecesi — Emine Cemile & Emir Es’ad',
        start: '2026-11-27T19:00:00+03:00',
        end:   '2026-11-27T23:00:00+03:00',
        venue: 'Sebla Davet Salonu, Atalar, Üsküdar Cd. No:148, Kartal / İstanbul',
        mapsQuery: 'Sebla Davet Salonu Atalar Üsküdar Cd. No:148 Kartal İstanbul',
        note: 'Kına gecesi hanımlar arasında olacaktır.'
      },
      dugun: {
        label: 'Düğün',
        title: 'Düğün — Emine Cemile & Emir Es’ad',
        start: '2026-11-29T13:30:00+03:00',
        end:   '2026-11-29T17:00:00+03:00',
        venue: 'Vizyon Davet Salonu, Yenişehir Mh., Mustafa Akyol Cd., Grup Center İş Merkezi, Pendik / İstanbul',
        mapsQuery: 'Vizyon Davet Salonu Grup Center İş Merkezi Mustafa Akyol Cd. Yenişehir Pendik İstanbul',
        note: 'Nikâh saati 14.30. Düğünümüz yemeklidir.'
      }
    }
  };
  var WEDDING = new Date(CONFIG.events.dugun.start);

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------------- TOAST ---------------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ============================================================
     1 — SAYFA SİSTEMİ: etkin sayfa, sıralı açılma, noktalar
     ============================================================ */
  var pages = $$('.scene');

  // Her sayfa, davetiye görselindeki motiflerle çerçevelenir.
  pages.forEach(function (sec) {
    var m = document.createElement('div');
    m.className = 'motifs'; m.setAttribute('aria-hidden', 'true');
    [['tl', 'tl'], ['tr', 'tl'], ['bl', 'bl'], ['br', 'bl'], ['ml', 'side'], ['mr', 'side']].forEach(function (p) {
      var im = new Image();
      im.className = 'mo mo-' + p[0]; im.alt = ''; im.decoding = 'async';
      im.src = 'assets/motif-' + p[1] + '.png';
      m.appendChild(im);
    });
    sec.insertBefore(m, sec.firstChild);
  });
  var dotsNav = $('#dots');
  var dotBtns = [];
  var activeIdx = -1;

  // yan noktaları kur
  if (dotsNav) {
    pages.forEach(function (sec, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', (i + 1) + '. sayfa: ' + (sec.dataset.page || ''));
      b.addEventListener('click', function () {
        sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
      dotsNav.appendChild(b);
      dotBtns.push(b);
    });
  }

  function activatePage(sec) {
    if (sec.classList.contains('is-active')) return;
    $$('.rise', sec).forEach(function (el, i) {
      el.style.transitionDelay = reduced ? '0ms' : (70 + i * 70) + 'ms';
    });
    sec.classList.add('is-active');
  }

  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    dotBtns.forEach(function (b, k) {
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
  }

  /* Her karede doğrudan ölçüm yapar.
     Olay tabanlı yöntemde hızlı kaydırmada sayfalar atlanıp boş kalıyordu. */
  function syncPages() {
    var vh = window.innerHeight;
    var locked = document.body.classList.contains('gate-locked');
    var best = 0, bestD = Infinity;

    for (var i = 0; i < pages.length; i++) {
      var r = pages[i].getBoundingClientRect();

      // ekranda ne kadarı görünüyor?
      var vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      var ratio = vis / Math.min(r.height, vh);
      if (!locked && ratio >= 0.3) activatePage(pages[i]);

      var d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = i; }
    }
    setActive(best);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { syncPages(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  syncPages();

  /* ============================================================
     2 — AÇILIŞ: AÇILAN GÜL
     ============================================================ */
  // Sayfa her açılışta baştan başlasın (tarayıcı kaydırma geri yüklemesini kapat)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var gate = $('#gate');
  var gateDone = false;

  function revealHero() {
    var hero = $('#hero');
    if (hero) activatePage(hero);
  }

  function openGate(withMusic) {
    if (!gate || gateDone) return;
    gateDone = true;
    gate.classList.add('is-opening');
    if (withMusic) startMusic(true);

    // gül açılır (0–1.8s) → ışık yayılır → isimler belirir → perde kalkar
    var T = reduced ? [0, 0, 0, 120] : [1450, 1900, 2200, 2700];
    setTimeout(function () {
      document.body.classList.remove('gate-locked');
      window.scrollTo({ top: 0, behavior: 'instant' });   // kilit kalkınca tam tepeye otur
      revealHero();
    }, T[0]);
    setTimeout(function () { gate.classList.add('is-closed'); }, T[1]);
    setTimeout(function () { if (dotsNav) dotsNav.classList.add('is-on'); }, T[2]);
    setTimeout(function () { gate.hidden = true; }, T[3]);

    try { window.sessionStorage.setItem('ee-opened', '1'); } catch (e) {}
  }

  function replayGate() {
    if (!gate) return;
    // Önce anında başa dön: yumuşak kaydırma, sayfa kilitlenince yarıda kalıyor.
    window.scrollTo({ top: 0, behavior: 'instant' });
    gateDone = false;
    gate.hidden = false;
    gate.classList.remove('is-closed');
    void gate.offsetWidth;          // goncayı kapalı hâle döndür
    gate.classList.remove('is-opening');
    document.body.classList.add('gate-locked');
    if (dotsNav) dotsNav.classList.remove('is-on');
    setTimeout(function () { $('#gateOpen') && $('#gateOpen').focus(); }, 60);
  }

  if (gate) {
    // Dinleyiciler her koşulda bağlanır; "açılışı tekrar izle" sonrası da çalışsın diye.
    $('#gateOpen').addEventListener('click', function () { openGate(true); });
    $('#gateSkip').addEventListener('click', function () { openGate(false); });
    gate.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') openGate(false);
    });

    var opened = false;
    try { opened = window.sessionStorage.getItem('ee-opened') === '1'; } catch (e) {}

    if (opened) {
      // Bu oturumda açılış zaten izlendi: doğrudan davetiyeye gir.
      gate.hidden = true;
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.classList.remove('gate-locked');
      gateDone = true;
      revealHero();
      if (dotsNav) dotsNav.classList.add('is-on');
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(function () { $('#gateOpen') && $('#gateOpen').focus(); }, 400);
    }
  }

  var replayBtn = $('#replayBtn');
  if (replayBtn) replayBtn.addEventListener('click', replayGate);
  var topBtn = $('#topBtn');
  if (topBtn) topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ============================================================
     4 — GERİ SAYIM
     ============================================================ */
  var cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  var cdNote = $('#countNote');
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var countBox = $('.count');
  function tick() {
    var diff = WEDDING.getTime() - Date.now();
    if (diff <= 0) {
      if (countBox) countBox.classList.add('is-done');
      if (cdNote) {
        cdNote.hidden = false;
        // düğün günü mü, sonrası mı?
        cdNote.textContent = diff > -21600000 ? 'Bugün, o mutlu gün!' : 'Nice mutlu senelere.';
      }
      return;
    }
    if (countBox) countBox.classList.remove('is-done');
    if (cdNote) cdNote.hidden = true;
    var s = Math.floor(diff / 1000);
    if (cd.d) cd.d.textContent = pad(Math.floor(s / 86400));
    if (cd.h) cd.h.textContent = pad(Math.floor(s % 86400 / 3600));
    if (cd.m) cd.m.textContent = pad(Math.floor(s % 3600 / 60));
    if (cd.s) cd.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ============================================================
     5 — HARİTA
     ============================================================ */
  $$('[data-map]').forEach(function (a) {
    var ev = CONFIG.events[a.dataset.map];
    if (ev) a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ev.mapsQuery);
  });

  /* ---------------- İLETİŞİM ---------------- */
  (function () {
    var ul = $('#contacts');
    if (!ul) return;
    var list = CONFIG.contacts.filter(function (c) { return c.tel; });
    if (!list.length) { ul.hidden = true; return; }
    list.forEach(function (c) {
      var li = document.createElement('li');
      var n = document.createElement('span'); n.className = 'contacts__n'; n.textContent = c.name;
      var a = document.createElement('a'); a.href = 'tel:' + c.tel.replace(/[^\d+]/g, ''); a.textContent = c.tel;
      li.appendChild(n); li.appendChild(a); ul.appendChild(li);
    });
  })();

  /* ============================================================
     6 — TAKVİME EKLE (.ics)
     ============================================================ */
  function icsStamp(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  // Virgül ve noktalı virgül kaçırılmazsa takvim uygulamaları alanı listeye böler.
  function icsEsc(t) {
    return String(t)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }
  // Satırlar 75 okteti geçmemeli; UTF-8 güvenli katlama.
  function icsFold(line) {
    var enc = window.TextEncoder ? new TextEncoder() : null;
    var size = function (str) { return enc ? enc.encode(str).length : str.length; };
    if (size(line) <= 75) return line;
    var out = [], cur = '', limit = 75;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (size(cur + ch) > limit) { out.push(cur); cur = ' '; limit = 74; }
      cur += ch;
    }
    out.push(cur);
    return out.join('\r\n');
  }
  function buildIcs(ev) {
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//eminecemile-emiresad//TR', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '-' + ev.label + '@eminecemile-emiresad',
      'DTSTAMP:' + icsStamp(new Date().toISOString()),
      'DTSTART:' + icsStamp(ev.start),
      'DTEND:' + icsStamp(ev.end),
      'SUMMARY:' + icsEsc(ev.title),
      'LOCATION:' + icsEsc(ev.venue),
      'DESCRIPTION:' + icsEsc(CONFIG.couple + (ev.note ? ' — ' + ev.note : '') + ' — davetiye: ' + CONFIG.siteUrl),
      'URL:' + CONFIG.siteUrl,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEsc(ev.title),
      'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  $$('[data-ics]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ev = CONFIG.events[btn.dataset.ics];
      if (!ev) return;
      var blob = new Blob([buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (btn.dataset.ics === 'kina' ? 'kina-gecesi' : 'dugun') + '-emine-cemile-emir-esad.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      toast('Takvim dosyası indirildi. Açarak takviminize ekleyebilirsiniz.');
    });
  });

  /* ============================================================
     7 — PAYLAŞ
     ============================================================ */
  var shareText = CONFIG.couple + ' düğün davetiyesi · Kına 27 Kasım, Düğün 29 Kasım 2026\n' + CONFIG.siteUrl;
  var shareBtn = $('#shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var wa = 'https://wa.me/?text=' + encodeURIComponent(shareText);
      var win = window.open(wa, '_blank', 'noopener');
      if (!win && navigator.share) {
        navigator.share({ title: CONFIG.couple, text: shareText, url: CONFIG.siteUrl }).catch(function () {});
      } else if (!win) {
        (navigator.clipboard ? navigator.clipboard.writeText(shareText) : Promise.reject())
          .then(function () { toast('Davetiye bağlantısı kopyalandı.'); })
          .catch(function () { toast('Bağlantı: ' + CONFIG.siteUrl); });
      }
    });
  }

  /* ============================================================
     8 — MÜZİK (dosya varsa mp3, yoksa WebAudio ile yumuşak ezgi)
     ============================================================ */
  var musicBtn = $('#musicBtn');
  var audioEl = $('#bgAudio');
  var playing = false;
  var ctx = null, synthTimer = null, master = null;

  var MUSIC_VOL = 0.42;   // arka plan seviyesi
  var LOOP_FADE = 2.4;    // saniye — başta ve sonda yumuşak geçiş
  var envRAF = null;

  // Parçanın başında açılır, sonunda kapanır: döngü dikişi duyulmaz.
  function envelope() {
    if (!audioEl || audioEl.paused) { envRAF = null; return; }
    var d = audioEl.duration, t = audioEl.currentTime, v = MUSIC_VOL;
    if (isFinite(d) && d > LOOP_FADE * 2) {
      if (t < LOOP_FADE) v = MUSIC_VOL * (t / LOOP_FADE);
      else if (d - t < LOOP_FADE) v = MUSIC_VOL * ((d - t) / LOOP_FADE);
    }
    audioEl.volume = Math.max(0, Math.min(1, v));
    envRAF = requestAnimationFrame(envelope);
  }
  function stopEnvelope() {
    if (envRAF) { cancelAnimationFrame(envRAF); envRAF = null; }
  }
  function fadeVolume(el, to, ms) {
    var from = el.volume, t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / ms);
      el.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  // Basit, yumuşak bir arpej — mp3 yoksa devreye girer.
  function synthStart() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      var verb = ctx.createBiquadFilter();
      verb.type = 'lowpass'; verb.frequency.value = 1600;
      master.connect(verb); verb.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.16, ctx.currentTime, 1.2);

    // Hicaz esintili bir dizi
    var scale = [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 554.37, 587.33];
    var step = 0;
    function note() {
      if (!ctx) return;
      var i = [0, 2, 3, 4, 3, 2, 1, 2, 4, 5, 6, 5, 4, 3, 2, 0][step % 16];
      var f = scale[i] * (step % 32 < 16 ? 1 : 0.5);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + 2.6);
      step++;
    }
    note();
    synthTimer = setInterval(note, 900);
    return true;
  }
  function synthStop() {
    clearInterval(synthTimer); synthTimer = null;
    if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
  }

  function setMusicState(on) {
    playing = on;
    if (musicBtn) {
      musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      musicBtn.setAttribute('aria-label', on ? 'Müziği kapat' : 'Müziği aç');
    }
  }

  function startMusic(silentFail) {
    if (playing) return;
    if (audioEl) {
      if (!audioEl.src && audioEl.dataset.src) audioEl.src = audioEl.dataset.src;
      audioEl.volume = 0;
      var p = audioEl.play();
      if (p && p.then) {
        p.then(function () {
          setMusicState(true);
          stopEnvelope();
          envelope();
        }).catch(function () {
          // mp3 yok ya da engellendi → sentezlenmiş ezgi
          if (synthStart()) setMusicState(true);
          else if (!silentFail) toast('Müzik bu cihazda başlatılamadı.');
        });
        return;
      }
    }
    if (synthStart()) setMusicState(true);
  }
  function stopMusic() {
    if (audioEl && !audioEl.paused) {
      stopEnvelope();
      fadeVolume(audioEl, 0, 500);
      setTimeout(function () { audioEl.pause(); }, 520);
    }
    synthStop();
    setMusicState(false);
  }
  if (musicBtn) {
    musicBtn.addEventListener('click', function () { playing ? stopMusic() : startMusic(false); });
  }

  /* ------------------------------------------------------------
     Müziği mümkün olan en erken anda başlat.
     Tarayıcılar sesli otomatik oynatmayı kullanıcı etkileşimi olmadan
     engelliyor (Chrome, Safari, Firefox). Bu yüzden iki aşamalı:
       1) Doğrudan dene — bazı cihazlarda izin verilir, verilmezse sessizce düşer.
       2) İzin verilmediyse ilk dokunuş/kaydırma anında devreye gir.
     Pratikte bu, misafirin güle dokunduğu an demektir.
     ------------------------------------------------------------ */
  (function otomatikSes() {
    if (!musicBtn) return;
    var kuruldu = false;
    var olaylar = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];

    function temizle() {
      olaylar.forEach(function (t) { document.removeEventListener(t, ilkDokunus, true); });
    }
    function ilkDokunus() {
      if (kuruldu) return;
      kuruldu = true;
      temizle();
      startMusic(true);
    }

    // 1) doğrudan deneme
    startMusic(true);

    // 2) engellendiyse ilk etkileşimde
    setTimeout(function () {
      if (playing) return;
      olaylar.forEach(function (t) {
        document.addEventListener(t, ilkDokunus, { capture: true, passive: true });
      });
    }, 400);
  })();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && playing) { stopEnvelope(); if (audioEl) audioEl.pause(); synthStop(); }
    else if (!document.hidden && playing) { if (audioEl && audioEl.src && audioEl.readyState) { audioEl.play().then(function(){ stopEnvelope(); envelope(); }).catch(function(){}); } else if (!synthTimer) synthStart(); }
  });

  /* ============================================================
     9 — KATILIM FORMU (kına ve düğün ayrı)
     ============================================================ */
  var form = $('#rsvpForm');
  var thanks = $('#rsvpThanks');
  var KEYS = ['kina', 'dugun'];

  function box(k)  { return $('input[name="ev-' + k + '"]', form); }
  function body(k) { return $('.rs[data-ev="' + k + '"] .rs__body', form); }

  $$('.stepper__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var input = $('input', b.parentNode);
      var v = parseInt(input.value, 10) || 1;
      input.value = Math.max(1, Math.min(12, v + parseInt(b.dataset.step, 10)));
    });
  });

  function setError(name, msg) {
    var small = $('.err[data-for="' + name + '"]', form);
    if (small) small.textContent = msg || '';
    var field = small ? small.closest('.field') : null;
    if (field) field.classList.toggle('has-error', !!msg);
  }

  function toggleEvent(k) {
    var on = box(k).checked;
    body(k).hidden = !on;
    if (on) {
      // diğer davette ad yazılmışsa burada da hazır gelsin
      var mine = $('#name-' + k), other = $('#name-' + KEYS.filter(function (x) { return x !== k; })[0]);
      if (!mine.value && other && other.value) mine.value = other.value;
    }
    $('#rsvpErr').textContent = '';
  }

  function buildMessage(entries) {
    var lines = ['Düğün Davetiyesi — Katılım Bildirimi'];
    entries.forEach(function (e) {
      lines.push('');
      lines.push(e.label.toUpperCase() + ' — katılacağım');
      lines.push('Ad Soyad: ' + e.name);
      lines.push('Kişi sayısı (siz dahil): ' + e.count);
      if (e.note) lines.push('Not: ' + e.note);
    });
    return lines.join('\n');
  }

  if (form) {
    KEYS.forEach(function (k) { box(k).addEventListener('change', function () { toggleEvent(k); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var entries = [], ok = true, firstBad = null;
      $('#rsvpErr').textContent = '';

      KEYS.forEach(function (k) {
        setError('name-' + k, '');
        if (!box(k).checked) return;
        var name = $('#name-' + k).value.trim();
        if (name.length < 3) {
          setError('name-' + k, 'Lütfen adınızı ve soyadınızı yazın.');
          ok = false; if (!firstBad) firstBad = $('#name-' + k);
        }
        entries.push({
          key: k,
          label: CONFIG.events[k].label,
          name: name,
          count: parseInt($('#count-' + k).value, 10) || 1,
          note: $('#note-' + k).value.trim()
        });
      });

      if (!entries.length) { $('#rsvpErr').textContent = 'Lütfen katılacağınız daveti işaretleyin.'; return; }
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      var data = { entries: entries, at: new Date().toISOString() };
      store('ee-rsvp', JSON.stringify(data));

      if (CONFIG.rsvpEndpoint) {
        fetch(CONFIG.rsvpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).catch(function () { /* sessizce geç: WhatsApp yedeği var */ });
      }

      var msg = buildMessage(entries);
      var wa = CONFIG.rsvpWhatsapp
        ? 'https://wa.me/' + CONFIG.rsvpWhatsapp + '?text=' + encodeURIComponent(msg)
        : 'https://wa.me/?text=' + encodeURIComponent(msg);
      var waBtn = $('#waSend');
      if (waBtn) waBtn.href = wa;

      var total = entries.map(function (x) { return x.label + ' için ' + x.count + ' kişi'; }).join(', ');
      $('#thanksTitle').textContent = 'Teşekkür ederiz, ' + entries[0].name.split(' ')[0];
      $('#thanksText').textContent = 'Katılımınız bizim için çok kıymetli (' + total + '). Sizi aramızda görmeyi sabırsızlıkla bekliyoruz.';

      form.hidden = true;
      thanks.hidden = false;
      var sec = form.closest('.scene');
      if (sec) sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });

    var again = $('#rsvpAgain');
    if (again) again.addEventListener('click', function () {
      thanks.hidden = true;
      form.hidden = false;
      var sec2 = form.closest('.scene');
      if (sec2) sec2.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });

    // Daha önce doldurulmuşsa alanları geri getir
    try {
      var saved = JSON.parse(store('ee-rsvp') || 'null');
      if (saved && saved.entries) {
        saved.entries.forEach(function (en) {
          if (KEYS.indexOf(en.key) < 0) return;
          box(en.key).checked = true;
          $('#name-' + en.key).value = en.name || '';
          $('#count-' + en.key).value = en.count || 1;
          $('#note-' + en.key).value = en.note || '';
          body(en.key).hidden = false;
        });
      }
    } catch (err) {}
  }

  /* ============================================================
     10 — YUMUŞAK ÇAPA KAYDIRMA (kilitliyken engelle)
     ============================================================ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
})();
