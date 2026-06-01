(function() {
  // ---- THEME ----
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const saved = localStorage.getItem('gs-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    themeIcon.className = t === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
    localStorage.setItem('gs-theme', t);
  }
  applyTheme(saved);
  themeBtn.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ---- CATEGORY FILTER ----
  const catBtns = document.querySelectorAll('.cat-btn');
  let activeCategory = 'all';
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      catBtns.forEach(b => b.classList.toggle('active', b === btn));
      filterCards();
    });
  });

  // ---- SEARCH ----
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchCount = document.getElementById('search-count');
  const noResults = document.getElementById('no-results');
  let searchQuery = '';

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    searchClear.style.display = searchQuery ? 'flex' : 'none';
    filterCards();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.style.display = 'none';
    filterCards();
    searchInput.focus();
  });

  // keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
  }

  function filterCards() {
    const cards = document.querySelectorAll('.cmd-card');
    const sections = document.querySelectorAll('.cmd-section');
    let visibleCount = 0;

    cards.forEach(card => {
      const cat = card.dataset.cat;
      const searchText = (card.dataset.search + ' ' + card.textContent).toLowerCase();
      const catMatch = activeCategory === 'all' || cat === activeCategory;
      const searchMatch = !searchQuery || searchText.includes(searchQuery);
      const visible = catMatch && searchMatch;
      card.classList.toggle('hidden', !visible);
      if (visible) visibleCount++;

      // Update highlight
      const body = card.querySelector('.cmd-body');
      if (body) {
        body.querySelectorAll('mark').forEach(m => {
          const parent = m.parentNode;
          parent.replaceChild(document.createTextNode(m.textContent), m);
          parent.normalize();
        });
        if (searchQuery && searchMatch) {
          body.innerHTML = highlight(body.innerHTML, searchQuery);
        }
      }
    });

    // Show/hide sections based on visible cards
    sections.forEach(section => {
      const sectionCards = section.querySelectorAll('.cmd-card:not(.hidden)');
      const visible = sectionCards.length > 0;
      const catMatch = activeCategory === 'all' || section.dataset.section === activeCategory;
      section.classList.toggle('section-hidden', !visible || !catMatch);

      // Update count badge
      const countEl = section.querySelector('.cmd-count');
      if (countEl) countEl.textContent = sectionCards.length + ' cmds';
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    if (searchQuery) {
      searchCount.textContent = visibleCount + ' result' + (visibleCount !== 1 ? 's' : '');
    } else {
      searchCount.textContent = '';
    }
  }

  // ---- COPY BUTTONS ----
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = orig;
        }, 1800);
      } catch {
        const t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); document.execCommand('copy');
        document.body.removeChild(t);
      }
    });
  });

  // ---- BACK TO TOP ----
  const backTop = document.getElementById('back-top');
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- INIT SECTION COUNTS ----
  filterCards();

  // ---- TOTAL COUNT ----
  const total = document.querySelectorAll('.cmd-card').length;
  const totalEl = document.getElementById('total-count');
  if (totalEl) totalEl.textContent = total + '+';

  // ---- URL SEARCH PARAM ----
  const urlParams = new URLSearchParams(window.location.search);
  const urlQ = urlParams.get('q');
  if (urlQ) {
    searchInput.value = urlQ;
    searchQuery = urlQ.toLowerCase();
    searchClear.style.display = 'flex';
    filterCards();
  }
})();
