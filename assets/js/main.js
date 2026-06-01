/* ============================================================
   Design Pattern Learning Site — main.js
   Navigation, dark/light toggle, search, sidebar
   ============================================================ */

/* ── Theme ──────────────────────────────────────────────────── */
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light');
})();

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = isLight ? '🌙' : '☀️';
}

/* ── Sidebar Accordion ───────────────────────────────────────── */
function initSidebar() {
  document.querySelectorAll('.sidebar-category').forEach(btn => {
    btn.addEventListener('click', () => {
      const links = btn.nextElementSibling;
      const isOpen = links.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
    });
  });

  // Auto-open category containing current page
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-links li a').forEach(a => {
    if (a.getAttribute('href') && a.getAttribute('href').includes(cur)) {
      a.classList.add('active');
      const ul = a.closest('.sidebar-links');
      if (ul) {
        ul.classList.add('open');
        const btn = ul.previousElementSibling;
        if (btn) btn.classList.add('open');
      }
    }
  });

  // Mobile toggle
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target))
        sidebar.classList.remove('open');
    });
  }
}

/* ── Search ─────────────────────────────────────────────────── */
let _patterns = null;

async function loadPatterns() {
  if (_patterns) return _patterns;
  const res = await fetch('data/patterns.json');
  _patterns = await res.json();
  return _patterns;
}

function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.classList.remove('show'); return; }
      const all = await loadPatterns();
      const hits = all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameJa.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      ).slice(0, 8);
      renderResults(hits, results);
    }, 180);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target))
      results.classList.remove('show');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') results.classList.remove('show');
  });
}

function renderResults(hits, container) {
  if (!hits.length) {
    container.innerHTML = '<div class="search-no-result">パターンが見つかりません</div>';
    container.classList.add('show');
    return;
  }
  container.innerHTML = hits.map(p => `
    <a class="search-result-item" href="pattern.html?id=${p.id}">
      <span class="badge badge-${p.category}">${categoryLabel(p.category)}</span>
      <span>
        <div class="res-name">${p.name}</div>
        <div class="res-summary">${p.summary.slice(0, 60)}…</div>
      </span>
    </a>
  `).join('');
  container.classList.add('show');
}

function categoryLabel(cat) {
  const map = {
    game: 'ゲーム', 'game-ai': 'AI', network: 'ネット',
    concurrency: '並行', creational: '生成', structural: '構造',
    behavioral: '振る舞い', data: 'データ', architecture: '設計',
    functional: '関数型',
  };
  return map[cat] || cat;
}

/* ── Copy Button ─────────────────────────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('.code-wrap').forEach(wrap => {
    const btn = wrap.querySelector('.copy-btn');
    const code = wrap.querySelector('code');
    if (!btn || !code) return;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(code.innerText).then(() => {
        btn.textContent = '✓ コピー済';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'コピー';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* ── Tabs ────────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabs => {
    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const container = tabs.closest('.tab-container') || tabs.parentElement;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = container.querySelector(`.tab-panel[data-tab="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ── Quiz ────────────────────────────────────────────────────── */
function initQuiz() {
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const card = opt.closest('.quiz-card');
      if (card.dataset.answered) return;
      card.dataset.answered = '1';
      const isCorrect = opt.dataset.correct === 'true';
      opt.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        card.querySelector('[data-correct="true"]')?.classList.add('correct');
      }
      const fb = card.querySelector('.quiz-feedback');
      if (fb) fb.classList.add('show');
    });
  });
}

/* ── Highlight.js auto-detect ────────────────────────────────── */
function initHighlight() {
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }
}

/* ── Sidebar active pattern link (pattern.html) ─────────────── */
function markSidebarActive(id) {
  document.querySelectorAll('.sidebar-links li a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') && a.getAttribute('href').includes(id)) {
      a.classList.add('active');
      const ul = a.closest('.sidebar-links');
      if (ul) { ul.classList.add('open'); ul.previousElementSibling?.classList.add('open'); }
      a.scrollIntoView({ block: 'nearest' });
    }
  });
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSearch();
  initCopyButtons();
  initTabs();
  initQuiz();
  initHighlight();

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
    themeBtn.addEventListener('click', toggleTheme);
  }
});
