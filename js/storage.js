import { state } from './state.js';
import { initAI } from './ai.js';
import { resetGame } from './game.js';

export function updateLeaderboardUI() {
    const scoreList = document.getElementById('leaderboardList');
    if (state.topScores.length === 0) {
        scoreList.innerHTML = '<li>No scores yet</li>';
    } else {
        let sHtml = '';
        state.topScores.forEach((s, index) => {
            let run = s.run !== undefined ? s.run : '?';
            let label = `Gen ${s.gen} / Run ${run}`;
            sHtml += `<li onclick="alert('Replay functionality coming soon!')"><span>${index + 1}. ${label}</span><span>${s.score} pts</span></li>`;
        });
        scoreList.innerHTML = sHtml;
    }

    const timeList = document.getElementById('timeLeaderboardList');
    if (state.topTimes.length === 0) {
        timeList.innerHTML = '<li>No times yet</li>';
    } else {
        let tHtml = '';
        state.topTimes.forEach((t, index) => {
            let run = t.run !== undefined ? t.run : '?';
            let label = `Gen ${t.gen} / Run ${run}`;
            tHtml += `<li onclick="alert('Replay functionality coming soon!')"><span>${index + 1}. ${label}</span><span>${t.time}s</span></li>`;
        });
        timeList.innerHTML = tHtml;
    }

    const fitList = document.getElementById('fitnessLeaderboardList');
    if (state.topFitness.length === 0) {
        fitList.innerHTML = '<li>No fitness yet</li>';
    } else {
        let fHtml = '';
        state.topFitness.forEach((f, index) => {
            let run = f.run !== undefined ? f.run : '?';
            let label = `Gen ${f.gen} / Run ${run}`;
            fHtml += `<li onclick="alert('Replay functionality coming soon!')"><span>${index + 1}. ${label}</span><span style="color:#ff0;">${Math.round(f.fitness)}</span></li>`;
        });
        fitList.innerHTML = fHtml;
    }
}

export function resetAI() {
    if (!confirm('Reset the AI brain? This wipes all trained networks and leaderboards and starts fresh.')) return;
    localStorage.removeItem('asteroids_ai_pop_grid_v2');
    localStorage.removeItem('asteroids_top10_grid_v2');
    localStorage.removeItem('asteroids_toptime_grid_v2');
    localStorage.removeItem('asteroids_topfitness_grid_v2');
    localStorage.removeItem('asteroids_deaths_total_v2');
    localStorage.removeItem('asteroids_deaths_asteroid_v2');
    localStorage.removeItem('asteroids_deaths_saucer_v2');
    localStorage.removeItem('asteroids_deaths_bullet_v2');
    localStorage.removeItem('asteroids_deaths_hyper_v2');
    
    state.totalDeaths = 0;
    state.deathsByAsteroid = 0;
    state.deathsBySaucer = 0;
    state.deathsByBullet = 0;
    state.deathsByHyper = 0;
    updateThermometer('');
    
    state.topScores = [];
    state.topTimes = [];
    state.topFitness = [];
    state.genomeIndex = 0;
    state.generation = 1;
    
    initAI();
    updateLeaderboardUI();
    document.getElementById('genDisplay').innerText = state.generation;
    document.getElementById('runDisplay').innerText = 1;
    resetGame();
}

export function clearLeaderboards() {
    if (!confirm('Clear both leaderboards? This removes all saved scores and times.\nAI training is not affected.')) return;
    state.topScores = [];
    state.topTimes = [];
    state.topFitness = [];
    localStorage.removeItem('asteroids_top10_grid_v2');
    localStorage.removeItem('asteroids_toptime_grid_v2');
    localStorage.removeItem('asteroids_topfitness_grid_v2');
    updateLeaderboardUI();
}

export function updateThermometer(killer) {
    if (killer) {
        document.getElementById('lastKiller').innerText = killer;
        if (killer === 'Asteroid') document.getElementById('lastKiller').style.color = '#0088ff';
        if (killer === 'Saucer') document.getElementById('lastKiller').style.color = '#ff0000';
        if (killer === 'Bullet') document.getElementById('lastKiller').style.color = '#ffd700';
        if (killer === 'Hyperspace') document.getElementById('lastKiller').style.color = '#a020f0';
    }
    if (state.totalDeaths > 0) {
        let pctA = (state.deathsByAsteroid / state.totalDeaths * 100);
        let pctS = (state.deathsBySaucer / state.totalDeaths * 100);
        let pctB = (state.deathsByBullet / state.totalDeaths * 100);
        let pctH = (state.deathsByHyper / state.totalDeaths * 100);
        
        document.getElementById('barAsteroid').style.width = pctA + '%';
        document.getElementById('barSaucer').style.width = pctS + '%';
        document.getElementById('barBullet').style.width = pctB + '%';
        document.getElementById('barHyper').style.width = pctH + '%';

        document.getElementById('barAsteroid').innerText = pctA >= 5 ? Math.round(pctA) + '%' : '';
        document.getElementById('barSaucer').innerText = pctS >= 5 ? Math.round(pctS) + '%' : '';
        document.getElementById('barBullet').innerText = pctB >= 5 ? Math.round(pctB) + '%' : '';
        document.getElementById('barHyper').innerText = pctH >= 5 ? Math.round(pctH) + '%' : '';
    }
    document.getElementById('deathDisplay').innerText = state.totalDeaths;
}
