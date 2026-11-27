/* ==========================================================
   PORTFOLIO ENGINE — JAVAKAR S
   Cyber-Architect / Interactive Features (Vanilla ES6+)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const audio = initAudioEngine();
  initNeuralCanvas();
  initSpotlightEffect();
  initTypewriter();
  initInteractiveTerminal(audio);
  initGestureCanvasSimulator(audio);
  initCommandPalette(audio);
  initThemeToggle(audio);
  initMobileNav(audio);
  initMetricCounters();
  initDirectCopy(audio);
  initContactForm(audio);
  initGlobalShortcuts();
  updateCurrentYear();
});

/* ---------------- 1. AUDIO SYNTHESIZER ENGINE (Web Audio API) ---------------- */
function initAudioEngine() {
  let audioCtx = null;
  let soundEnabled = true;

  const toggleBtn = document.getElementById('sound-toggle');
  const soundStatus = document.getElementById('sound-status');
  const soundIcon = document.getElementById('sound-icon');

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const soundApi = {
    click: () => playTone(600, 'sine', 0.04, 0.03),
    terminalKey: () => playTone(850, 'triangle', 0.03, 0.02),
    commandSuccess: () => {
      playTone(520, 'sine', 0.06, 0.04);
      setTimeout(() => playTone(880, 'sine', 0.1, 0.04), 60);
    },
    switchTheme: () => playTone(440, 'sine', 0.1, 0.04),
    toggleSound: () => {
      soundEnabled = !soundEnabled;
      if (soundStatus) soundStatus.textContent = soundEnabled ? 'ON' : 'OFF';
      if (soundIcon) {
        soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      }
      if (soundEnabled) playTone(750, 'sine', 0.08, 0.05);
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      soundApi.toggleSound();
    });
  }

  return soundApi;
}

/* ---------------- 2. NEURAL CONSTELLATION CANVAS PHYSICS ---------------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 35 : 75;
  const maxDistance = 140;

  const mouse = { x: null, y: null, radius: 160 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 1.8 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse collision repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = (dx / distance) * force * 1.5;
          const directionY = (dy / distance) * force * 1.5;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw() {
      const isDark = document.body.getAttribute('data-theme') !== 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isDark = document.body.getAttribute('data-theme') !== 'light';
    const lineColor = isDark ? 'rgba(6, 182, 212, ' : 'rgba(99, 102, 241, ';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * (isDark ? 0.25 : 0.15);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `${lineColor}${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ---------------- 3. SPOTLIGHT HOVER EFFECT ---------------- */
