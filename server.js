const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'ship_logs_db.json');
const progressPath = path.join(__dirname, 'progress.json');

// Auto-migrate progress from ship_logs_db.json to progress.json if progress.json doesn't exist
function migrateProgress() {
  if (!fs.existsSync(progressPath)) {
    try {
      console.log("No progress.json found. Migrating progress from ship_logs_db.json...");
      if (!fs.existsSync(dbPath)) return;
      const dbContent = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(dbContent);
      const progress = {};
      let migratedCount = 0;

      db.forEach((planet) => {
        planet.entries.forEach((entry) => {
          if (entry.facts.explore) {
            entry.facts.explore.forEach((fact) => {
              if (fact.checked) {
                progress[fact.id] = true;
                migratedCount++;
              }
              delete fact.checked;
            });
          }
          if (entry.facts.rumor) {
            entry.facts.rumor.forEach((fact) => {
              if (fact.checked) {
                progress[fact.id] = true;
                migratedCount++;
              }
              delete fact.checked;
            });
          }
        });
      });

      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2), 'utf8');
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      console.log(`Successfully migrated ${migratedCount} checked items and cleaned ship_logs_db.json.`);
    } catch (e) {
      console.error("Migration failed during startup:", e);
    }
  }
}

migrateProgress();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Retrieve checklist data from ship_logs_db.json and merge with progress.json
function getChecklistData() {
  try {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    let progress = {};
    if (fs.existsSync(progressPath)) {
      try {
        const progressContent = fs.readFileSync(progressPath, 'utf8');
        progress = JSON.parse(progressContent);
      } catch (err) {
        console.error("Error reading progress.json:", err);
      }
    }

    const planetNames = {
      "SUN_STATION": "Sun Station",
      "CAVE_TWIN": "Ember Twin",
      "TOWER_TWIN": "Ash Twin",
      "TIMBER_HEARTH": "Timber Hearth",
      "TIMBER_MOON": "Attlerock",
      "BRITTLE_HOLLOW": "Brittle Hollow",
      "WHITE_HOLE": "White Hole Station",
      "COMET": "Interloper",
      "GIANTS_DEEP": "Giant's Deep",
      "DARK_BRAMBLE": "Dark Bramble",
      "QUANTUM_MOON": "Quantum Moon",
      "VOLCANIC_MOON": "Hollow's Lantern",
      "ORBITAL_PROBE_CANNON": "Orbital Probe Cannon"
    };

    return db.map((planet) => {
      const locations = planet.entries.map((entry) => {
        const facts = [];
        if (entry.facts.explore) {
          entry.facts.explore.forEach((fact) => {
            facts.push({
              id: fact.id,
              text: fact.text,
              type: 'explore',
              checked: !!progress[fact.id]
            });
          });
        }
        if (entry.facts.rumor) {
          entry.facts.rumor.forEach((fact) => {
            facts.push({
              id: fact.id,
              text: fact.text,
              type: 'rumor',
              checked: !!progress[fact.id]
            });
          });
        }
        return {
          name: entry.name,
          facts: facts
        };
      });

      return {
        id: planet.id,
        name: planetNames[planet.id] || planet.id,
        locations: locations
      };
    });
  } catch (e) {
    console.error("Error reading checklist from database:", e);
    return [];
  }
}

// Update checkmarks inside progress.json
function updateChecklistDb(checkedStates) {
  try {
    let progress = {};
    if (fs.existsSync(progressPath)) {
      try {
        const progressContent = fs.readFileSync(progressPath, 'utf8');
        progress = JSON.parse(progressContent);
      } catch (err) {
        console.error("Error reading progress.json during update:", err);
      }
    }

    for (const [id, checked] of Object.entries(checkedStates)) {
      if (checked) {
        progress[id] = true;
      } else {
        delete progress[id];
      }
    }

    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving checklist progress:", e);
  }
}

// API Endpoints
app.get('/api/checklist', (req, res) => {
  try {
    const data = getChecklistData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/checklist', (req, res) => {
  try {
    const { checkedStates } = req.body;
    if (!checkedStates) {
      return res.status(400).json({ error: 'Missing checkedStates in request body' });
    }
    updateChecklistDb(checkedStates);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Fallback to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Copy SVGs from OuterWildsPlanetIcons to public/icons on startup
function copyIcons() {
  const sourceDir = path.join(__dirname, 'OuterWildsPlanetIcons', 'OuterWildsPlanetIcons-main');
  const destDir = path.join(__dirname, 'public', 'icons');

  if (!fs.existsSync(sourceDir)) {
    console.warn("OuterWildsPlanetIcons source directory not found.");
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const mapping = {
    "SUN_STATION": "sun-station/sun-station_v1.svg",
    "CAVE_TWIN": "ember-twin/ember-twin.svg",
    "TOWER_TWIN": "ash-twin/ash-twin.svg",
    "TIMBER_HEARTH": "timber-hearth/timberhearth.svg",
    "TIMBER_MOON": "attlerock/attlerock.svg",
    "BRITTLE_HOLLOW": "brittle-hollow/brittle-hollow_v1.svg",
    "WHITE_HOLE": "white-hole-station/white-hole-station.svg",
    "COMET": "interloper/interloper.svg",
    "GIANTS_DEEP": "giants-deep/giants-deep_v1.svg",
    "DARK_BRAMBLE": "dark-bramble/dark-bramble.svg",
    "QUANTUM_MOON": "quantum-moon/quantum-moon.svg",
    "VOLCANIC_MOON": "hollows-lantern/hollows-lantern.svg",
    "ORBITAL_PROBE_CANNON": "orbital-probe-canon/orbital-probe-canon.svg"
  };

  for (const [id, relativePath] of Object.entries(mapping)) {
    const srcPath = path.join(sourceDir, relativePath);
    const destPath = path.join(destDir, `${id.toLowerCase()}.svg`);
    
    // Fallback to sanitized folder if specific path fails
    let finalSrcPath = srcPath;
    if (!fs.existsSync(srcPath)) {
      const sanitizedName = relativePath.split('/').pop().replace('_v1', '').replace('_v0', '');
      const sanitizedPath = path.join(sourceDir, 'sanitized', sanitizedName);
      if (fs.existsSync(sanitizedPath)) {
        finalSrcPath = sanitizedPath;
      }
    }

    if (fs.existsSync(finalSrcPath)) {
      try {
        fs.copyFileSync(finalSrcPath, destPath);
        console.log(`Copied icon for ${id} to ${destPath}`);
      } catch (err) {
        console.error(`Failed to copy icon for ${id}:`, err);
      }
    } else {
      console.warn(`Source icon not found for ${id} at ${finalSrcPath}`);
    }
  }
}

// Run server
copyIcons();
app.listen(PORT, () => {
  console.log(`Outer Wilds Checklist server running at http://localhost:${PORT}`);
});
