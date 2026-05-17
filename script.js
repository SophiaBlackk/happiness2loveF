/* ═══════════════════════════════════════════════════
   戀愛與幸福感 · 青春情感研究報告
   script.js — 互動邏輯
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 閱讀進度條 ── */
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ── Nav 捲動效果 ── */
  const nav = document.getElementById('main-nav');
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }

  /* ── Nav 活躍連結高亮 ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--rose-gold)';
      }
    });
  }

  /* ── 手機選單開關 ── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinksEl = document.getElementById('nav-links');
  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      navLinksEl.classList.toggle('open');
    });
    navLinksEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinksEl.classList.remove('open'));
    });
  }

  /* ── 滾動進入動畫（Intersection Observer）── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── 長條圖動畫（進入視窗才觸發）── */
  function animateBars(container) {
    container.querySelectorAll('.bar-fill, .persp-bar-fill').forEach(bar => {
      const targetWidth = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = targetWidth; }, 100);
    });
  }

  /* 雙刃劍背景條動畫 */
  function animateBladeBars(container) {
    container.querySelectorAll('.blade-bar').forEach(bar => {
      const targetWidth = bar.style.getPropertyValue('--w') || '0%';
      bar.style.width = '0';
      setTimeout(() => {
        bar.style.transition = 'width 1.2s ease';
        bar.style.width = targetWidth;
      }, 120);
    });
  }

  /* 使用 IntersectionObserver 監控需要動畫的區塊 */
  const animTargets = [
    { selector: '#portrait',     fn: animateBars },
    { selector: '#perspectives', fn: animateBars },
    { selector: '#double-edge',  fn: animateBladeBars },
  ];
  animTargets.forEach(({ selector, fn }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fn(el);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
  });

  /* ── 故事卡片微動態（游標靠近傾斜效果）── */
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      card.style.transform = `translateY(-4px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease, box-shadow 0.3s ease';
    });
  });

  /* ── 詞雲：滑過打散再聚合 ── */
  function bindWordCloudBurst(selector, className, clearDelay) {
    const panel = document.querySelector(selector);
    if (!panel) return;

    let burstTimer = null;
    const triggerBurst = () => {
      panel.classList.remove(className);
      void panel.offsetWidth; // force reflow to restart animation
      panel.classList.add(className);
      clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        panel.classList.remove(className);
      }, clearDelay);
    };

    panel.addEventListener('pointerenter', triggerBurst);
    panel.addEventListener('focusin', triggerBurst);
  }

  bindWordCloudBurst('.story-word-cloud-panel', 'is-bursting', 2250);
  bindWordCloudBurst('.custom-word-cloud', 'is-bursting', 2300);

  /* ── 平滑錨點捲動（補充 CSS scroll-behavior 在 Safari 的支援）── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ── 統計數字計數動畫 ── */
  function animateCounter(el) {
    const raw = el.textContent.replace(/[^0-9.]/g, '');
    if (!raw) return;
    const target = parseFloat(raw);
    const isFloat = raw.includes('.');
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = target * ease;
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.stat-num, .ohc-num').forEach(el => {
          /* 保存 sup 子元素 */
          const sup = el.querySelector('sup');
          const supText = sup ? sup.outerHTML : '';
          const numEl = document.createElement('span');
          numEl.textContent = el.textContent.replace(/[^0-9.]/g, '');
          el.innerHTML = '';
          el.appendChild(numEl);
          if (supText) el.insertAdjacentHTML('beforeend', supText);
          animateCounter(numEl);
        });
        counterObs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('#origin, #portrait').forEach(sec => {
    if (sec) counterObs.observe(sec);
  });

  /* ── 手帳浮點裝飾（Hero 區飄浮小愛心）── */
  function spawnFloatingHeart() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const count = Math.random() > 0.45 ? 2 : 1;
    const symbols = ['♡', '♥', '✦', '❥', '✿'];
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      const isMint = Math.random() > 0.5;
      const color = isMint ? 'rgba(138,181,162,0.96)' : 'rgba(232,144,90,0.96)';
      const glow = isMint ? 'rgba(184,212,200,0.52)' : 'rgba(242,196,168,0.5)';
      const size = 1 + Math.random() * 0.9;
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.setProperty('--drift', (-28 + Math.random() * 56).toFixed(1) + 'px');
      heart.style.setProperty('--turn', (-12 + Math.random() * 24).toFixed(1) + 'deg');
      Object.assign(heart.style, {
        position: 'absolute',
        left: (6 + Math.random() * 88) + '%',
        bottom: (8 + Math.random() * 10) + '%',
        fontSize: size + 'rem',
        color,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: `floatUp ${4.8 + Math.random() * 2.6}s cubic-bezier(.21,.61,.35,1) forwards`,
        zIndex: '6',
        textShadow: `0 0 10px ${glow}, 0 0 18px ${glow}`,
        filter: `drop-shadow(0 0 8px ${glow})`,
      });
      hero.appendChild(heart);
      setTimeout(() => heart.remove(), 7600);
    }
  }

  /* 添加 keyframe 到 document */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0%   { opacity: 0; transform: translate3d(0, 0, 0) scale(0.72) rotate(0deg); }
      14%  { opacity: 0.98; }
      82%  { opacity: 0.5; }
      100% { opacity: 0; transform: translate3d(var(--drift, 0px), -240px, 0) scale(1.16) rotate(var(--turn, 12deg)); }
    }
  `;
  document.head.appendChild(style);

  /* 每隔一小段時間在 Hero 區飄出更多亮色符號（只在 Hero 可見時） */
  let heartInterval = null;
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!heartInterval) {
        for (let i = 0; i < 4; i++) {
          setTimeout(spawnFloatingHeart, i * 180);
        }
        heartInterval = setInterval(spawnFloatingHeart, 1400);
      }
    } else {
      clearInterval(heartInterval);
      heartInterval = null;
    }
  }, { threshold: 0.3 });
  const heroEl = document.querySelector('.hero');
  if (heroEl) heroObserver.observe(heroEl);

  /* ── 統一 scroll 監聽 ── */
  function onScroll() {
    updateProgress();
    updateNav();
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初始化

})();
