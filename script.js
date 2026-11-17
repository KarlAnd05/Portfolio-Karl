/* Karl Andraos — portfolio interactions (no libraries) */
(function () {
  'use strict';

  window.__siteReady = true;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- navigation ---------- */
  var nav = document.querySelector('.nav');
  var toggle = nav.querySelector('.nav__toggle');
  var toggleLabel = toggle.querySelector('.nav__toggle-label');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('.nav__menu a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  var desktopNav = window.matchMedia('(min-width: 1181px)');
  var onDesktopNav = function (e) { if (e.matches) setMenu(false); };
  if (desktopNav.addEventListener) desktopNav.addEventListener('change', onDesktopNav);

  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* active section link */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('.nav__links a'));
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        var a = linkFor[entry.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    var hero = document.querySelector('.hero');
    if (hero) spy.observe(hero);
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- reveal on scroll (staggered per group) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function settle(el) {
    // Once revealed, drop the reveal classes so the element gets its own transitions back.
    el.classList.remove('reveal', 'is-in');
    el.style.removeProperty('--d');
  }

  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    el.style.setProperty('--d', Math.min(i * 80, 400) + 'ms');
  });

  if (!hasIO || reduceMotion) {
    reveals.forEach(settle);
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        revealer.unobserve(el);
        el.addEventListener('transitionend', function done(ev) {
          if (ev.target !== el) return;
          el.removeEventListener('transitionend', done);
          settle(el);
        });
        el.classList.add('is-in');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- word cycling (hero role + trilingual greeting) ---------- */
  function cycle(el, items, every, apply) {
    var i = 0;
    window.setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % items.length;
      el.classList.add('is-out');
      window.setTimeout(function () {
        el.classList.remove('is-out');
        el.classList.add('is-below');
        apply(items[i]);
        void el.offsetWidth; // restart the transition from below
        el.classList.remove('is-below');
      }, 500);
    }, every);
  }

  var rotator = document.querySelector('[data-rotate]');
  if (rotator) {
    var roleWord = rotator.querySelector('.rotator__word');
    var roles = rotator.getAttribute('data-rotate').split('|');
    cycle(roleWord, roles, 2800, function (w) { roleWord.textContent = w; });
  }

  var greet = document.querySelector('[data-greet]');
  if (greet) {
    var hellos = [
      { text: 'Hello', lang: 'en' },
      { text: 'Bonjour', lang: 'fr' },
      { text: 'مرحبا', lang: 'ar', dir: 'rtl' }
    ];
    cycle(greet, hellos, 3200, function (h) {
      greet.textContent = h.text;
      greet.setAttribute('lang', h.lang);
      if (h.dir) greet.setAttribute('dir', h.dir); else greet.removeAttribute('dir');
    });
  }

  /* ---------- skills: pick a tool, see where it was used ---------- */
  var BRAIN_DEV = ['Software Developer, Brain SARL', 'Jul 2025 – Present'];
  var BRAIN_INT = ['Internship, Brain SARL', 'May – Jul 2025'];
  var CCSS = ['Internship, CCSS', 'Jun – Aug 2024'];
  var DR_SCOTT = ['Ask Dr. Scott', 'Project · AI mental wellness platform'];
  var LABTRONIC = ['BEL Labtronic Store', 'Project · E-commerce platform'];
  var TACOS = ["Papa's Mia Tacos", 'Project · Ordering and management platform'];

  function use(place, what) { return { where: place[0], when: place[1], what: what }; }

  var USAGE = {
    csharp: { name: 'C#', uses: [
      use(BRAIN_DEV, "Developing and testing the company's Windows application")
    ] },
    javascript: { name: 'JavaScript', uses: [
      use(LABTRONIC, 'Product browsing, ordering and admin management'),
      use(TACOS, 'Online orders, reservations, menus and the management dashboard')
    ] },
    typescript: { name: 'TypeScript', uses: [
      use(LABTRONIC, 'Product browsing, ordering and admin management'),
      use(TACOS, 'Online orders, reservations, menus and the management dashboard')
    ] },
    python: { name: 'Python', uses: [
      use(DR_SCOTT, 'Local AI service: intent classification, RAG retrieval and Ollama responses')
    ] },
    sql: { name: 'SQL', uses: [
      use(BRAIN_DEV, 'SQL queries and stored procedures for the company application'),
      use(BRAIN_INT, 'Database optimisation for a sales analytics web app'),
      use(CCSS, 'A blood bank database'),
      use(LABTRONIC, 'Products, orders and admin data'),
      use(TACOS, 'Orders, reservations, menus, customers and cashier sales')
    ] },
    htmlcss: { name: 'HTML & CSS', uses: [
      use(CCSS, 'Front end of a full-stack desktop and web application'),
      use(LABTRONIC, 'The store interface'),
      use(TACOS, 'The ordering website and dashboard')
    ] },
    aspnet: { name: 'ASP.NET', uses: [
      use(BRAIN_DEV, "The company's Windows application and the APIs it uses")
    ] },
    dotnet: { name: '.NET', uses: [
      use(BRAIN_INT, 'Backend of a sales analytics web application'),
      use(CCSS, 'Backend of a desktop and web application'),
      use(DR_SCOTT, 'Backend API')
    ] },
    react: { name: 'React', uses: [
      use(DR_SCOTT, 'Web and mobile interfaces and a web dashboard')
    ] },
    sqlserver: { name: 'SQL Server', uses: [
      use(BRAIN_DEV, 'Queries, stored procedures and database restores in SSMS'),
      use(CCSS, 'A blood bank database built in SSMS')
    ] },
    postgresql: { name: 'PostgreSQL', uses: [
      use(DR_SCOTT, 'The platform database')
    ] },
    rag: { name: 'RAG', uses: [
      use(DR_SCOTT, 'RAG-based knowledge retrieval for AI coaching')
    ] },
    intent: { name: 'intent classification', uses: [
      use(DR_SCOTT, 'Classifying what each user message is about before answering')
    ] },
    ollama: { name: 'Ollama', uses: [
      use(DR_SCOTT, 'Running Gemma 3 locally for coaching responses')
    ] },
    llm: { name: 'LLMs', uses: [
      use(DR_SCOTT, 'Gemma 3 responses, with safety detection for crisis support')
    ] },
    visualstudio: { name: 'Visual Studio', uses: [
      use(BRAIN_DEV, 'Developing the C# and ASP.NET application'),
      use(CCSS, 'A desktop and web application with a .NET backend')
    ] },
    ssms: { name: 'SSMS', uses: [
      use(BRAIN_DEV, 'SQL queries, stored procedures and database restores'),
      use(CCSS, 'A blood bank database')
    ] },
    windows: { name: 'Windows', uses: [
      use(BRAIN_DEV, "Building and supporting the company's Windows application")
    ] }
  };

  var usage = document.getElementById('usage');
  var aside = document.querySelector('.skills__aside');
  var techButtons = Array.prototype.slice.call(document.querySelectorAll('.tech[data-tech]'));
  var narrow = window.matchMedia('(max-width: 900px)');

  function placeUsage(button) {
    if (!usage || !aside) return;
    if (narrow.matches) {
      var group = button ? button.closest('.skillgroup') : null;
      if (!group) {
        var pressed = document.querySelector('.tech[aria-pressed="true"]');
        group = pressed ? pressed.closest('.skillgroup') : document.querySelector('.skillgroup');
      }
      if (group && group.nextElementSibling !== usage) group.after(usage);
      usage.classList.add('usage--inline');
    } else {
      if (usage.parentElement !== aside) aside.appendChild(usage);
      usage.classList.remove('usage--inline');
    }
    usage.classList.add('is-in');
  }

  function showUsage(key) {
    var data = USAGE[key];
    if (!data || !usage) return;
    usage.querySelector('[data-usage-name]').textContent = data.name;
    var list = usage.querySelector('[data-usage-list]');
    list.textContent = '';
    data.uses.forEach(function (u) {
      var li = document.createElement('li');
      [['usage__where', u.where], ['usage__what', u.what], ['usage__when', u.when]].forEach(function (part) {
        var span = document.createElement('span');
        span.className = part[0];
        span.textContent = part[1];
        li.appendChild(span);
      });
      list.appendChild(li);
    });
    usage.classList.remove('is-swapping');
    void usage.offsetWidth;
    usage.classList.add('is-swapping');
  }

  techButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      techButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      showUsage(btn.getAttribute('data-tech'));
      placeUsage(btn);
    });
  });

  if (usage) {
    placeUsage(null);
    if (narrow.addEventListener) narrow.addEventListener('change', function () { placeUsage(null); });
  }

  /* ---------- contact form: WhatsApp or email, pre-filled ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var lastSend = 'whatsapp';
    form.querySelectorAll('[data-send]').forEach(function (b) {
      b.addEventListener('click', function () { lastSend = b.getAttribute('data-send'); });
    });

    var fields = {
      name: form.querySelector('#f-name'),
      email: form.querySelector('#f-email'),
      message: form.querySelector('#f-msg')
    };

    function setError(input, show) {
      var field = input.closest('.field');
      var err = document.getElementById(input.getAttribute('aria-describedby'));
      field.classList.toggle('has-error', show);
      if (err) err.hidden = !show;
      if (show) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }

    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener('input', function () { setError(fields[k], false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.getAttribute('data-send')) || lastSend;
      var name = fields.name.value.trim();
      var email = fields.email.value.trim();
      var message = fields.message.value.trim();

      var bad = [];
      if (!name) bad.push(fields.name);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(fields.email);
      if (!message) bad.push(fields.message);

      Object.keys(fields).forEach(function (k) { setError(fields[k], bad.indexOf(fields[k]) !== -1); });
      if (bad.length) { bad[0].focus(); return; }

      if (via === 'whatsapp') {
        var text = 'Hi Karl, I\'m ' + name + (email ? ' (' + email + ')' : '') + '.\n\n' + message;
        window.open('https://wa.me/96170285456?text=' + encodeURIComponent(text), '_blank', 'noopener');
      } else {
        var subject = 'Message from ' + name + ' via your portfolio';
        var body = message + '\n\n' + name + (email ? '\n' + email : '');
        window.location.href = 'mailto:karl.andraos05@gmail.com?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
      }
    });
  }

  /* ---------- footer name: fit to the full width ---------- */
  var footName = document.querySelector('.footer__name');
  var footSpan = footName && footName.querySelector('span');
  function fitFooter() {
    if (!footSpan) return;
    footName.style.fontSize = '';
    var target = footName.clientWidth;
    var current = footSpan.getBoundingClientRect().width;
    if (!target || !current) return;
    var size = parseFloat(window.getComputedStyle(footName).fontSize);
    footName.style.fontSize = (size * target / current * 0.995) + 'px';
  }
  if (footSpan) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFooter);
    fitFooter();
    var fitTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(fitFooter, 120);
    });
  }
})();
