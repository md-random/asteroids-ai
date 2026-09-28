# Asteroids AI Evolution

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Neataptic](https://img.shields.io/badge/NEAT-Neataptic.js-brightgreen)](https://wagenaartje.github.io/neataptic/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An autonomous neuroevolution simulator that trains neural networks in real time to master the classic 1979 Atari arcade game **Asteroids** directly in your browser. Powered by vanilla JavaScript, HTML5 Canvas, the Web Audio API, an integrated Python checkpoint server, and the [Neataptic](https://wagenaartje.github.io/neataptic/) implementation of **NEAT** (NeuroEvolution of Augmenting Topologies).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Arcade Experience & Aesthetics](#arcade-experience--aesthetics)
- [How It Works](#how-it-works)
  - [Neuroevolution with NEAT](#neuroevolution-with-neat)
  - [Sensory Inputs (106 Dimensions)](#sensory-inputs-106-dimensions)
  - [Action Outputs](#action-outputs)
  - [Reward & Fitness Function](#reward--fitness-function)
- [Arcade Mechanics](#arcade-mechanics)
- [Brain Checkpoints & Server API](#brain-checkpoints--server-api)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Operator Service Menu & Telemetry](#operator-service-menu--telemetry)
- [Configuring Hyperparameters](#configuring-hyperparameters)
- [License](#license)

---

## Overview

Unlike standard reinforcement learning setups that train fixed-topology neural networks, this simulator uses genetic algorithms to evolve both connection weights and network architecture from scratch.

A population of agents plays through successive generations. Over time, the networks learn complex emergent behaviors without hardcoded gameplay heuristics:

- **Momentum control**: Managing inertia and counter-thrusting to navigate hazards.
- **Defensive spacing & corridor awareness**: Evaluating velocity trajectories to avoid slamming into obstacles.
- **Disciplined gunnery**: Aligning shots precisely with targets while avoiding blind, empty-space firing.
- **Threat prioritization**: Targeting lethal flying saucers and evading return fire.

---

## Features

- **In-Browser Neuroevolution**: Real-time genetic algorithm execution with dynamic network topology mutation.
- **Authentic 1979 Atari Cabinet Presentation**:
  - Full-screen original Atari Asteroids cabinet side art backdrop framing both intro and gameplay screens.
  - Molded 3D CRT monitor shroud with bevel retainers, corner screws, and scanlines.
  - Video intro screen with Atari marquee text plates and tactile circular arcade pushbuttons.
- **Direct Checkpoint Storage Engine**:
  - Built-in Python server saves and loads neural network weights directly to the project's `data/` directory without browser download dialogs.
  - Generation checkpoint modal allowing instant recall of historical high-performing brains.
- **Hardware Diagnostic Audit Panel**:
  - Recessed digital display wells with glowing 7-segment / VFD readouts (`VT323` font) for generational telemetry.
  - Tabbed leaderboards for High Scores, Best Fitness, and Survival Duration.
- **Procedural Audio Synthesis**:
  - Built-in Web Audio API synthesizer for retro square waves, saucer sirens, and filtered noise explosions.
- **Visual Radar**:
  - On-canvas 5&times;5 egocentric sensory grid displaying threat densities and relative velocity vectors.

---

## Arcade Experience & Aesthetics

### Intro Screen & Controls
- **Marquee & Decal Plates**: Framed in dark beveled metal plates with corner rivets and high-contrast retro typography.
- **Circular Arcade Pushbuttons**:
  - **1 Player Start** (Illuminated Green)
  - **Load Checkpoint** (Illuminated Amber)
  - Feature 3D outer bezels and spring-loaded plunger caps that physically depress when clicked.
  - Silkscreened label plates fixed beneath each button.

### Gameplay Cabinet Bezel
- The active gameplay canvas is housed inside an authentic molded arcade CRT monitor bezel.
- Includes metallic corner retainer screws, an inset cathode-ray well, and subtle raster scanlines.

---

## How It Works

### Neuroevolution with NEAT

The simulator uses **NEAT** (NeuroEvolution of Augmenting Topologies):

1. **Initial Population**: Starts with 100 neural networks.
2. **Evaluation**: Each genome pilots the ship over 3 lives, accumulating fitness based on survival, accuracy, obstacle avoidance, and destruction.
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
- **Hyperspace Jump**: Activated when Output 4 > 0.7 (emergency warp jump).

### Reward & Fitness Function

The fitness function balances aggressive target hunting with disciplined obstacle avoidance:

- **Collision Corridor Awareness**: Penalizes forward thrust only when directly aimed along an imminent collision vector toward nearby rocks; open-space maneuvering is free.
- **Target Engagement**:
  - Aimed shots aligned within $15^\circ$ of a hazard earn $+2$ fitness.
  - Precision bullet hits earn $+15$ bonus fitness.
  - Blind shots fired into empty space incur a $-1.5$ penalty to discourage spam.
- **Evasive Clearance**: $+0.5$ fitness for actively increasing separation distance when in close quarters with an asteroid.
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
- **Safe Respawning**: When destroyed, the ship waits to respawn until nearby airspace is clear of hazards.
- **Alien Flying Saucers**:
  - **Large Saucer**: Spawns periodically and fires inaccurate, random shots.
  - **Small Saucer**: Appears as score increases ($8{,}000+$ points); tracks player coordinates and fires targeted shots.

---

## Brain Checkpoints & Server API

The built-in Python server (`server.py`) provides local file storage without triggering browser file downloads:

- **`POST /api/save-brain`**: Saves the current generation's best neural network into `data/default_brain.json` and a generational archive `data/brain_gen_{N}.json`.
- **`GET /api/list-brains`**: Scans the `data/` folder and returns a list of all saved checkpoints with file sizes and generation tags.
- **`GET /data/{filename}`**: Serves checkpoint JSON files directly for in-browser loading.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AsteroidsAI.git
cd AsteroidsAI
```

### 2. Start the local server

Run the included Python server to support checkpoint saving and video streaming:

```bash
python3 server.py 8080
```

### 3. Open in your browser

Navigate to `http://localhost:8080`.

---

## Project Structure

```
AsteroidsAI/
├── index.html           # Main markup, arcade bezel layout, and service panel
├── server.py            # Local HTTP server with JSON checkpoint save/list API
├── css/
│   └── style.css        # Authentic cabinet styling, bezel art, and LED styles
├── js/
│   ├── main.js          # Core game loop, collision detection, sensory grid, saucers
│   ├── ai.js            # NEAT initialization, corridor avoidance, action triggers
│   ├── game.js          # Game lifecycle, asteroid factory, respawn logic
│   ├── render.js        # Vector drawing engine (ship, asteroids, lasers, CRT overlay)
│   ├── audio.js         # Web Audio procedural synthesis (lasers, explosions, sirens)
│   ├── state.js         # Global state store, Atari vector polygons, default constants
│   └── storage.js       # LocalStorage persistence, server API calls, checkpoint modal
├── assets/              # Authentic Atari side art, CRT textures, and intro video
└── data/                # Saved neural network checkpoints (.json)
```

---

## Operator Service Menu & Telemetry

Click **☰ MENU** in the upper-right corner to open the cabinet service drawer:

- **Hardware Diagnostic Audits**:
  - Recessed LED displays for `GEN`, `RUN`, `SCORE`, `DEATHS`, `TIME`, `FITNESS`, and `PEAK FITNESS`.
- **Death Cause Thermometer**: A visual breakdown showing percentage of deaths caused by Asteroids, Saucers, Bullets, or Hyperspace.
- **Audio Controls**: Mute toggle and master volume slider.
- **Brain Controls**:
  - **Save Brain**: Commits the active brain directly to `data/`.
  - **Load Brain**: Opens the checkpoint browser modal.
- **Tabbed Leaderboards**:
  - **Scores**: Top 10 scores achieved.
  - **Fitness**: Top 10 fitness values recorded.
  - **Survival**: Top 10 longest survival times.

---

## Configuring Hyperparameters

To tune simulation parameters, update the corresponding module in `js/`:

### Population & Genetic Algorithm (`js/ai.js`)

```javascript
state.neat = new neataptic.Neat(106, 5, null, {
  mutation: neataptic.methods.mutation.ALL,
  popsize: 100,        // Genomes per generation
  mutationRate: 0.3,   // Probability of mutation per offspring
  elitism: 10,         // Top genomes preserved untouched
  network: new neataptic.architect.Random(106, 25, 5),
});
```

### Game Balance & Lives (`js/state.js`)

```javascript
lives: 3,                // Starting lives per run
nextLifeScore: 10000,    // Points needed for an extra life
saucerTimeReload: 1800,  // Frames between saucer spawn attempts (~30s at 60 FPS)
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