function initSpotlightEffect() {
  const cards = document.querySelectorAll('[data-spotlight]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ---------------- 4. DYNAMIC TYPEWRITER EFFECT ---------------- */
function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const roles = [
    'Full-Stack Developer (MERN)',
    'AI & Data Science Student',
    '2x SIH Finalist Engineer',
    'Published Research Author',
    'Java & Python Problem Solver'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 100;

  function tick() {
    const current = roles[roleIdx];

    if (isDeleting) {
      target.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      delay = 45;
    } else {
      target.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      delay = 95;
    }

    if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      delay = 1800; // Pause after full phrase
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  tick();
}

/* ---------------- 5. INTERACTIVE CYBER TERMINAL ---------------- */
function initInteractiveTerminal(audio) {
  const input = document.getElementById('terminal-inline-input');
  const output = document.getElementById('term-dynamic-output');
  const chips = document.querySelectorAll('.cmd-chip');
  const launchBtn = document.getElementById('launch-cli-btn');

  if (!input || !output) return;

  const commands = {
    help: () => `
      <div class="hl-cyan">&gt; AVAILABLE SYSTEM COMMANDS:</div>
      <div>&bull; <strong class="hl-cmd">skills</strong> &mdash; Comprehensive engineering radar</div>
      <div>&bull; <strong class="hl-cmd">projects</strong> &mdash; Production client systems &amp; prototypes</div>
      <div>&bull; <strong class="hl-cmd">sih</strong> &mdash; Smart India Hackathon milestones (2024 &amp; 2025)</div>
      <div>&bull; <strong class="hl-cmd">book</strong> &mdash; Published cyber security research chapter</div>
      <div>&bull; <strong class="hl-cmd">contact</strong> &mdash; Direct communication channels</div>
      <div>&bull; <strong class="hl-cmd">hire</strong> &mdash; Open email dispatch for opportunities</div>
      <div>&bull; <strong class="hl-cmd">matrix</strong> &mdash; Trigger neural stream sequence</div>
      <div>&bull; <strong class="hl-cmd">clear</strong> &mdash; Clear terminal buffer</div>
    `,
    whoami: () => `
      <div><strong>Javakar S</strong> &mdash; Computer Science (AI &amp; Data Science) at KPR College, Coimbatore.</div>
      <div>MERN Stack Developer, competitive programmer with 50+ HackerRank Java solutions, and real-world client consultant.</div>
    `,
    about: () => `
      <div><strong>Javakar S</strong> &mdash; Computer Science (AI &amp; Data Science) at KPR College, Coimbatore.</div>
      <div>MERN Stack Developer, competitive programmer with 50+ HackerRank Java solutions, and real-world client consultant.</div>
    `,
    skills: () => `
      <div class="hl-cyan">&gt; PRODUCTION STACK MATRIX:</div>
      <div>&bull; <strong>Web:</strong> React.js, Node.js, Express.js, MongoDB, JavaScript (ES6+), HTML5, CSS3</div>
      <div>&bull; <strong>Core:</strong> Java (OOP), Python, Data Structures, System Debugging, CRUD Operations</div>
      <div>&bull; <strong>AI/CV:</strong> OpenCV, MediaPipe 21 Landmark Hand Tracking</div>
      <div>&bull; <strong>Tools:</strong> Git, GitHub, REST APIs, VS Code</div>
    `,
    projects: () => `
      <div class="hl-cyan">&gt; KEY DELIVERED ARCHITECTURES:</div>
      <div>1. <strong class="hl-cmd">New Standard Electrical Works</strong> &mdash; Commercial client management software</div>
      <div>2. <strong class="hl-cmd">College Bus Management System</strong> &mdash; Full-Stack MERN transportation platform</div>
      <div>3. <strong class="hl-cmd">Hand Gesture Control System</strong> &mdash; Real-time touch-free air-canvas (Python/OpenCV)</div>
      <div>4. <strong class="hl-cmd">Saiket Systems</strong> &mdash; 21 Days Software Engineering Internship</div>
    `,
    sih: () => `
      <div class="hl-cyan">&gt; SMART INDIA HACKATHON RECORD:</div>
      <div>&bull; <strong class="hl-cmd">SIH 2025:</strong> Shortlisted for consecutive national edition</div>
      <div>&bull; <strong class="hl-cmd">SIH 2024:</strong> Shortlisted in nationwide university rounds</div>
      <div>&bull; <strong class="hl-cmd">Adobe Hackathon:</strong> Active participant in design &amp; algorithmic challenges</div>
    `,
    book: () => `
      <div class="hl-cyan">&gt; RESEARCH PUBLICATION:</div>
      <div>&bull; Chapter: <em>"Battle for Digital: AI vs Cybercrime – The Safety"</em></div>
      <div>&bull; Volume: <strong>Data Science in Cyber Security</strong></div>
      <div>&bull; Focus: Machine learning threat models &amp; defensive safety paradigms.</div>
    `,
    contact: () => `
      <div class="hl-cyan">&gt; DIRECT TELEMETRY:</div>
      <div>&bull; Email: <a href="mailto:javakar00@gmail.com" class="hl-cmd">javakar00@gmail.com</a></div>
      <div>&bull; Phone: <strong class="hl-cmd">+91 8122673732</strong></div>
      <div>&bull; Location: Coimbatore, Tamil Nadu, India</div>
    `,
    hire: () => {
      setTimeout(() => {
        window.location.href = 'mailto:javakar00@gmail.com?subject=Opportunity%20Inquiry%20for%20Javakar%20S';
      }, 500);
      return `<div class="hl-cyan">&gt; Initiating direct mail prompt to javakar00@gmail.com...</div>`;
    },
    matrix: () => {
      let count = 0;
      const interval = setInterval(() => {
        const stream = Array.from({ length: 40 }, () =>
          Math.random() > 0.5 ? '1' : '0'
        ).join('');
        appendLine(`stream[${count}] &gt; <span style="color:#10b981; font-family: monospace;">${stream}</span>`);
        count++;
        if (count > 5) clearInterval(interval);
      }, 70);
      return `<div class="hl-cyan">&gt; Connecting to neural telemetry stream...</div>`;
    },
    clear: () => {
      output.innerHTML = '';
      return '';
    }
  };

  function appendLine(htmlContent) {
    const row = document.createElement('div');
    row.className = 'term-line';
    row.innerHTML = htmlContent;
    output.appendChild(row);

    const screen = document.getElementById('hero-terminal-screen');
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    audio.commandSuccess();

    appendLine(`<span class="term-prompt">visitor@javakar:~$</span> <span class="term-text hl-cyan">${escapeHtml(cmd)}</span>`);

    if (commands[cmd]) {
      const res = commands[cmd]();
      if (res) {
        appendLine(`<div class="term-output">${res}</div>`);
      }
    } else {
      appendLine(`<div class="term-output" style="color:#f87171;">Command '${escapeHtml(cmd)}' not found. Type <strong class="hl-cmd">'help'</strong> for valid commands.</div>`);
    }

    input.value = '';
  }

  input.addEventListener('keydown', (e) => {
    audio.terminalKey();
    if (e.key === 'Enter') {
      executeCommand(input.value);
    }
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        input.focus();
      }
    });
  });

  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      executeCommand('help');
    });
  }
}

