// -------------------------------
// Accessible tabs with hash-based routing
// -------------------------------
(function(){
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  function show(id){
    panels.forEach(p => p.classList.toggle('show', p.id === id));
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.target === id));
  }

  // Setup click + keyboard
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

  function initFromHash(){
    const hash = (location.hash || '').replace('#','');
    const valid = panels.some(p => p.id === hash);
    show(valid ? hash : panels[0].id);
  }
  window.addEventListener('hashchange', initFromHash);
  initFromHash();
})();

// -------------------------------
// Global Search with toggle + counter
// -------------------------------
const searchBox = document.getElementById('searchBox');
const searchCount = document.getElementById('searchCount');
const panels = document.querySelectorAll('.panel');
const tabs = document.querySelectorAll('.tab');

let searchResults = [];
let currentResult = -1;

function clearHighlights() {
  panels.forEach(panel => {
    panel.innerHTML = panel.innerHTML.replace(/<\/?mark.*?>/g, ""); // remove all <mark>
  });
  searchResults = [];
  currentResult = -1;
  searchCount.textContent = "";
}

function doSearch(query) {
  clearHighlights();
  if (!query.trim()) return;

  const regex = new RegExp(`(${query})`, "gi");

  panels.forEach(panel => {
    // Walk through *text nodes* only, ignore HTML tags
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (regex.test(node.nodeValue)) {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        node.nodeValue.replace(regex, (match, p1, offset) => {
          // text before match
          if (offset > lastIdx) {
            frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx, offset)));
          }
          // highlight match
          const mark = document.createElement("mark");
          mark.textContent = match;
          frag.appendChild(mark);
          searchResults.push({ panelId: panel.id, element: mark });
          lastIdx = offset + match.length;
        });
        // leftover
        if (lastIdx < node.nodeValue.length) {
          frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx)));
        }
        node.parentNode.replaceChild(frag, node);
      }
    }
  });

  if (searchResults.length > 0) {
    goToResult(0);
  } else {
    searchCount.textContent = "No results found";
  }
}

function goToResult(index) {
  if (searchResults.length === 0) return;
  currentResult = (index + searchResults.length) % searchResults.length;
  const result = searchResults[currentResult];

  // Clear old active
  document.querySelectorAll("mark").forEach(m => m.classList.remove("active"));

  // Set new active
  result.element.classList.add("active");

  // Switch tab if needed
  tabs.forEach(tab => {
    if (tab.dataset.target === result.panelId) {
      tab.click();
    }
  });

  // Scroll into view
  setTimeout(() => {
    result.element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 200);

  // Update counter
  searchCount.textContent = `Result ${currentResult + 1} of ${searchResults.length}`;
}

// -------------------------------
// Event Listeners
// -------------------------------
searchBox.addEventListener('input', function() {
  doSearch(this.value.toLowerCase());
});

searchBox.addEventListener('keydown', function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (searchResults.length > 0) {
      goToResult(currentResult + 1); // cycle next
    }
  } else if (e.shiftKey && e.key === "Enter") {
    e.preventDefault();
    if (searchResults.length > 0) {
      goToResult(currentResult - 1); // cycle prev
    }
  }
});

// -------------------------------
// Sub-tab switching
// -------------------------------
document.querySelectorAll('.sub-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const target = this.getAttribute('data-target');
    document.querySelectorAll('.sub-tab').forEach(t => t.setAttribute('aria-selected','false'));
    this.setAttribute('aria-selected','true');

    document.querySelectorAll('.sub-panel').forEach(p => {
      p.classList.remove('show');
      if (p.id === target) p.classList.add('show');
    });
  });
});
