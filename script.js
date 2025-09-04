// Accessible tabs with hash-based routing (no framework)
(function(){
  const tablist = document.querySelector('.tabs');
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  function show(id){
    panels.forEach(p => p.classList.toggle('show', p.id === id));
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.target === id));
    // move focus only when triggered by keyboard selection
  }

  // Setup click handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.target;
      if (id) {
        history.pushState(null, '', `#${id}`);
        show(id);
      }
    });

    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') {
        tabs[(i+1) % tabs.length].focus();
      } else if (e.key === 'ArrowLeft') {
        tabs[(i-1+tabs.length) % tabs.length].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        const id = tab.dataset.target;
        if (id) {
          history.pushState(null, '', `#${id}`);
          show(id);
        }
      }
    });
  });

  // Load initial tab from hash or default to first
  function initFromHash(){
    const hash = (location.hash || '').replace('#','');
    const valid = panels.some(p => p.id === hash);
    show(valid ? hash : panels[0].id);
  }
  window.addEventListener('hashchange', initFromHash);
  initFromHash();
})();

// --- Global search logic ---
const searchBox = document.getElementById('searchBox');
searchBox.addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const panels = document.querySelectorAll('.panel');

  // Clear old highlights
  panels.forEach(panel => {
    panel.innerHTML = panel.innerHTML.replace(/<mark>(.*?)<\/mark>/g, "$1");
  });

  if (query.trim() === "") return; // if empty, stop

  let found = false;
  panels.forEach(panel => {
    const textNodes = panel.querySelectorAll("p, li, h2, h3, summary, div");
    textNodes.forEach(node => {
      if (node.textContent.toLowerCase().includes(query)) {
        found = true;
        const regex = new RegExp(`(${query})`, "gi");
        node.innerHTML = node.textContent.replace(regex, "<mark>$1</mark>");
      }
    });
  });

  if (!found) {
    console.log("No results found"); // (optional) show a message instead of console.log
  }
});