/* ---------------- 6. INTERACTIVE COMPUTER VISION AIR-CANVAS SIMULATOR ---------------- */
function initGestureCanvasSimulator(audio) {
  const canvas = document.getElementById('gesture-sim-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hudText = document.getElementById('gesture-hud-text');
  const btnDraw = document.getElementById('lab-draw-mode');
  const btnErase = document.getElementById('lab-erase-mode');
  const btnClear = document.getElementById('lab-clear-canvas');

  let mode = 'draw'; // 'draw' or 'erase'
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 140;
    // Initial welcome sketch
    drawWelcomeStroke();
  }

  function drawWelcomeStroke() {
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 70);
    ctx.bezierCurveTo(90, 20, 150, 120, 220, 60);
    ctx.stroke();

    ctx.fillStyle = '#06b6d4';
    ctx.font = '12px JetBrains Mono';
    ctx.fillText('⚡ Gesture Simulator Active', 30, 100);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    audio.click();
  });

  canvas.addEventListener('mousemove', (e) => {
    const pos = getPos(e);
    if (hudText) {
      hudText.innerHTML = `HAND LANDMARK [ID:8 Index]: X: ${Math.round(pos.x)} | Y: ${Math.round(pos.y)} (${mode.toUpperCase()} MODE)`;
    }

    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);

    if (mode === 'draw') {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
    } else {
      ctx.strokeStyle = '#04060a';
      ctx.lineWidth = 18;
      ctx.shadowBlur = 0;
    }
    ctx.lineCap = 'round';
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  });

  window.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  if (btnDraw) {
    btnDraw.addEventListener('click', () => {
      mode = 'draw';
      btnDraw.classList.add('active');
      btnErase?.classList.remove('active');
      audio.click();
    });
  }

  if (btnErase) {
    btnErase.addEventListener('click', () => {
      mode = 'erase';
      btnErase.classList.add('active');
      btnDraw?.classList.remove('active');
      audio.click();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      audio.click();
      if (hudText) hudText.textContent = 'CANVAS CLEARED. Move pointer to draw gestures.';
    });
  }
}

