(function () {
  const STORAGE_KEY = 'taskflow_theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    const t = (theme === 'light' || theme === 'dark') ? theme : 'dark';
    root.setAttribute('data-theme', t);

    // update any toggle buttons/icons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      btn.dataset.theme = t;

      const label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = (t === 'light') ? 'Light' : 'Dark';

      const icon = btn.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = (t === 'light') ? '☀' : '🌙';
    });
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;

    // default: dark (match your current design)
    return 'dark';
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Initialize
  applyTheme(getInitialTheme());

  // Wire buttons
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    e.preventDefault();
    toggleTheme();
  });
})();
