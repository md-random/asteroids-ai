# Asteroids AI Evolution

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Neataptic](https://img.shields.io/badge/NEAT-Neataptic.js-brightgreen)](https://wagenaartje.github.io/neataptic/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An autonomous neuroevolution simulator that trains neural networks in real time to master the classic 1979 Atari arcade game **Asteroids** directly in your browser. Powered by vanilla JavaScript, HTML5 Canvas, the Web Audio API, and the [Neataptic](https://wagenaartje.github.io/neataptic/) implementation of **NEAT** (NeuroEvolution of Augmenting Topologies).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
  - [Neuroevolution with NEAT](#neuroevolution-with-neat)
  - [Sensory Inputs (106 Dimensions)](#sensory-inputs-106-dimensions)
  - [Action Outputs](#action-outputs)
  - [Fitness Function](#fitness-function)
- [Arcade Mechanics](#arcade-mechanics)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [UI & HUD Telemetry](#ui--hud-telemetry)
- [Configuring Hyperparameters](#configuring-hyperparameters)
- [License](#license)

---

## Overview

Unlike standard reinforcement learning setups that train fixed-topology neural networks, this simulator uses genetic algorithms to evolve both connection weights and network architecture from scratch.

A population of agents plays through successive generations. Over time, the networks learn complex emergent behaviors without hardcoded gameplay heuristics:

- **Momentum control**: Managing inertia and counter-thrusting to navigate hazards.
- **Defensive spacing**: Maintaining safe distances from incoming rocks and debris.
- **Precision targeting**: Leading shots ahead of moving targets.
- **Threat prioritization**: Targeting lethal flying saucers and evading return fire.

---

## Features

- **In-Browser Neuroevolution**: Real-time genetic algorithm execution with zero backend dependencies.
- **Authentic Arcade Reproduction**:
  - Classic Atari rock geometry, vector ship styling, and dual flying saucers.
  - Authentic physics: toroidal screen wrap-around, rotational inertia, momentum decay, and rock splitting.
  - Authentic Atari hyperspace roulette mechanics (failure risk scales with asteroid density).
- **Procedural Audio Synthesis**:
  - Built-in Web Audio API synthesizer for retro square waves, saucer sirens, and filtered noise explosions.
- **Real-Time Visual Radar**:
  - On-canvas 5&times;5 egocentric sensory grid displaying danger levels and object velocity vectors.
- **Persistent Storage**:
  - Automatically saves the evolving population, death statistics, and leaderboard records to `localStorage`.
- **Comprehensive Telemetry**:
  - Tracks death causes across Asteroids, Saucers, Bullets, and Hyperspace accidents.
  - Multi-category leaderboards for High Scores, Best Fitness, and Survival Duration.

---

## How It Works

### Neuroevolution with NEAT

The simulator uses **NEAT** (NeuroEvolution of Augmenting Topologies):

1. **Initial Population**: Starts with 100 simple neural networks.
2. **Evaluation**: Each genome pilots the ship over 3 lives, accumulating fitness based on survival, accuracy, and destruction.
3. **Selection & Elitism**: The top 10 genomes are preserved directly into the next generation.
4. **Crossover & Mutation**: The remaining 90 slots are populated through parent mating and topological mutations (adding nodes, adding connections, adjusting weights).

### Sensory Inputs (106 Dimensions)

The neural network receives 106 normalized inputs each frame:

| Input Range      | Description                           | Details                                                                                                                                                                                                                                                                  |
| :--------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0` &ndash; `99` | **5&times;5 Egocentric Spatial Grid** | Relative grid of 25 cells centered on the ship. Each cell provides 4 channels: <br>&bull; Asteroid mass/density (`size / 3`)<br>&bull; Bullet danger flag (`0` or `1`)<br>&bull; Average relative X velocity (`xv / 5`)<br>&bull; Average relative Y velocity (`yv / 5`) |
| `100`, `101`     | **Normalized Position**               | Ship coordinates normalized across canvas dimensions (`x / width`, `y / height`)                                                                                                                                                                                         |
| `102`, `103`     | **Ship Velocity**                     | Current velocity vector normalized (`dx / 5`, `dy / 5`)                                                                                                                                                                                                                  |
| `104`, `105`     | **Heading Vector**                    | Trigonometric orientation angle (`cos(angle)`, `sin(angle)`)                                                                                                                                                                                                             |

### Action Outputs

The network evaluates 5 continuous output activations each frame:

- **Rotate Counter-Clockwise**: Activated when Output 0 > Output 1 and > 0.5.
- **Rotate Clockwise**: Activated when Output 1 > Output 0 and > 0.5.
- **Engage Thruster**: Activated when Output 2 > 0.5.
- **Fire Cannon**: Activated when Output 3 > 0.5 (subject to fire rate and bullet capacity limits).
- **Hyperspace Jump**: Activated when Output 4 > 0.7 (triggers an emergency warp jump).

### Fitness Function

The fitness function balances offensive efficiency with self-preservation:

- **Safety Distance**: $+1$ fitness per frame when keeping a safety buffer greater than 100px from any hazard.
- **Aiming Alignment**: $+1$ fitness per frame whenever the ship's nose aligns within $15^\circ$ of an asteroid.
- **Target Destruction**: Instant points added to score and fitness:
  - Large Asteroid: $+20$ points
  - Medium Asteroid: $+50$ points
  - Small Asteroid: $+100$ points
  - Large Saucer: $+500$ points
  - Small Saucer: $+1{,}000$ points

---

## Arcade Mechanics

- **Screen Wrap**: All entities wrapping past the screen edges appear smoothly on the opposite side with mirrored edge drawing.
- **Multi-Life Economy**: Ships start with 3 lives. Bonus lives are awarded at $10{,}000$-point increments.
- **Safe Respawning**: When destroyed, the ship waits to respawn until nearby airspace is clear of rocks and projectiles.
- **Alien Flying Saucers**:
  - **Large Saucer**: Spawns periodically and fires inaccurate, random shots.
  - **Small Saucer**: Appears as score increases ($8{,}000+$ points); tracks player coordinates and fires quantized, targeted shots.

---

## Quick Start

The project is built entirely with standard web technologies and native ES modules. No build steps, compilation, or bundlers are required.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AsteroidsAI.git
cd AsteroidsAI
```

### 2. Start a local HTTP server

Because ES modules require an HTTP origin, run a lightweight static server:

Using **Python 3**:

```bash
python3 -m http.server 8000
```

Using **Node.js**:

```bash
npx serve .
```

Using **PHP**:

```bash
php -S localhost:8000
```

### 3. Open in your browser

Navigate to `http://localhost:8000` to watch the AI train.

---

## Project Structure

```
AsteroidsAI/
├── index.html           # Main markup, canvas viewport, and sidebar HUD
├── css/
│   └── style.css        # Arcade styling, responsive layout, and HUD drawer
├── js/
│   ├── main.js          # Core loop, collision detection, sensory grid, saucers
│   ├── ai.js            # NEAT initialization, input formatting, action triggers
│   ├── game.js          # Game lifecycle, asteroid factory, death logic, generation transitions
│   ├── render.js        # Vector drawing engine (ship, asteroids, lasers, radar overlay)
│   ├── audio.js         # Web Audio procedural synthesis (lasers, explosions, sirens)
│   ├── state.js         # Global state store, Atari vector polygons, default constants
│   └── storage.js       # LocalStorage persistence, leaderboard UI, death statistics
├── assets/              # Arcade art and media references
└── package.json         # Optional test utilities (Playwright)
```

---

## UI & HUD Telemetry

Click **☰ MENU** in the upper-right corner to toggle the sidebar drawer:

- **Generation & Run**: Displays current generation count and the active genome index (1&ndash;100).
- **Death Cause Thermometer**: A visual breakdown showing the percentage of deaths caused by:
  - 🟦 **Asteroid**: Physical impact with space debris.
  - 🟥 **Saucer**: Direct collision with alien ships.
  - 🟨 **Bullet**: Hit by enemy fire.
  - 🟪 **Hyperspace**: Disintegration during a blind hyperspace jump.
- **Audio Controls**: Mute toggle button and global volume slider.
- **Management Tools**:
  - **Reset AI Brain**: Wipes saved neural networks and starts evolution fresh from Generation 1.
  - **Clear Leaderboards**: Clears saved high scores and times without resetting network weights.
- **Persistent Leaderboards**:
  - **Highest Scores**: Top 10 scores achieved.
  - **Best Fitness**: Top 10 fitness values recorded.
  - **Longest Survival**: Top 10 longest lifespans.

---

## Configuring Hyperparameters

To tune simulation parameters, update the corresponding module in `js/`:

### Population & Genetic Algorithm (`js/ai.js`)

```javascript
state.neat = new neataptic.Neat(106, 5, null, {
  mutation: neataptic.methods.mutation.ALL,
  popsize: 100, // Total genomes per generation
  mutationRate: 0.3, // Probability of mutation per offspring
  elitism: 10, // Top genomes preserved untouched
  network: new neataptic.architect.Random(106, 25, 5),
});
```

### Game Balance & Lives (`js/state.js`)

```javascript
lives: 3,                // Starting lives per run
nextLifeScore: 10000,    // Points needed for an extra life
saucerTimeReload: 1800,  // Frames between saucer spawn attempts (~30s at 60 FPS)
```
