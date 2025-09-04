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

// --- Global search logic with auto-tab open + Enter navigation + counter ---
const searchBox = document.getElementById('searchBox');
const searchCount = document.getElementById('searchCount');
const panels = document.querySelectorAll('.panel');
const tabs = document.querySelectorAll('.tab');

let searchResults = [];   // store all matches
let currentResult = -1;   // current index

function clearHighlights() {
  panels.forEach(panel => {
    panel.querySelectorAll("mark").forEach(m => {
      const text = document.createTextNode(m.textContent); 
      m.replaceWith(text);  // restore text without killing structure
    });
  });
  searchCount.textContent = "";
  searchResults = [];
  currentResult = -1;
}

function doSearch(query) {
  clearHighlights();   // always clear first
  searchResults = [];
  currentResult = -1;

  if (!query.trim()) {
    return; // stop here if box is empty
  }

  panels.forEach(panel => {
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null, false);
    const regex = new RegExp(`(${query})`, "gi");
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue.toLowerCase().includes(query)) {
        const span = document.createElement("span");
        span.innerHTML = node.nodeValue.replace(regex, "<mark>$1</mark>");
        node.parentNode.replaceChild(span, node);

        span.querySelectorAll("mark").forEach(m => {
          searchResults.push({ panelId: panel.id, element: m });
        });
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

// Remove old "active"
document.querySelectorAll("mark").forEach(m => m.classList.remove("active"));

// Add active to current
result.element.classList.add("active");

  
  // Switch to the right tab
  tabs.forEach(tab => {
    const target = tab.getAttribute('data-target');
    if (target === result.panelId) {
      tab.click();
    }
  });

  // Scroll to the result
  setTimeout(() => {
    result.element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 200);

  // Update counter
  searchCount.textContent = `Result ${currentResult + 1} of ${searchResults.length}`;
}

// --- Typing in search box ---
searchBox.addEventListener('input', function() {
  doSearch(this.value.toLowerCase());
});

// --- Pressing Enter cycles results ---
searchBox.addEventListener('keydown', function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (searchResults.length > 0) {
      goToResult(currentResult + 1);
    }
  }
});

// --- Sub-tab switching logic for Rate Rationalisation ---
document.querySelectorAll('.sub-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const target = this.getAttribute('data-target');

    // Toggle active tab
    document.querySelectorAll('.sub-tab').forEach(t => t.setAttribute('aria-selected','false'));
    this.setAttribute('aria-selected','true');

    // Toggle panels
    document.querySelectorAll('.sub-panel').forEach(p => {
      p.classList.remove('show');
      if (p.id === target) p.classList.add('show');
    });
  });
});
