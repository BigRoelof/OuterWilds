// Outer Wilds On-Board Computer Checklist Logic
let checklistData = [];
let currentPlanetId = null;

// Fallback data for offline/standalone execution
const fallbackData = [
  {
    id: "SUN_STATION",
    name: "Sun Station",
    locations: [
      {
        name: "Sun Station",
        facts: [
          { id: "S_SUNSTATION_X1", text: "The Sun Station was designed to make the sun go supernova.", type: "explore", checked: false },
          { id: "S_SUNSTATION_X2", text: "The Nomai fired the Sun Station, but it failed to trigger a supernova.", type: "explore", checked: true },
          { id: "S_SUNSTATION_R1", text: "Nomai travel logs detail the warp coordinates of the Sun Station.", type: "rumor", checked: false }
        ]
      }
    ]
  },
  {
    id: "TIMBER_HEARTH",
    name: "Timber Hearth",
    locations: [
      {
        name: "Zero-G Cave",
        facts: [
          { id: "TH_ZERO_G_CAVE_X1", text: "A cave at the center of Timber Hearth used by Outer Wilds Ventures to train astronauts.", type: "explore", checked: false },
          { id: "TH_ZERO_G_CAVE_X2", text: "I successfully repaired the broken satellite inside the cave.", type: "explore", checked: false }
        ]
      },
      {
        name: "Village",
        facts: [
          { id: "TH_VILLAGE_X1", text: "The Hearthian observatory houses a fully functional Nomai statue.", type: "explore", checked: true }
        ]
      }
    ]
  },
  {
    id: "QUANTUM_MOON",
    name: "Quantum Moon",
    locations: [
      {
        name: "Quantum Shrine",
        facts: [
          { id: "QM_SHRINE_X1", text: "A Nomai shrine built to explore the Quantum Moon's secrets.", type: "explore", checked: false },
          { id: "QM_SHRINE_X2", text: "I found a plaque outlining the rule of Quantum Imaging.", type: "explore", checked: false }
        ]
      }
    ]
  }
];


// DOM Elements
const planetList = document.getElementById('planet-list');
const logsContainer = document.getElementById('logs-container');
const currentPlanetTitle = document.getElementById('current-planet-title');
const currentPlanetStats = document.getElementById('current-planet-stats');
const overallProgressText = document.getElementById('overall-progress-text');
const overallProgressFill = document.getElementById('overall-progress-fill');
const searchInput = document.getElementById('search-input');
const hideCompletedToggle = document.getElementById('hide-completed-toggle');
const showRumorsToggle = document.getElementById('show-rumors-toggle');
const statusText = document.getElementById('status-text');

// Initialize App
async function init() {
  await fetchChecklist();
  setupEventListeners();
  createStars();
  renderSidebar();
  updateOverallProgress();
}

