/* ANAS® — THE SERIES · interactions */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Opening sequence ---------- */
  var opening = document.getElementById('opening');
  var profiles = document.getElementById('profiles');
  var entered = false;

  function showProfiles() {
    if (opening) { opening.classList.add('done'); setTimeout(function () { opening.remove(); }, 950); }
    if (profiles) { profiles.hidden = false; }
    document.body.style.overflow = 'hidden';
  }
  function enterHome(profileName) {
    if (entered) return; entered = true;
    if (profiles) profiles.remove();
    if (opening && opening.parentNode) { opening.classList.add('done'); setTimeout(function () { opening.remove(); }, 950); }
    document.body.style.overflow = '';
    initReveals();
    if (profileName) toast('Now watching as ' + profileName + ' — enjoy the series.');
  }

  if (opening) {
    document.body.style.overflow = 'hidden';
    var beats = reduced ? [] : [[300, 1], [1900, 2], [2700, 3], [3400, 4], [4300, 5], [5000, 6]];
    if (reduced) { opening.setAttribute('data-beat', '6'); }
    beats.forEach(function (b) {
      setTimeout(function () { opening.setAttribute('data-beat', String(b[1])); }, b[0]);
    });
    document.getElementById('opening-play').addEventListener('click', showProfiles);
    document.getElementById('opening-skip').addEventListener('click', showProfiles);
    document.addEventListener('keydown', function onKey(e) {
      if ((e.key === 'Escape' || e.key === 'Enter') && document.getElementById('opening')) showProfiles();
    });
  } else { showProfiles(); }

  if (profiles) {
    profiles.querySelectorAll('.profile-card').forEach(function (card) {
      card.addEventListener('click', function () { enterHome(card.getAttribute('data-profile')); });
    });
  }


  if (/[?&]profiles=1/.test(location.search)) { showProfiles(); }
  if (/[?&]skip=1/.test(location.search)) { enterHome(); }
  if (/[?&]flat=1/.test(location.search)) {
    var st = document.createElement('style');
    st.textContent = '.hero{min-height:940px !important}';
    document.head.appendChild(st);
  }
  var navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.addEventListener('click', function () { toast('Profile switch — reload to replay the intro.'); });

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealsDone = false;
  function initReveals() {
    if (revealsDone) return; revealsDone = true;
    var els = document.querySelectorAll('.rv');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    document.documentElement.classList.add('reveal-armed');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
      });
    }, 1600);
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  }

  /* ---------- Nav behavior + scrollspy ---------- */
  var nav = document.getElementById('nav');
  var lastY = window.scrollY, navTick = false;
  window.addEventListener('scroll', function () {
    if (navTick) return; navTick = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      if (y > 140 && y > lastY + 6 && !document.getElementById('nav-links').classList.contains('open')) nav.classList.add('hidden-up');
      else if (lastY - y > 6 || y <= 140) nav.classList.remove('hidden-up');
      lastY = y; navTick = false;
    });
  }, { passive: true });

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id;
      document.querySelectorAll('.nav-link').forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['continue', 'originals', 'picks', 'about', 'skills', 'contact'].forEach(function (id) {
    var s = document.getElementById(id); if (s) spy.observe(s);
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('nav-burger');
  var navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- Rail buttons ---------- */
  document.querySelectorAll('.rail-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = document.getElementById(btn.getAttribute('data-rail'));
      if (!rail) return;
      var dir = parseInt(btn.getAttribute('data-dir'), 10);
      rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.85, 640), behavior: 'smooth' });
    });
  });

  /* ---------- Hero card tilt + parallax chips ---------- */
  var heroCard = document.getElementById('hero-card');
  var heroVisual = document.getElementById('hero-visual');
  if (heroCard && heroVisual && finePointer && !reduced) {
    heroVisual.addEventListener('mousemove', function (e) {
      var r = heroCard.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      heroCard.style.transform = 'perspective(1000px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
    });
    heroVisual.addEventListener('mouseleave', function () { heroCard.style.transform = ''; });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.22).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (dot && ring && finePointer && !reduced) {
    document.body.classList.add('has-cursor');
    var rx = -100, ry = -100, tx = -100, ty = -100;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.opacity = '1'; ring.style.opacity = '1';
      dot.style.transform = 'translate(' + (tx - 4) + 'px,' + (ty - 4) + 'px)';
    });
    (function loop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .poster, .cw-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('grow'); });
    });
  } else {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ---------- Resume modal ---------- */
  var modal = document.getElementById('resume-modal');
  var frame = document.getElementById('resume-frame');
  function openModal() {
    modal.hidden = false;
    if (frame && frame.src !== frame.getAttribute('data-src')) frame.src = frame.getAttribute('data-src');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.hidden = true;
    if (frame) frame.src = 'about:blank';
    document.body.style.overflow = entered ? '' : 'hidden';
  }
  document.querySelectorAll('.btn-open-resume').forEach(function (b) { b.addEventListener('click', openModal); });
  modal.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();
