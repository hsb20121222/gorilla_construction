/* == Google Translate integration == */
function googleTranslateElementInit() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false
      }, 'google_translate_element');

      const savedLang = localStorage.getItem('site_lang');
      if (savedLang && savedLang !== 'en') {
        document.getElementById('globalLangSelect').value = savedLang;
        setTimeout(() => triggerGoogleTranslation(savedLang), 800);
      }
    }

    function applyGlobalLanguage(langCode) {
      localStorage.setItem('site_lang', langCode);
      triggerGoogleTranslation(langCode);
    }

    function triggerGoogleTranslation(langCode) {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
    }

/* == Main application controller == */
/* ACCESSIBILITY & SETTINGS CONTROLLER */
    function openAccessibilityModal() {
      document.getElementById('accessibilityModal').classList.add('active-modal');
    }

    function closeAccessibilityModal() {
      document.getElementById('accessibilityModal').classList.remove('active-modal');
    }

    function setTheme(mode) {
      const darkBtn = document.getElementById('theme-dark-btn');
      const lightBtn = document.getElementById('theme-light-btn');

      if (mode === 'light') {
        document.body.classList.add('light-theme');
        lightBtn.classList.add('active-opt');
        darkBtn.classList.remove('active-opt');
        localStorage.setItem('pref_theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        darkBtn.classList.add('active-opt');
        lightBtn.classList.remove('active-opt');
        localStorage.setItem('pref_theme', 'dark');
      }
    }

    function setPageZoom(level) {
      document.body.style.zoom = level;
      localStorage.setItem('pref_zoom', level);
    }

    function setFontSize(size) {
      document.documentElement.style.fontSize = size;
      localStorage.setItem('pref_fontsize', size);
    }

    function toggleHighContrast(active) {
      if (active) document.body.classList.add('high-contrast');
      else document.body.classList.remove('high-contrast');
    }

    function toggleDyslexiaFont(active) {
      if (active) document.body.classList.add('dyslexia-font');
      else document.body.classList.remove('dyslexia-font');
    }

    function toggleReduceMotion(active) {
      if (active) document.body.classList.add('reduce-motion');
      else document.body.classList.remove('reduce-motion');
    }

    function toggleAIBotWidget(show) {
      const btn = document.getElementById('aiWidgetBtn');
      if (show) btn.classList.remove('ai-hidden');
      else {
        btn.classList.add('ai-hidden');
        document.getElementById('aiChatWindow').style.display = 'none';
      }
    }

    /* LIGHTBOX CONTROLLER (KEYBOARD + ARROW NAVIGATION) */
    function openLightbox(imgSrc, title, text) {
      var img = document.getElementById('lightboxImg');
      img.src = imgSrc;
      img.alt = title;
      document.getElementById('lightboxTitle').innerText = title;
      document.getElementById('lightboxText').innerText = text;
      document.getElementById('lightboxModal').classList.add('active-lightbox');
      var closeBtn = document.querySelector('.lightbox-close-btn');
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      document.getElementById('lightboxModal').classList.remove('active-lightbox');
    }

    function openLightboxFromCard(cardEl) {
      openLightbox(cardEl.dataset.img, cardEl.dataset.title, cardEl.dataset.desc);
    }

    function lightboxStep(dir) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.gallery-card'));
      if (!cards.length) return;
      var currentSrc = document.getElementById('lightboxImg').getAttribute('src');
      var index = 0;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].getAttribute('data-img') === currentSrc) { index = i; break; }
      }
      var next = cards[(index + dir + cards.length) % cards.length];
      openLightbox(next.getAttribute('data-img'), next.getAttribute('data-title'), next.getAttribute('data-desc'));
    }

    /* GLOBAL KEYBOARD SHORTCUTS */
    document.addEventListener('keydown', function(e) {
      var lb = document.getElementById('lightboxModal');
      if (lb && lb.classList.contains('active-lightbox')) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') lightboxStep(1);
        else if (e.key === 'ArrowLeft') lightboxStep(-1);
        return;
      }
      if (e.key === 'Escape') {
        var modal = document.getElementById('accessibilityModal');
        if (modal && modal.classList.contains('active-modal')) {
          closeAccessibilityModal();
          return;
        }
        var chat = document.getElementById('aiChatWindow');
        if (chat && chat.style.display === 'flex') toggleAIChat();
      }
    });

    /* MOUSE TILT & BACKGROUND PARTICLES */
    const tiltCard = document.getElementById('tiltCard');
    const g1 = document.getElementById('g1');
    const g2 = document.getElementById('g2');

    document.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('reduce-motion')) return;
      
      const { clientX, clientY } = e;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const rotateX = ((clientY / height) - 0.5) * -12;
      const rotateY = ((clientX / width) - 0.5) * 12;

      if (tiltCard && document.getElementById('home').classList.contains('active-section')) {
        tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      const offsetX = (clientX - width / 2) * 0.08;
      const offsetY = (clientY - height / 2) * 0.08;

      if (g1) g1.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      if (g2) g2.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    });

    const particlesContainer = document.getElementById('particles-container');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDuration = `${6 + Math.random() * 10}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      particlesContainer.appendChild(p);
    }

    /* NAVIGATION ROUTER (HASH-BASED: BACK BUTTON + DEEP LINKS) */
    var SECTION_IDS = ['home', 'brief', 'gallery', 'team', 'testing', 'physics'];

    function applySection(targetId) {
      var sections = document.querySelectorAll('.page-section');
      for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active-section');
        sections[i].style.display = 'none';
      }

      var nav = document.getElementById('main-nav');
      if (nav) nav.classList.remove('nav-open');

      var buttons = document.querySelectorAll('.nav-btn');
      for (var j = 0; j < buttons.length; j++) {
        var isActive = buttons[j].id === 'btn-' + targetId;
        buttons[j].classList.toggle('active', isActive);
        if (isActive) {
          buttons[j].setAttribute('aria-current', 'true');
        } else {
          buttons[j].removeAttribute('aria-current');
        }
      }

      var selectedSection = document.getElementById(targetId);
      if (selectedSection) {
        selectedSection.classList.add('active-section');
        selectedSection.style.display = 'block';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function toggleMobileNav() {
      var nav = document.getElementById('main-nav');
      var burger = document.getElementById('navBurger');
      if (!nav) return;
      var open = nav.classList.toggle('nav-open');
      if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    document.addEventListener('click', function(e) {
      var nav = document.getElementById('main-nav');
      if (nav && nav.classList.contains('nav-open') && !e.target.closest('header')) {
        nav.classList.remove('nav-open');
        var burger = document.getElementById('navBurger');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      }
    });

    function switchSection(targetId) {
      if (SECTION_IDS.indexOf(targetId) === -1) return;
      if (location.hash === '#' + targetId) {
        applySection(targetId);
      } else {
        location.hash = targetId;
      }
    }

    window.addEventListener('hashchange', function() {
      var id = location.hash.replace('#', '');
      if (SECTION_IDS.indexOf(id) !== -1) applySection(id);
    });

    /* CAD BLUEPRINT ENGINE */
    var BP_PARTS = {
      tower: {
        title: 'PRIMARY STRAW SUPPORT TOWER',
        text: 'Elevated main truss designed to provide initial potential energy drop height required to clear both loops and funnels.'
      },
      funnels: {
        title: 'INVERTED TRAPEZOID PAPER FUNNELS',
        text: 'Funnel #1 and the larger Funnel #2 feature wide top bases tapering down to narrow exit holes for orbital slowing.'
      },
      loops: {
        title: 'DOUBLE VERTICAL LOOPS',
        text: 'Two 360° inversions stepped in height to ensure kinetic energy overcomes gravity at each loop apex.'
      },
      spirals: {
        title: 'HELICAL SPIRAL & ACCURATE BANANA BASIN',
        text: 'Continuous 3D corkscrew spiral track guiding the marble cleanly into the terminal crescent banana-shaped catch basin.'
      }
    };

    function applyBlueprintHighlight(litParts) {
      ['tower', 'funnels', 'loops', 'spirals'].forEach(function(part) {
        document.getElementById('svg-' + part).style.opacity = litParts[part] ? '1' : '0.25';
      });
    }

    function setBlueprintInfo(part) {
      var p = BP_PARTS[part];
      document.getElementById('bp-info').innerHTML = '<strong>' + p.title + '</strong>' + p.text;
    }

    function updateBlueprint(part, btn) {
      var buttons = document.querySelectorAll('.bp-btn');
      buttons.forEach(function(b) { b.classList.remove('active-bp'); });
      btn.classList.add('active-bp');

      applyBlueprintHighlight({
        tower: part === 'tower',
        funnels: part === 'funnels',
        loops: part === 'loops',
        spirals: part === 'spirals'
      });
      setBlueprintInfo(part);
    }

    /* ==================== ANIMATED TEST MARBLE ==================== */
    var marbleState = { raf: null, running: false, routeLen: null };

    var MARBLE_SEGMENTS = [
      { until: 0.07, part: 'tower' },
      { until: 0.27, part: 'funnels' },
      { until: 0.56, part: 'loops' },
      { until: 0.68, part: 'spirals' },
      { until: 0.90, part: 'funnels' },
      { until: 1.01, part: 'spirals' }
    ];

    function toggleMarbleRun() {
      if (marbleState.running) {
        resetMarble();
      } else {
        startMarble();
      }
    }

    function startMarble() {
      var route = document.getElementById('marble-route');
      if (!route) return;

      if (marbleState.routeLen === null) {
        try { marbleState.routeLen = route.getTotalLength(); } catch (err) { marbleState.routeLen = 0; }
      }
      if (!marbleState.routeLen) return;

      marbleState.running = true;
      var btn = document.getElementById('marbleRunBtn');
      btn.classList.add('running');
      btn.innerHTML = '&#9632; STOP';

      applyBlueprintHighlight({ tower: true, funnels: false, loops: false, spirals: false });
      setBlueprintInfo('tower');

      var len = marbleState.routeLen;
      route.style.strokeDasharray = len;
      route.style.strokeDashoffset = len;

      var dot = document.getElementById('marble-dot');
      var glow = document.getElementById('marble-glow');
      var litParts = { tower: true, funnels: false, loops: false, spirals: false };
      var lastPart = 'tower';
      var DURATION = 9000;
      var startTs = null;

      function frame(ts) {
        if (!marbleState.running) return;
        if (startTs === null) startTs = ts;
        var t = Math.min((ts - startTs) / DURATION, 1);

        var pt = route.getPointAtLength(t * len);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        glow.setAttribute('cx', pt.x);
        glow.setAttribute('cy', pt.y);
        route.style.strokeDashoffset = len * (1 - t);

        var seg = MARBLE_SEGMENTS.find(function(s) { return t <= s.until; });
        if (seg && seg.part !== lastPart) {
          litParts[seg.part] = true;
          applyBlueprintHighlight(litParts);
          setBlueprintInfo(seg.part);
          lastPart = seg.part;
        }

        if (t < 1) {
          marbleState.raf = requestAnimationFrame(frame);
        } else {
          marbleState.running = false;
          celebrateMarble();
          var b = document.getElementById('marbleRunBtn');
          b.classList.remove('running');
          b.innerHTML = '&#8635; RUN AGAIN';
        }
      }
      marbleState.raf = requestAnimationFrame(frame);
    }

    function resetMarble() {
      marbleState.running = false;
      if (marbleState.raf) cancelAnimationFrame(marbleState.raf);

      var route = document.getElementById('marble-route');
      if (route && marbleState.routeLen) route.style.strokeDashoffset = marbleState.routeLen;

      ['marble-dot', 'marble-glow'].forEach(function(id) {
        var el = document.getElementById(id);
        el.setAttribute('cx', '28');
        el.setAttribute('cy', '10');
      });

      document.getElementById('svg-tower').style.opacity = '1';
      document.getElementById('svg-funnels').style.opacity = '0.4';
      document.getElementById('svg-loops').style.opacity = '0.4';
      document.getElementById('svg-spirals').style.opacity = '0.4';
      setBlueprintInfo('tower');

      var btn = document.getElementById('marbleRunBtn');
      btn.classList.remove('running');
      btn.innerHTML = '&#9654; RUN TEST MARBLE';
    }

    /* GORILLA BOT AI ASSISTANT */
    function toggleAIChat() {
      const windowEl = document.getElementById('aiChatWindow');
      if (windowEl.style.display === 'flex') {
        windowEl.style.display = 'none';
      } else {
        windowEl.style.display = 'flex';
        document.getElementById('aiUserInput').focus();
      }
    }

    function handleKeyPress(e) {
      if (e.key === 'Enter') sendAIMessage();
    }

    function askPreset(text) {
      document.getElementById('aiUserInput').value = text;
      sendAIMessage();
    }

    function sendAIMessage() {
      const input = document.getElementById('aiUserInput');
      const text = input.value.trim();
      if (!text) return;

      appendMessage(text, 'user');
      input.value = '';

      const typingId = showTypingIndicator();
      const delay = 450 + Math.min(text.length * 12, 900);

      setTimeout(() => {
        const reply = generateAIResponse(text);
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
          typingEl.classList.remove('typing');
          typingEl.innerHTML = botRender(reply);
        }
        const container = document.getElementById('aiChatMessages');
        container.scrollTop = container.scrollHeight;
      }, delay);
    }

    function showTypingIndicator() {
      const container = document.getElementById('aiChatMessages');
      const msg = document.createElement('div');
      const id = 'msg-' + Date.now();
      msg.id = id;
      msg.className = 'chat-msg bot typing';
      msg.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
      return id;
    }

    function appendMessage(text, sender) {
      const container = document.getElementById('aiChatMessages');
      const msg = document.createElement('div');
      const id = 'msg-' + Date.now();
      msg.id = id;
      msg.className = `chat-msg ${sender}`;
      msg.innerText = text;
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
      return id;
    }

    function botRender(text) {
      const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }

    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    /* ==================== GORILLA BOT BRAIN v2 ==================== */
    function botNormalize(text) {
      return String(text).toLowerCase().replace(/[^a-z0-9# ]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function botLevenshtein(a, b) {
      const m = a.length;
      const n = b.length;
      if (Math.abs(m - n) > 2) return 3;
      if (!m) return n;
      if (!n) return m;
      let prevPrev = null;
      let prev = Array.from({ length: n + 1 }, (_, i) => i);
      let curr = new Array(n + 1).fill(0);
      for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          let v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            v = Math.min(v, prevPrev[j - 2] + 1);
          }
          curr[j] = v;
        }
        prevPrev = prev;
        prev = curr;
        curr = new Array(n + 1).fill(0);
      }
      return prev[n];
    }

    function botScore(text, keywords) {
      const tokens = text.split(' ');
      let score = 0;
      for (const k of keywords) {
        if (k.includes(' ')) {
          if (text.includes(k)) score += 2.5;
          continue;
        }
        for (const tok of tokens) {
          if (tok === k) { score += 1; break; }
          if (k.length >= 5 && tok.length >= 4 && (tok.startsWith(k) || k.startsWith(tok))) { score += 0.6; break; }
          if (k.length >= 5 && tok.length >= 4 && botLevenshtein(tok, k) <= 1) { score += 0.8; break; }
        }
      }
      return score;
    }

    const GORILLA_TRIALS = [
      { n: 1, t: 21.8, note: 'clean run' },
      { n: 2, t: 24.6, note: 'slow funnel exit' },
      { n: 3, t: 22.9, note: 'clean run' },
      { n: 4, t: 20.5, note: 'clipped loop #2' },
      { n: 5, t: 23.0, note: 'clean — the video run' }
    ];

    var botContext = { lastIntent: null };

    function botRunMarble() {
      switchSection('brief');
      setTimeout(function() { if (!marbleState.running) startMarble(); }, 700);
    }

    function botScrollTo(selector, section) {
      switchSection(section);
      setTimeout(function() {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 700);
    }

    var BOT_INTENTS = [
      { id: 'identity', topic: false, kw: ['who are you','your name','what are you','gorilla bot','what is your name'],
        say: "I'm **Gorilla Bot** — part mascot, part build narrator, full-time banana enthusiast. I can run the marble animation, quote trial stats, explain the physics, flip themes, or open any page. Try me." },

      { id: 'run', kw: ['run the marble','run marble','marble run','animate','simulation','simulate','race','launch','release'],
        act: function() { botRunMarble(); },
        say: "Releasing the marble! Watch the blueprint — tower, funnels, loops, spiral, banana. 🏁",
        more: "The animation is a 9-second trace of the real route. RUN TEST MARBLE sits under the blueprint anytime — or just ask me." },

      { id: 'trial', kw: ['trial','attempt','run number'],
        act: function() { switchSection('testing'); },
        say: function(text) {
          const mm = text.match(/(?:trial|run|attempt)\D*(\d+)/) || text.match(/\b([1-5])\b/);
          if (mm) {
            const t = GORILLA_TRIALS.find(x => x.n === parseInt(mm[1], 10));
            if (t) return "Trial " + t.n + ": **" + t.t.toFixed(1) + "s** — " + t.note + ".";
            return "We only ran five trials. Pick a number between 1 and 5!";
          }
          return "Five trials on the final build: 21.8, 24.6, 22.9, 20.5 and **23.0s**. Name a number for details — the table's open below.";
        },
        more: "All five: 21.8 clean, 24.6 slow funnel exit, 22.9 clean, 20.5 clipped loop #2, 23.0 clean. A very consistent bunch of marbles." },

      { id: 'results', kw: ['result','results','score','how fast','fast','time','times','duration','average','record','best','chart','table','graph','long','take','lasts','speed'],
        act: function() { botScrollTo('.chart-box', 'testing'); },
        say: "Headline run: **23.0s** (trial 5 — the video). Fastest 20.5s, slowest 24.6s, average **22.6s**. The target was 2s, so we're calling that a win. Chart's on screen.",
        more: "The 20.5–24.6 spread is mostly funnel exit luck — the orbit count varies by a rotation or two. Marble lottery, but with physics." },

      { id: 'photos', kw: ['photo','photos','picture','pictures','gallery','image','images','pic','pics'],
        act: function() { switchSection('gallery'); },
        say: function() { return pick([
          "Gallery's open — click any photo to zoom. The blurry ones were taken mid-cheer.",
          "Open! Try **loop inspection** — that seam survived the Great Collapse of 11 August."
        ]); },
        more: "Photo 4 is the banana, minutes before its first successful catch. A historical document, really." },

      { id: 'video', kw: ['video','footage','watch','film','recording','movie'],
        act: function() { botScrollTo('.video-wrapper', 'testing'); },
        say: "Rolling footage — on screen now. Real marble, real 23-second glory, real off-camera screaming.",
        more: "Shot in one take on the final build. No reruns, no marble CGI." },

      { id: 'funnel', kw: ['funnel','funnels','orbit','decelerat','trapezoid','trapazoid'],
        say: "Two funnels, two jobs: funnel #1 turns straight speed into slow orbits, funnel #2 does it again near the finish. That's most of our **23 seconds** right there.",
        more: "Funnel physics: straight kinetic energy becomes orbital rotation. A tighter exit hole means a longer orbit — more time on the clock." },

      { id: 'loop', kw: ['loop','loops','invert','360','apex','flip'],
        say: function() { return pick([
          "Two 360° loops, stepped in height. The secret is speed at the **top** — below a minimum apex speed, the marble falls. Loop #2's rebuild is basically the whole Physics page.",
          "Loops are energy snobs: they only work if the marble arrives fast enough. Ours clear because the tower is 45cm and every joint is taped smooth."
        ]); },
        more: "Loop maths: the marble needs v² ≥ g·r at the apex. Ours sits at ~12cm, so only 33cm of the 45cm drop is spendable. The playground demonstrates it live." },

      { id: 'spiral', kw: ['spiral','spirals','corkscrew','helix','twist'],
        say: "The corkscrew is a folded **3D helix** — it drains speed gradually so funnel #2 can catch the marble gently instead of launching it at the banana.",
        more: "Folding it took three attempts. The dash pattern on the blueprint is where the joints nearly didn't survive." },

      { id: 'banana', kw: ['banana','basin','catch','finish','crescent'],
        say: function() { return pick([
          "The banana basin is our greatest achievement. Hyeon-seo shaped it as a crescent so the marble settles in the curve instead of bouncing out. Engineering? Barely. Iconic? Absolutely.",
          "Fun fact: the banana was sketched before the tower was. Priorities. It catches the marble at its slowest point, so nothing ever escapes."
        ]); },
        more: "The crescent curve makes the marble roll along the arc, bleeding the last of its energy, and stop at the low point. Zero escapes so far." },

      { id: 'tower', kw: ['tower','straw','truss','support','structure','logan','built','base'],
        say: "Logan built the straw truss tower with diagonal cross-bracing — after v1 folded like wet cardboard. It is now the strongest 20 straws in Auckland.",
        more: "20 straws, diagonal bracing, A3 base. Logan stress-tested it by leaning on it. It survived Logan." },

      { id: 'materials', kw: ['material','materials','card','sheet','sheets','tape','resource','budget','how many'],
        say: "20/20 straws, **10/10** card sheets, one A3 base and a functionally infinite amount of tape. Nothing was wasted except our first two loops.",
        more: "The tape budget is classified. Let's just say the dispenser filed a complaint." },

      { id: 'physics', kw: ['physics','energy','friction','gravity','potential','kinetic','momentum','science','math','calculation','g force'],
        act: function() { switchSection('physics'); },
        say: "Short version: height becomes speed, friction taxes it, and everything we built — funnels, spirals, loops — spends what's left wisely. Physics page is open; try the **playground** at the bottom.",
        more: "PE at the top ≈ **22 mJ** for the 5g marble. Roughly a quarter is gone by loop #1 — friction is the tax collector." },

      { id: 'playground', kw: ['playground','slider','sliders','calculator','will it clear','experiment','play with'],
        act: function() { botScrollTo('.physics-playground', 'physics'); },
        say: "Playground's live — drag **drop height**, **mass**, **loop radius** and **friction**, and see whether the marble survives loop #2. Spoiler: starve it of height and it stalls.",
        more: "It clears when v² ≥ g·r at the apex after friction losses. The verdict line turns red the moment your tower is too shy." },

      { id: 'height', kw: ['height','tall','45','drop'],
        say: "Tower top: **45cm**. That's the entire energy budget — everything the marble does downstream is bought with that one climb.",
        more: "Loop #2's apex takes 12cm of it, friction takes more. The playground shows the minimum height needed to still clear the loop." },

      { id: 'build', kw: ['build log','timeline','history','when','date','prototype','story','started','begin'],
        say: "28 Jul sketches → 4 Aug tower → 11 Aug loop collapse → 18 Aug funnel tuning (9s → 17s) → 25 Aug first full **23s** run. The honest log is in The Build.",
        more: "Eleven prototypes by our count. We stopped counting when the tape ran out for the third time." },

      { id: 'theme', topic: false, kw: ['dark mode','light mode','theme','dark theme','light theme','colour scheme','color scheme'],
        act: function(text) { setTheme(text.includes('light') ? 'light' : 'dark'); },
        say: function(text) {
          return text.includes('light')
            ? "Light mode engaged. White and yellow — bold choice, very banana."
            : "Back to the dark jungle. The gold glows better here anyway.";
        } },

      { id: 'joke', topic: false, kw: ['joke','funny','pun','laugh','humor','humour'],
        say: function() { return pick([
          "Why did the marble fail loop #1? It didn't have the **velocity** for commitment.",
          "Our risk assessment was one page: 'the marble might escape'. It did. Twice. Case closed."
        ]); } },

      { id: 'help', topic: false, kw: ['help','what can you do','options','menu','ability','abilities','commands','capab','hint'],
        say: "I can: **run the marble**, quote **trial times**, explain **loops / funnels / spirals / the banana**, walk the **build log**, do **physics**, open **photos / results / video**, and flip **dark or light mode**. Or just ask about the banana." },

      { id: 'team', kw: ['team','who','jayden','hyeon','member','people','role','person'],
        act: function() { switchSection('team'); },
        say: "The trio: **Logan** (structure), **Jayden** (physics & maths), **Hyeon-seo** (track geometry + banana design). Weaknesses honestly included on the Team page — open now.",
        more: "Combined weaknesses: slow taping, a guilt-tripping approximation of g, and decorative paper folding. Strengths: the whole coaster." },

      { id: 'thanks', topic: false, kw: ['thank','cheers','cool','awesome','nice','great','love'],
        say: function() { return pick([
          "Appreciated! The banana thanks you too.",
          "We'd say we trained hard, but mostly we just taped things until they worked."
        ]); } },

      { id: 'greet', topic: false, kw: ['hi','hello','hey','yo','sup','greetings','morning'],
        say: function() { return pick([
          "Hey! Welcome to the jungle. Ask me about the loops, the physics — or say **run the marble** and watch.",
          "Greetings, human. I speak fluent roller coaster. Try: **why two funnels?** or **how fast does it go?**"
        ]); } }
    ];

    function botFallback() {
      return pick([
        "Hmm, outside my jungle. I know **loops, funnels, spirals, the banana, trial times, the team, the build log** — or say **run the marble**.",
        "That one's beyond the tape. Try **how fast**, **why two funnels**, **who's on the team** — or **open the photos**."
      ]);
    }

    function generateAIResponse(rawText) {
      const text = botNormalize(rawText);
      let best = null;
      let bestScore = 0;

      for (const intent of BOT_INTENTS) {
        const s = botScore(text, intent.kw);
        if (s > bestScore) { bestScore = s; best = intent; }
      }

      if (best && bestScore >= 0.6) {
        botContext.lastIntent = best.topic === false ? null : best.id;
        if (best.act) best.act(text);
        return typeof best.say === 'function' ? best.say(text) : best.say;
      }

      if (botScore(text, ['more','detail','explain','expand','continue','elaborate','why','how come']) > 0 && botContext.lastIntent) {
        const prev = BOT_INTENTS.find(i => i.id === botContext.lastIntent);
        if (prev && prev.more) return prev.more;
      }

      return botFallback();
    }

    function resetGorillaChat() {
      const container = document.getElementById('aiChatMessages');
      container.innerHTML = '<div class="chat-msg bot">Fresh jungle. I\'m <strong>Gorilla Bot</strong> — ask about the loops, the physics, the results... or the banana. Or just say "run the marble".</div>';
      botContext.lastIntent = null;
    }

    window.addEventListener('DOMContentLoaded', function() {
      var initial = location.hash.replace('#', '');
      applySection(SECTION_IDS.indexOf(initial) !== -1 ? initial : 'home');
      const savedTheme = localStorage.getItem('pref_theme');
      if (savedTheme) setTheme(savedTheme);
      if (localStorage.getItem('pref_sound') === 'off') {
        document.getElementById('soundToggle').checked = false;
      }
      updatePhysicsPlayground();
      initMetricCountUp();
    });

    /* ==================== SOUND (GORILLA ROAR) ==================== */
    var audioCtx = null;

    function soundEffectsEnabled() {
      return localStorage.getItem('pref_sound') !== 'off';
    }

    function toggleSoundEffects(on) {
      localStorage.setItem('pref_sound', on ? 'on' : 'off');
      if (on) triggerGorillaRoar();
    }

    function triggerGorillaRoar() {
      if (!soundEffectsEnabled()) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        var t = audioCtx.currentTime;
        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.0001, t);
        master.gain.exponentialRampToValueAtTime(0.5, t + 0.08);
        master.gain.setValueAtTime(0.5, t + 0.6);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
        master.connect(audioCtx.destination);

        var shaper = audioCtx.createWaveShaper();
        var curve = new Float32Array(64);
        for (var i = 0; i < 64; i++) {
          var x = i / 32 - 1;
          curve[i] = Math.tanh(2.8 * x);
        }
        shaper.curve = curve;
        shaper.connect(master);

        var osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, t);
        osc.frequency.exponentialRampToValueAtTime(48, t + 1.1);
        var oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.55, t);
        osc.connect(oscGain);
        oscGain.connect(shaper);

        var wobble = audioCtx.createOscillator();
        wobble.frequency.value = 11;
        var wobbleGain = audioCtx.createGain();
        wobbleGain.gain.value = 0.22;
        wobble.connect(wobbleGain);
        wobbleGain.connect(oscGain.gain);

        var noiseBuf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 1.3), audioCtx.sampleRate);
        var data = noiseBuf.getChannelData(0);
        for (var j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
        var noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuf;
        var noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 240;
        noiseFilter.Q.value = 0.8;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.05, t + 1.2);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(shaper);

        osc.start(t); wobble.start(t); noise.start(t);
        osc.stop(t + 1.35); wobble.stop(t + 1.35); noise.stop(t + 1.35);

        var logo = document.querySelector('.landing-logo-wrapper');
        if (logo) {
          logo.classList.remove('roar-shake');
          void logo.offsetWidth;
          logo.classList.add('roar-shake');
          setTimeout(function() { logo.classList.remove('roar-shake'); }, 700);
        }
      } catch (err) { /* audio unavailable - stay silent */ }
    }

    /* ==================== PHYSICS PLAYGROUND ==================== */
    function updatePhysicsPlayground() {
      var G = 9.81;
      var h = parseFloat(document.getElementById('ph-height').value);
      var massG = parseFloat(document.getElementById('ph-mass').value);
      var r = parseFloat(document.getElementById('ph-radius').value);
      var friction = parseFloat(document.getElementById('ph-friction').value) / 100;
      var m = massG / 1000;
      var keep = 1 - friction;

      var pe = m * G * h;
      var vBot = Math.sqrt(2 * G * h * keep);
      var vApex = (h > 2 * r) ? Math.sqrt(2 * G * (h - 2 * r) * keep) : 0;
      var hMin = 2 * r + r / (2 * keep);
      var clears = (h - 2 * r > 0) && (vApex * vApex >= G * r);

      document.getElementById('ph-h-out').textContent = h.toFixed(2);
      document.getElementById('ph-m-out').textContent = massG;
      document.getElementById('ph-r-out').textContent = r.toFixed(3);
      document.getElementById('ph-f-out').textContent = Math.round(friction * 100);
      document.getElementById('ph-pe').textContent = (pe * 1000).toFixed(1) + ' mJ';
      document.getElementById('ph-vbot').textContent = vBot.toFixed(2) + ' m/s';
      document.getElementById('ph-vapex').textContent = vApex.toFixed(2) + ' m/s';
      document.getElementById('ph-hmin').textContent = hMin.toFixed(2) + ' m';

      var verdict = document.getElementById('ph-verdict');
      if (clears) {
        verdict.textContent = '✔ CLEARS THE LOOP — ' + (h - hMin).toFixed(2) + ' m to spare. Gorilla approved.';
        verdict.className = 'physics-verdict pass';
      } else {
        verdict.textContent = '✘ STALLS AT THE APEX — raise the tower by at least ' + Math.max(hMin - h, 0).toFixed(2) + ' m (or beg the marble).';
        verdict.className = 'physics-verdict fail';
      }
    }

    /* ==================== CLICKABLE BLUEPRINT ==================== */
    function inspectBlueprintPart(part) {
      if (marbleState.running) return;
      var order = ['tower', 'funnels', 'loops', 'spirals'];
      var buttons = document.querySelectorAll('.bp-btn');
      buttons.forEach(function(b, i) {
        b.classList.toggle('active-bp', order[i] === part);
      });
      var lit = {};
      order.forEach(function(p) { lit[p] = (p === part); });
      applyBlueprintHighlight(lit);
      setBlueprintInfo(part);
    }

    /* ==================== CONFETTI (BANANA LANDING) ==================== */
    function celebrateMarble() {
      if (document.body.classList.contains('reduce-motion')) return;
      var dotEl = document.getElementById('marble-dot');
      var svgEl = document.querySelector('.blueprint-svg');
      if (!dotEl || !svgEl) return;
      var svgRect = svgEl.getBoundingClientRect();
      if (svgRect.bottom < 0 || svgRect.top > window.innerHeight) return;
      var r = dotEl.getBoundingClientRect();
      var originX = r.left + r.width / 2;
      var originY = r.top + r.height / 2;

      var colors = ['#e5b800', '#ffe600', '#ffd000', '#ffffff', '#b39000'];
      for (var i = 0; i < 36; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece' + (i % 3 === 0 ? ' round' : '');
        piece.style.left = originX + 'px';
        piece.style.top = originY + 'px';
        piece.style.background = colors[i % colors.length];
        document.body.appendChild(piece);

        var angle = Math.random() * Math.PI * 2;
        var dist = 60 + Math.random() * 130;
        var dx = Math.cos(angle) * dist;
        var dy = Math.sin(angle) * dist * 0.6 + 120;
        piece.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(' + (360 + Math.random() * 360) + 'deg) scale(0.6)', opacity: 0 }
        ], {
          duration: 900 + Math.random() * 700,
          easing: 'cubic-bezier(0.15, 0.65, 0.4, 1)',
          fill: 'forwards'
        }).onfinish = function() { this.remove(); };
      }
    }

    /* ==================== METRIC COUNT-UP ==================== */
    function initMetricCountUp() {
      var cards = document.querySelectorAll('.metric-card h4[data-count]');
      if (!cards.length || !('IntersectionObserver' in window)) return;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          var el = entry.target;
          if (document.body.classList.contains('reduce-motion')) return;
          var target = parseFloat(el.getAttribute('data-count'));
          var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var start = null;
          var DURATION = 1100;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / DURATION, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.4 });
      cards.forEach(function(c) { observer.observe(c); });
    }
