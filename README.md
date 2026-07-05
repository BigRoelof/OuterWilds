# 🌌 Outer Wilds Ship Log Checklist (Archaeologist Achievement Companion)

An interactive, web-based companion checklist styled in the iconic **Outer Wilds** space theme. This tool is designed to help travelers track their ship log discoveries and verify outstanding facts required to unlock the prestigious **Archaeologist** achievement.

---

## ✨ Features

- 🚀 **Interactive Checklist**: Easily check/uncheck facts or mark entire locations as complete.
- 🗺️ **Comprehensive Log Database**: Pre-populated with all the critical facts and rumors required for the achievement.
- 🔍 **Real-time Search & Filtering**: Filter by keyword, hide completed destinations, or toggle the visibility of rumors.
- 📊 **Visual Progress Metrics**: Real-time HUD status bars display your progress percentage overall and per planet.
- 🎨 **Immersive Space Aesthetics**: Crafted with a premium dark mode, animated starry backdrops, and authentic Campfire-orange and Nomai-teal accents.
- 💾 **Local Progress Isolation**: Saves your progress to a separate, gitignored file (`progress.json`), keeping the main ship log database clean and static.

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone or download this repository:
   ```bash
   git clone <your-repository-url>
   cd OuterWilds
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```

### Running the App
1. Start the local Express server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

- `server.js` — Node.js Express server hosting the app and handling progress reads/writes.
- `ship_logs_db.json` — Static database containing all solar system locations, facts, and rumor IDs.
- `progress.json` — *[Auto-generated & Gitignored]* Stores your checked checklist states locally.
- `package.json` & `package-lock.json` — Node.js dependencies and start script.
- `.gitignore` — Excludes local progress data (`progress.json`), `node_modules/`, and editor configs from version control.
- `public/` — Frontend client-side resources:
  - `index.html` — The main interface structure.
  - `style.css` — Custom styles, responsive layout, and star animations.
  - `app.js` — Frontend interactivity, search filtering, and API communication.
  - `icons/` — Planet-specific SVG icons mapped dynamically to sidebar items.

---

## 💾 Backing Up Your Progress
Your checklist completion state is saved locally inside `progress.json` in the root folder. 
- **To back up your progress**: Simply copy the `progress.json` file.
- **To restore progress**: Place your backed-up `progress.json` in the project root directory before running the server.

---

## 🤝 Contributing
If you discover any typos, incorrect fact descriptions, or missing entries:
1. Fork this repository.
2. Edit `ship_logs_db.json` directly.
3. Submit a Pull Request.

Because your checklist progress is stored in a separate `progress.json` file, updating this repository or pulling down changes from upstream will never overwrite your personal progress!

---

*Disclaimer: Outer Wilds, characters, and assets are trademarks of Mobius Digital and Annapurna Interactive. This is a fan-made project created to support the gaming community.*
