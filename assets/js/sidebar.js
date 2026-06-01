/* ── Sidebar HTML generator ─────────────────────────────────── */
/* Call buildSidebar(containerId) after DOM ready.             */

const SIDEBAR_CATEGORIES = [
  { id: 'game',         icon: '🎮', label: 'ゲームパターン' },
  { id: 'game-ai',      icon: '🤖', label: 'ゲームAI' },
  { id: 'network',      icon: '🌐', label: 'ネットワーク' },
  { id: 'concurrency',  icon: '⚙️', label: '並行・非同期' },
  { id: 'creational',   icon: '🏗',  label: '生成（Creational）' },
  { id: 'structural',   icon: '🧱',  label: '構造（Structural）' },
  { id: 'behavioral',   icon: '🔁',  label: '振る舞い（Behavioral）' },
  { id: 'data',         icon: '💾',  label: 'データ・永続化' },
  { id: 'architecture', icon: '🏛',  label: 'アーキテクチャ' },
  { id: 'functional',   icon: '🧮',  label: '関数型・汎用' },
];

async function buildSidebar(containerId = 'sidebar-nav') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let patterns;
  try {
    const res = await fetch('data/patterns.json');
    patterns = await res.json();
  } catch (e) { return; }

  const byCategory = {};
  patterns.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  container.innerHTML = SIDEBAR_CATEGORIES.map(cat => {
    const items = byCategory[cat.id] || [];
    return `
      <div class="sidebar-section">
        <button class="sidebar-category" aria-expanded="false">
          <span class="cat-left">${cat.icon} ${cat.label}</span>
          <span class="chevron">▶</span>
        </button>
        <ul class="sidebar-links">
          ${items.map(p => `
            <li><a href="pattern.html?id=${p.id}">${p.name}</a></li>
          `).join('')}
        </ul>
      </div>
    `;
  }).join('');

  // Re-init sidebar interactions after rebuild
  if (typeof initSidebar === 'function') initSidebar();

  // Highlight active pattern from URL
  const params = new URLSearchParams(location.search);
  const activeId = params.get('id');
  if (activeId) markSidebarActive(activeId);
}