// Generate organic starry backdrop
function createStars() {
  const container = document.querySelector('.stars');
  if (!container) return;
  
  const count = 150;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random() * 2 + 1; // 1px to 3px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    star.style.opacity = Math.random();
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`; // 2s to 5s
    
    // Add subtle colors (warm campfire orange, cool Nomai teal, or white)
    const colorRand = Math.random();
    if (colorRand > 0.92) {
      star.style.backgroundColor = 'var(--color-nomai-teal)';
      star.style.boxShadow = '0 0 4px var(--color-nomai-teal)';
    } else if (colorRand > 0.84) {
      star.style.backgroundColor = 'var(--color-campfire-orange)';
      star.style.boxShadow = '0 0 4px var(--color-campfire-orange)';
    }
    
    container.appendChild(star);
  }
}

// Fetch checklist from backend API
async function fetchChecklist() {
  try {
    statusText.textContent = "Syncing with database...";
    const res = await fetch('/api/checklist');
    if (!res.ok) throw new Error("HTTP error " + res.status);
    checklistData = await res.json();
    statusText.textContent = "Connected to database";
    statusText.style.color = "var(--color-nomai-teal)";
  } catch (e) {
    console.error("Fetch failed, loading fallback data:", e);
    checklistData = fallbackData;
    statusText.textContent = "Sync failed. Running offline (demo mode).";
    statusText.style.color = "#f25c54";
  }
}

// Send updated checklist states to backend API
async function saveChecklist(checkedStates) {
  try {
    statusText.textContent = "Saving changes to database...";
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedStates })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    statusText.textContent = "Changes saved to database";
    statusText.style.color = "var(--color-nomai-teal)";
  } catch (e) {
    console.error("Save failed:", e);
    statusText.textContent = "Save failed. Out of sync.";
    statusText.style.color = "#f25c54";
  }
}

// Setup Event Listeners
function setupEventListeners() {
  searchInput.addEventListener('input', () => {
    renderSidebar();
    if (currentPlanetId) renderMainPanel(currentPlanetId);
  });

  hideCompletedToggle.addEventListener('change', () => {
    renderSidebar();
    if (currentPlanetId) renderMainPanel(currentPlanetId);
  });

  showRumorsToggle.addEventListener('change', () => {
    renderSidebar();
    if (currentPlanetId) renderMainPanel(currentPlanetId);
    updateOverallProgress();
  });
}

// Calculate Progress Metrics
function getPlanetStats(planet) {
  let total = 0;
  let checked = 0;
  
  planet.locations.forEach(loc => {
    loc.facts.forEach(fact => {
      if (!showRumorsToggle.checked && fact.type === 'rumor') return;
      total++;
      if (fact.checked) checked++;
    });
  });
  
  return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
}

// Update Overall HUD Progress Bar
function updateOverallProgress() {
  let total = 0;
  let checked = 0;
  
  checklistData.forEach(planet => {
    planet.locations.forEach(loc => {
      loc.facts.forEach(fact => {
        if (!showRumorsToggle.checked && fact.type === 'rumor') return;
        total++;
        if (fact.checked) checked++;
      });
    });
  });
  
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
  overallProgressText.textContent = `${percent}% (${checked} / ${total} facts)`;
  overallProgressFill.style.width = `${percent}%`;
}

// Render Left Sidebar Planets
function renderSidebar() {
  planetList.innerHTML = '';
  const searchVal = searchInput.value.toLowerCase();
  const hideCompleted = hideCompletedToggle.checked;
  
  checklistData.forEach(planet => {
    
    const stats = getPlanetStats(planet);
    
    // Filter out completed if hideCompleted is checked
    if (hideCompleted && stats.checked === stats.total && stats.total > 0) return;
    
    // Search filtering (checks if planet name or any locations match query)
    const matchesPlanet = planet.name.toLowerCase().includes(searchVal);
    const matchesLocations = planet.locations.some(loc => 
      loc.name.toLowerCase().includes(searchVal) || 
      loc.facts.some(fact => {
        if (!showRumorsToggle.checked && fact.type === 'rumor') return false;
        return fact.text.toLowerCase().includes(searchVal);
      })
    );
    
    if (searchVal && !matchesPlanet && !matchesLocations) return;
    
    const item = document.createElement('div');
    item.className = `planet-item ${currentPlanetId === planet.id ? 'active' : ''} ${stats.checked === stats.total && stats.total > 0 ? 'completed' : ''}`;
    item.setAttribute('data-planet-id', planet.id);
    
    item.innerHTML = `
      <div class="planet-icon-container">
        <img class="planet-icon-img" src="icons/${planet.id.toLowerCase()}.svg" alt="${planet.name}">
      </div>
      <div class="planet-info">
        <span class="planet-name">${planet.name}</span>
        <span class="planet-sub">${planet.locations.length} locations</span>
      </div>
      <div class="planet-count">${stats.checked}/${stats.total}</div>
    `;
    
    item.addEventListener('click', () => {
      document.querySelectorAll('.planet-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      currentPlanetId = planet.id;
      renderMainPanel(planet.id);
    });
    
    planetList.appendChild(item);
  });
}

// Render Right Main Panel Locations & Facts
function renderMainPanel(planetId) {
  if (!planetId) {
    currentPlanetTitle.textContent = "Select a Destination";
    currentPlanetStats.textContent = "";
    logsContainer.innerHTML = `
      <div class="no-selection">
        <div class="campfire-icon">🔥</div>
        <h3>Gather 'round the campfire, traveler.</h3>
        <p>Select a planetary body from the list on the left to review your ship log entries, discover rumors, and verify outstanding facts required for the Archaeologist achievement.</p>
      </div>
    `;
    return;
  }
  
  const planet = checklistData.find(p => p.id === planetId);
  if (!planet) return;
  
  const stats = getPlanetStats(planet);
  currentPlanetTitle.textContent = planet.name;
  currentPlanetStats.textContent = `${stats.checked} / ${stats.total} (${stats.percent}%)`;
  
  logsContainer.innerHTML = '';
  
  const searchVal = searchInput.value.toLowerCase();
  const hideCompleted = hideCompletedToggle.checked;
  const showRumors = showRumorsToggle.checked;
  
  let renderedCount = 0;
  
  planet.locations.forEach(location => {
    // Search filtering on location & facts
    const matchesLocation = location.name.toLowerCase().includes(searchVal);
    const matchingFacts = location.facts.filter(fact => {
      const textMatches = fact.text.toLowerCase().includes(searchVal);
      const isCompletedFiltered = hideCompleted ? !fact.checked : true;
      const isRumorFiltered = showRumors ? true : fact.type !== 'rumor';
      return textMatches && isCompletedFiltered && isRumorFiltered;
    });
    
    const factsToRender = searchVal ? matchingFacts : location.facts.filter(fact => {
      const isCompletedFiltered = hideCompleted ? !fact.checked : true;
      const isRumorFiltered = showRumors ? true : fact.type !== 'rumor';
      return isCompletedFiltered && isRumorFiltered;
    });
    
    if (factsToRender.length === 0) return;
    if (searchVal && !matchesLocation && matchingFacts.length === 0) return;
    
    renderedCount++;
    const card = document.createElement('div');
    card.className = 'location-card';
    card.id = `card-${location.facts[0]?.id.substring(0, location.facts[0]?.id.lastIndexOf('_')) || 'loc'}`;
    
    // Quick action button label
    const allChecked = location.facts.every(f => f.checked);
    const quickActionLabel = allChecked ? "Mark Incomplete" : "Mark Complete";
    
    let factsHtml = '';
    const factsToRenderPlaceholder = factsToRender; // placeholder to make it clean
    
    factsToRender.forEach(fact => {
      factsHtml += `
        <div class="fact-item ${fact.checked ? 'checked' : ''}" data-fact-id="${fact.id}">
          <div class="checkbox-wrapper">
            <input type="checkbox" ${fact.checked ? 'checked' : ''} data-fact-id="${fact.id}">
            <span class="custom-checkbox"></span>
          </div>
          <div class="fact-content">
            <span class="fact-text">${fact.text}</span>
            <div class="fact-meta">
              <span class="badge ${fact.type}">${fact.type.toUpperCase()}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    card.innerHTML = `
      <div class="location-header">
        <h3 class="location-title">${location.name}</h3>
        <div class="location-quick-actions">
          <button class="action-btn ${allChecked ? '' : 'complete'}" data-action="toggle-location" data-location-name="${location.name}">
            ${quickActionLabel}
          </button>
        </div>
      </div>
      <div class="fact-list">
        ${factsHtml}
      </div>
    `;
    
    // Add Event Listeners for Individual Fact Items inside card
    card.querySelectorAll('.fact-item').forEach(factItem => {
      factItem.addEventListener('click', async (e) => {
        const checkbox = factItem.querySelector('input[type="checkbox"]');
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        
        const factId = checkbox.getAttribute('data-fact-id');
        const checked = checkbox.checked;
        
        // Update local state
        let factFound = null;
        for (let p of checklistData) {
          for (let loc of p.locations) {
            const f = loc.facts.find(fact => fact.id === factId);
            if (f) {
              f.checked = checked;
              factFound = f;
              break;
            }
          }
          if (factFound) break;
        }
        
        // Toggle visual style of list item
        if (checked) factItem.classList.add('checked');
        else factItem.classList.remove('checked');
        
        // Save to backend
        const update = {};
        update[factId] = checked;
        await saveChecklist(update);
        
        // Update stats and sidebar
        updateOverallProgress();
        renderSidebar();
        
        // Update location card quick actions header without re-rendering everything
        const locationObj = planet.locations.find(l => l.name === location.name);
        if (locationObj) {
          const locAllChecked = locationObj.facts.every(f => f.checked);
          const btn = card.querySelector('button[data-action="toggle-location"]');
          if (btn) {
            btn.textContent = locAllChecked ? "Mark Incomplete" : "Mark Complete";
            if (locAllChecked) btn.classList.remove('complete');
            else btn.classList.add('complete');
          }
        }
        
        const newStats = getPlanetStats(planet);
        currentPlanetStats.textContent = `${newStats.checked} / ${newStats.total} (${newStats.percent}%)`;
      });
    });
    
    // Quick action toggle complete for entire location
    card.querySelector('button[data-action="toggle-location"]').addEventListener('click', async (e) => {
      const locName = e.target.getAttribute('data-location-name');
      const locationObj = planet.locations.find(l => l.name === locName);
      if (!locationObj) return;
      
      const targetChecked = !locationObj.facts.every(f => f.checked);
      const updates = {};
      
      locationObj.facts.forEach(f => {
        f.checked = targetChecked;
        updates[f.id] = targetChecked;
        
        // Update checkbox elements visually
        const chk = card.querySelector(`input[data-fact-id="${f.id}"]`);
        if (chk) chk.checked = targetChecked;
        
        const itemEl = card.querySelector(`.fact-item[data-fact-id="${f.id}"]`);
        if (itemEl) {
          if (targetChecked) itemEl.classList.add('checked');
          else itemEl.classList.remove('checked');
        }
      });
      
      await saveChecklist(updates);
      
      // Update stats and sidebar
      updateOverallProgress();
      renderSidebar();
      
      e.target.textContent = targetChecked ? "Mark Incomplete" : "Mark Complete";
      if (targetChecked) e.target.classList.remove('complete');
      else e.target.classList.add('complete');
      
      const newStats = getPlanetStats(planet);
      currentPlanetStats.textContent = `${newStats.checked} / ${newStats.total} (${newStats.percent}%)`;
    });
    
    logsContainer.appendChild(card);
  });
  
  if (renderedCount === 0) {
    logsContainer.innerHTML = `
      <div class="no-selection">
        <h3>No matching logs found.</h3>
        <p>Try clearing your search query.</p>
      </div>
    `;
  }
}

// Start
init();
