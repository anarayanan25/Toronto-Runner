# Toronto Downtown Runner 🏃‍♂️🏙️

A high-speed, 3D infinite runner game set in the streets of downtown Toronto. Dodge traffic, collect coins, grab power-ups, and see how far you can run through the 6ix!

## 🎮 How to Play

### Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Move Left | `←` or `A` | Swipe Left |
| Move Right | `→` or `D` | Swipe Right |
| Jump | `Space` or `↑` or `W` | Swipe Up |

### Objective
- Run as far as possible to build your score
- Collect **gold coins** (+10 pts each)
- Grab **power-up orbs** for special abilities
- Dodge **cars** — you have 3 lives before it's game over
- The game speeds up over time and levels up every 60 seconds

## ✨ Features

### Gameplay
- **3 Lives system** — survive multiple hits with a brief invincibility window after each one
- **Jump mechanic** — leap over low obstacles (`Space` / swipe up)
- **High score** — your best run is saved locally and shown on the HUD
- **Power-ups** — three types of collectible orbs that appear on the road:
  - 🟢 **Speed Boost** — 1.6× speed for 10 seconds
  - 🔵 **Shield** — absorbs the next car hit
  - 🟣 **Coin Magnet** — pulls all nearby coins for 10 seconds
- **Dynamic difficulty** — speed increases every 20 seconds, new level every 60 seconds

### Visuals & Environment
- **3D GLB character** with auto-detected run/walk animations
- **Realistic road** — dark asphalt, dashed lane markings, yellow edge lines, raised curbs
- **Streetlights** every 20 units with glowing lamp heads
- **Detailed buildings** — glass skyscrapers and concrete towers with lit/unlit windows, rooftop ledges and AC units
- **CN Tower** — detailed recreation with tapered shaft, SkyPod observation deck, glass band, antenna, and blinking red warning light
- **Detailed cars** — cabin, transparent windshields, side windows, glowing headlights/taillights, wheels with hubcaps
- **Animated coins** — spinning gold coins with rim and emissive glow
- **Pedestrian NPCs** — randomized outfit colors walking the sidewalks
- **City atmosphere** — ACES filmic tone mapping, warm sun + cool fill lighting, city fog

### Audio
- Footsteps (speed-synced), coin pickup, crash, jump, power-up, and hit sounds — all synthesized via Web Audio API (no audio files needed)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://reactjs.org/) + TypeScript |
| 3D Engine | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Three.js](https://threejs.org/) |
| 3D Helpers | [@react-three/drei](https://github.com/pmndrs/drei) — `useGLTF`, `useAnimations`, `Sky`, `ContactShadows` |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/anarayanan25/Toronto-Runner.git
cd Toronto-Runner
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using a Custom Character

Place a `.glb` file in the `public/` folder and update the path in `src/Game/Player.tsx`:

```ts
useGLTF.preload('/your-character.glb');
const { scene, animations } = useGLTF('/your-character.glb');
```

The player auto-detects and plays any animation named `run` or `walk` from the GLB. To tune size and ground position, edit the constants at the top of `Player.tsx`:

```ts
const MODEL_SCALE = 1.0;   // increase/decrease character size
const MODEL_Y_OFFSET = 0;  // raise if feet clip through the road
```

## 📁 Project Structure

```
src/
├── App.tsx
└── Game/
    ├── GameContext.tsx      # Global state — score, lives, speed, power-ups, jump
    ├── GameScene.tsx        # Three.js Canvas, lighting, fog
    ├── Player.tsx           # GLB character, jump physics, lane movement
    ├── Environment.tsx      # Road, buildings, streetlights, CN Tower, skyline
    ├── GameManager.tsx      # Spawning, collision, cars, coins, power-ups, NPCs
    ├── HUD.tsx              # Score, lives, high score, power-up bar, overlays
    └── sounds.ts            # Web Audio API — all synthesized game sounds
```

---

Built with ❤️ in Toronto.
