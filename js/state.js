export const state = {
    audioCtx: null,
    masterGain: null,
    isMuted: true,
    globalVolume: 0.2,

    topScores: JSON.parse(localStorage.getItem('asteroids_top10_grid_v2')) || [],
    topTimes: JSON.parse(localStorage.getItem('asteroids_toptime_grid_v2')) || [],
    topFitness: JSON.parse(localStorage.getItem('asteroids_topfitness_grid_v2')) || [],
    
    totalDeaths: parseInt(localStorage.getItem('asteroids_deaths_total_v2')) || 0,
    deathsByAsteroid: parseInt(localStorage.getItem('asteroids_deaths_asteroid_v2')) || 0,
    deathsBySaucer: parseInt(localStorage.getItem('asteroids_deaths_saucer_v2')) || 0,
    deathsByBullet: parseInt(localStorage.getItem('asteroids_deaths_bullet_v2')) || 0,
    deathsByHyper: parseInt(localStorage.getItem('asteroids_deaths_hyper_v2')) || 0,

    generation: 1,
    genomeIndex: 0,
    lastFitness: 0,
    bestFitnessThisGen: 0,
    neat: null,
    isIntroActive: true,
    
    score: 0,
    framesAlive: 0,
    saucerTimer: 0,
    saucerSirenTimer: 0,
    saucerTimeReload: 1800,
    bulletsFired: 0,
    bulletsHit: 0,
    visitedZones: new Set(),
    runFitness: 0,
    lives: 3,
    extraLivesEarned: 0,
    nextLifeScore: 10000,
    
    ship: {},
    bullets: [],
    enemyBullets: [],
    asteroids: [],

    canvas: null,
    ctx: null,

    RAY_COUNT: 16,
    ATARI_SHAPES: [
        [ [0.6, 0.3], [1.0, 0.0], [0.6, -0.6], [0.0, -1.0], [-0.3, -0.6], [-0.6, -1.0], [-1.0, -0.6], [-1.0, 0.0], [-0.3, 0.3], [-1.0, 0.6], [-0.3, 1.0], [0.3, 1.0] ],
        [ [0.6, 0.3], [1.0, 0.0], [0.6, -0.6], [0.3, -1.0], [-0.3, -1.0], [-1.0, -0.3], [-1.0, 0.3], [-0.3, 0.6], [-0.6, 1.0], [0.0, 1.0], [0.6, 0.6] ],
        [ [0.3, 0.0], [1.0, -0.3], [0.3, -0.6], [0.6, -1.0], [0.0, -1.0], [-0.6, -0.6], [-1.0, 0.0], [-0.6, 0.3], [-1.0, 0.6], [-0.3, 1.0], [0.3, 0.6], [0.6, 0.6] ],
        [ [0.6, 0.0], [1.0, -0.3], [0.6, -0.6], [0.0, -1.0], [-0.6, -0.6], [-1.0, -0.3], [-1.0, 0.3], [-0.6, 0.6], [0.0, 1.0], [0.6, 0.6], [0.3, 0.3] ]
    ],
    SAUCER_SHAPE: [ 
        [-1, 0], [-0.5, -0.3], [0.5, -0.3], [1, 0], [0.5, 0.3], [-0.5, 0.3], [-1, 0], 
        [1, 0], 
        [0.5, -0.3], [0.2, -0.7], [-0.2, -0.7], [-0.5, -0.3] 
    ]
};

// Calculate initial generation logic
let maxScoreGen = state.topScores.length > 0 ? Math.max(...state.topScores.map(s => s.gen)) : 0;
let maxTimeGen = state.topTimes.length > 0 ? Math.max(...state.topTimes.map(t => t.gen)) : 0;
let highestSavedGen = Math.max(maxScoreGen, maxTimeGen);
if (highestSavedGen > 0) state.generation = highestSavedGen + 1;