/* ---------------- 7. COMMAND PALETTE (CTRL+K / ⌘K) ---------------- */
function initCommandPalette(audio) {
  const overlay = document.getElementById('cmd-overlay');
  const triggerBtn = document.getElementById('cmd-trigger');
  const input = document.getElementById('cmd-input');
  const results = document.getElementById('cmd-results');

  if (!overlay || !input || !results) return;

  const commandItems = [
    { title: 'Navigate: Featured Architecture & Works', icon: 'fa-laptop-code', link: '#bento', group: 'Navigation' },
    { title: 'Navigate: Published Research Chapter', icon: 'fa-book-bookmark', link: '#research', group: 'Navigation' },
    { title: 'Navigate: Hackathons (SIH 2024 & 2025)', icon: 'fa-trophy', link: '#hackathons', group: 'Navigation' },
    { title: 'Navigate: Capabilities & Engineering Matrix', icon: 'fa-microchip', link: '#capabilities', group: 'Navigation' },
    { title: 'Navigate: Academic Journey & Clubs', icon: 'fa-graduation-cap', link: '#journey', group: 'Navigation' },
    { title: 'Action: Contact / Hire Javakar', icon: 'fa-paper-plane', link: '#contact', group: 'Actions' },
    { title: 'Action: Copy Email (javakar00@gmail.com)', icon: 'fa-envelope', action: 'copy-email', group: 'Actions' },
    { title: 'Action: Toggle Theme (Dark / Light)', icon: 'fa-circle-half-stroke', action: 'toggle-theme', group: 'Actions' },
    { title: 'External: Open LinkedIn Profile', icon: 'fa-brands fa-linkedin', link: 'https://linkedin.com/in/javakar-s-51949038b', external: true, group: 'External' },
    { title: 'External: Open LeetCode Profile', icon: 'fa-code', link: 'https://leetcode.com/u/Javakar_S', external: true, group: 'External' },
    { title: 'External: Open HackerRank Profile', icon: 'fa-brands fa-hackerrank', link: 'https://hackerrank.com/profile/javakar_28k24', external: true, group: 'External' }
  ];

  let selectedIdx = 0;

  function renderList(query = '') {
    const q = query.trim().toLowerCase();
    const filtered = commandItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      results.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#64748b; font-size:0.9rem;">No matching commands found.</div>`;
      return;
    }

    let html = '';
    let currentGroup = '';

    filtered.forEach((item, idx) => {
      if (item.group !== currentGroup) {
        currentGroup = item.group;
        html += `<div class="cmd-group-title">${currentGroup}</div>`;
      }
      const isSelected = idx === selectedIdx ? 'selected' : '';
      html += `
        <div class="cmd-item ${isSelected}" data-index="${idx}">
          <div class="cmd-item-left">
            <i class="fa-solid ${item.icon}"></i>
            <span>${escapeHtml(item.title)}</span>
          </div>
          <span class="cmd-item-key">ENTER</span>
        </div>
      `;
    });

    results.innerHTML = html;

    // Attach click listeners
    const itemElements = results.querySelectorAll('.cmd-item');
    itemElements.forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        executeItem(filtered[idx]);
      });
    });
  }

  function executeItem(item) {
    if (!item) return;
    audio.click();
    closePalette();

    if (item.action === 'copy-email') {
      navigator.clipboard.writeText('javakar00@gmail.com');
      showToast('Copied javakar00@gmail.com to clipboard!');
    } else if (item.action === 'toggle-theme') {
      document.getElementById('theme-toggle')?.click();
    } else if (item.external) {
      window.open(item.link, '_blank');
    } else if (item.link) {
      window.location.hash = item.link;
    }
  }

  function openPalette() {
    overlay.classList.add('active');
    input.value = '';
    selectedIdx = 0;
    renderList('');
    audio.click();
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    overlay.classList.remove('active');
  }

  triggerBtn?.addEventListener('click', openPalette);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
  });

  input.addEventListener('input', () => {
    selectedIdx = 0;
    renderList(input.value);
  });

  window.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('active')) {
        closePalette();
      } else {
        openPalette();
      }
    }

    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closePalette();
    }

    if (!overlay.classList.contains('active')) return;

    const items = results.querySelectorAll('.cmd-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % items.length;
      updateSelected(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      updateSelected(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[selectedIdx]?.click();
    }
  });

  function updateSelected(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIdx);
      if (idx === selectedIdx) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}

