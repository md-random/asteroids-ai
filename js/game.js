import { state } from './state.js';
import { playBang } from './audio.js';
import { updateThermometer, updateLeaderboardUI } from './storage.js';

export function createAsteroid(x, y, size) {
    let speedMultiplier = (6 - size) * 0.8; 
    let shapeSelection = state.ATARI_SHAPES[Math.floor(Math.random() * state.ATARI_SHAPES.length)];
    return {
        x: x, y: y, 
        xv: (Math.random() - 0.5) * speedMultiplier,
        yv: (Math.random() - 0.5) * speedMultiplier,
        size: size, shape: shapeSelection,
        rot: 0, rotSpeed: (Math.random() - 0.5) * 0.02,
        isSaucer: false
    };
}

export function resetGame() {
    state.score = 0;
    state.framesAlive = 0;
    state.saucerTimer = 0;
    state.saucerTimeReload = 1800;
    state.lives = 3;
    state.extraLivesEarned = 0;
    state.nextLifeScore = 10000;
    state.bulletsFired = 0;
    state.bulletsHit = 0;
    state.visitedZones = new Set();
    state.runFitness = 0;
    state.bullets = [];
    state.enemyBullets = [];
    state.asteroids = [];

    for (let i = 0; i < 4; i++) {
        let x, y;
        do {
            x = Math.random() * state.canvas.width;
            y = Math.random() * state.canvas.height;
        } while (Math.sqrt(Math.pow(x - state.canvas.width/2, 2) + Math.pow(y - state.canvas.height/2, 2)) < 200);
        state.asteroids.push(createAsteroid(x, y, 3));
    }

    state.ship = {
        x: state.canvas.width / 2, y: state.canvas.height / 2, a: -Math.PI / 2, 
        dx: 0, dy: 0, rot: 0, thrusting: false,
        gridMap: new Array(100).fill(0),
        cooldown: 0, hyperPressed: false, isRespawning: false, respawnTimer: 0,
        prevMinDist: 200
    };

    document.getElementById('genDisplay').innerText = state.generation;
    document.getElementById('runDisplay').innerText = state.genomeIndex + 1;
    document.getElementById('scoreDisplay').innerText = state.score;
    document.getElementById('timeDisplay').innerText = '0.0s';
}

export function handleDeath(killer) {
    playBang(true);
    state.totalDeaths++;
    if (killer === 'Asteroid') state.deathsByAsteroid++;
    if (killer === 'Saucer') state.deathsBySaucer++;
    if (killer === 'Bullet') state.deathsByBullet++;
    if (killer === 'Hyperspace') state.deathsByHyper++;

    localStorage.setItem('asteroids_deaths_total_v2', state.totalDeaths);
    localStorage.setItem('asteroids_deaths_asteroid_v2', state.deathsByAsteroid);
    localStorage.setItem('asteroids_deaths_saucer_v2', state.deathsBySaucer);
    localStorage.setItem('asteroids_deaths_bullet_v2', state.deathsByBullet);
    localStorage.setItem('asteroids_deaths_hyper_v2', state.deathsByHyper);

    updateThermometer(killer);

    state.lives--;

    if (state.lives <= 0) {
        if (state.score > 0) {
            state.topScores.push({ gen: state.generation, run: state.genomeIndex + 1, score: state.score });
            state.topScores.sort((a, b) => b.score - a.score);
            state.topScores = state.topScores.slice(0, 10);
            localStorage.setItem('asteroids_top10_grid_v2', JSON.stringify(state.topScores));
        }

        let timeAlive = state.framesAlive / 60;
        if (timeAlive > 0.5) {
            state.topTimes.push({ gen: state.generation, run: state.genomeIndex + 1, time: parseFloat(timeAlive.toFixed(1)) });
            state.topTimes.sort((a, b) => b.time - a.time);
            state.topTimes = state.topTimes.slice(0, 10);
            localStorage.setItem('asteroids_toptime_grid_v2', JSON.stringify(state.topTimes));
        }
        updateLeaderboardUI();

        let fitnessScore = Math.max(0, Math.round(state.runFitness)); 
        state.neat.population[state.genomeIndex].score = fitnessScore;
        state.lastFitness = fitnessScore;
        if (fitnessScore > state.bestFitnessThisGen) state.bestFitnessThisGen = fitnessScore;
        document.getElementById('fitnessDisplay').innerText = fitnessScore;
        document.getElementById('bestFitnessDisplay').innerText = Math.round(state.bestFitnessThisGen);

        if (fitnessScore > 0) {
            state.topFitness.push({ gen: state.generation, run: state.genomeIndex + 1, fitness: fitnessScore });
            state.topFitness.sort((a, b) => b.fitness - a.fitness);
            state.topFitness = state.topFitness.slice(0, 10);
            localStorage.setItem('asteroids_topfitness_grid_v2', JSON.stringify(state.topFitness));
            updateLeaderboardUI();
        }

        state.genomeIndex++;
        if (state.genomeIndex >= state.neat.popsize) {
            state.neat.sort();
            let newPop = [];
            for (let k = 0; k < state.neat.elitism; k++) newPop.push(state.neat.population[k]);
            for (let k = 0; k < state.neat.popsize - state.neat.elitism; k++) newPop.push(state.neat.getOffspring());
            state.neat.population = newPop;
            state.neat.mutate();
            state.genomeIndex = 0;
            state.generation++;
            state.bestFitnessThisGen = 0;
            localStorage.setItem('asteroids_ai_pop_grid_v2', JSON.stringify(state.neat.population.map(n => n.toJSON())));
        }
        document.getElementById('genDisplay').innerText = state.generation;
        document.getElementById('runDisplay').innerText = state.genomeIndex + 1;

        resetGame();
        return true; 
    }

    state.ship.isRespawning = true;
    state.ship.respawnTimer = 180;
    state.ship.x = state.canvas.width / 2;
    state.ship.y = state.canvas.height / 2;
    state.ship.dx = 0;
    state.ship.dy = 0;
    state.ship.a = -Math.PI / 2;
    state.ship.hyperPressed = false;
    state.ship.prevMinDist = 200;
    state.bullets = [];
    return false;
}
