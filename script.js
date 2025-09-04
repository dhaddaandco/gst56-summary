// --- Tab logic (hash-based navigation) ---
(function(){
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  function show(id){
    panels.forEach(p => p.classList.toggle('show', p.id === id));
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.target === id));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.target;
      if (id) {
        history.pushState(null, '', `#${id}`);
        show(id);
      }
    });
  });

  function initFromHash(){
    const hash = (location.hash || '').replace('#','');
    const valid = Array.from(panels).some(p => p.id === hash);
    show(valid ? hash : panels[0].id);
  }

  window.addEventListener('hashchange', initFromHash);
  initFromHash();
})();

// --- Global search with highlight + navigation ---
const searchBox = document.getElementById('searchBox');
const searchCount = document.getElementById('searchCount');
const panels = document.querySelectorAll('.panel');
const tabs = document.querySelectorAll('.tab');

let results = [];
let current = -1;

function clearHighlights() {
  panels.forEach(panel => {
    panel.querySelectorAll("mark").forEach(m => {
      m.replaceWith(m.textContent); // unwrap mark
    });
  });
  results = [];
  current = -1;
  searchCount.textContent = "";
}

function doSearch(query) {
  clearHighlights();
  if (!query.trim()) return;

  const regex = new RegExp(query, "gi");

  panels.forEach(panel => {
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      if (regex.test(text)) {
        const frag = document.createDocumentFragment();
        let last = 0;
        text.replace(regex, (match, offset) => {
          if (offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
          const mark = document.createElement("mark");
          mark.textContent = match;
          frag.appendChild(mark);
          results.push({ panelId: panel.id, el: mark });
          last = offset + match.length;
        });
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    }
  });

  if (results.length > 0) {
    goToResult(0);
  } else {
    searchCount.textContent = "No results found";
  }
}

function goToResult(index) {
  if (results.length === 0) return;
  current = (index + results.length) % results.length;
  const r = results[current];

  document.querySelectorAll("mark").forEach(m => m.classList.remove("active"));
  r.el.classList.add("active");

  // Switch to right tab
  tabs.forEach(tab => {
    if (tab.dataset.target === r.panelId) tab.click();
  });

  // Scroll into view
  setTimeout(() => r.el.scrollIntoView({ behavior: "smooth", block: "center" }), 200);

  searchCount.textContent = `Result ${current + 1} of ${results.length}`;
}

// --- Events ---
searchBox.addEventListener('input', e => doSearch(e.target.value.toLowerCase()));

searchBox.addEventListener('keydown', e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (results.length > 0) {
      if (e.shiftKey) {
        goToResult(current - 1); // backward
      } else {
        goToResult(current + 1); // forward
      }
    }
  }
});