/* ---------------- 8. THEME TOGGLE (DARK / LIGHT TITANIUM) ---------------- */
function initThemeToggle(audio) {
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  const saved = localStorage.getItem('javakar_theme') || 'dark';
  body.setAttribute('data-theme', saved);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
      localStorage.setItem('javakar_theme', next);
      audio.switchTheme();
    });
  }
}

/* ---------------- 9. MOBILE NAVIGATION DRAWER ---------------- */
function initMobileNav(audio) {
  const menu = document.getElementById('nav-menu');
  const openBtn = document.getElementById('nav-toggle');
  const closeBtn = document.getElementById('nav-close');
  const links = document.querySelectorAll('.nav__link');

  if (openBtn && menu) {
    openBtn.addEventListener('click', () => {
      menu.classList.add('show-menu');
      audio.click();
    });
  }

  if (closeBtn && menu) {
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('show-menu');
      audio.click();
    });
  }

  links.forEach(l => {
    l.addEventListener('click', () => {
      if (menu) menu.classList.remove('show-menu');
      audio.click();
    });
  });

  // Sticky header background
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY >= 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
}

/* ---------------- 10. ANIMATED METRIC COUNTERS ---------------- */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-counter');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach(c => {
          const target = parseInt(c.getAttribute('data-target') || '0', 10);
          let current = 0;
          const step = Math.max(1, Math.floor(target / 20));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              c.textContent = target;
              clearInterval(interval);
            } else {
              c.textContent = current;
            }
          }, 45);
        });
      }
    });
  }, { threshold: 0.3 });

  const strip = document.querySelector('.hero__metrics-strip');
  if (strip) observer.observe(strip);
}

/* ---------------- 11. DIRECT COPY BUTTONS ---------------- */
function initDirectCopy(audio) {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const text = btn.getAttribute('data-copy');
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        audio.click();
        showToast(`Copied ${text} to clipboard!`);
      });
    });
  });
}

/* ---------------- 12. CONTACT FORM DISPATCHER ---------------- */
function initContactForm(audio) {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('c-feedback');
  const submitBtn = document.getElementById('c-submit');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('c-name')?.value.trim();
    const email = document.getElementById('c-email')?.value.trim();
    const subject = document.getElementById('c-subject')?.value.trim() || 'Software Opportunity';
    const message = document.getElementById('c-message')?.value.trim();

    if (!name || !email || !message) {
      showFeedback('Please fill out all mandatory fields.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Preparing Dispatch...`;
    }

    audio.commandSuccess();

    setTimeout(() => {
      const mailtoUrl = `mailto:javakar00@gmail.com?subject=${encodeURIComponent(
        `[Portfolio] ${subject} - from ${name}`
      )}&body=${encodeURIComponent(
        `Sender: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      )}`;

      window.location.href = mailtoUrl;

      showFeedback(`Thank you ${name}! Opening your email client to send to javakar00@gmail.com.`, 'success');
      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>DISPATCH MESSAGE</span> <i class="fa-solid fa-paper-plane"></i>`;
      }
    }, 700);
  });

  function showFeedback(msg, type) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = `c-feedback ${type}`;
    feedback.style.display = 'block';

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 6000);
  }
}

/* ---------------- 13. GLOBAL KEYBOARD SHORTCUTS ---------------- */
function initGlobalShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Press '~' or '`' to focus terminal input
    if (e.key === '`' || e.key === '~') {
      const inlineInput = document.getElementById('terminal-inline-input');
      if (inlineInput && document.activeElement !== inlineInput) {
        e.preventDefault();
        inlineInput.focus();
        inlineInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

/* ---------------- 14. TOAST NOTIFICATION UTILITY ---------------- */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ---------------- UTILITIES ---------------- */
function updateCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
