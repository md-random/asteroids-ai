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

function applyBrainData(data) {
    let popList = data.population || (Array.isArray(data) ? data : null);
    if (!Array.isArray(popList) || popList.length === 0) {
        throw new Error('No population data found.');
    }
    if (popList[0].input !== 106) {
        throw new Error(`Incompatible network: expected 106 inputs, found ${popList[0].input}.`);
    }

    state.neat.population = popList.map(j => neataptic.Network.fromJSON(j));
    state.generation = data.generation || state.generation || 1;
    state.genomeIndex = 0;
    state.bestFitnessThisGen = 0;

    if (data.topScores) {
        state.topScores = data.topScores;
        localStorage.setItem('asteroids_top10_grid_v2', JSON.stringify(state.topScores));
    }
    if (data.topTimes) {
        state.topTimes = data.topTimes;
        localStorage.setItem('asteroids_toptime_grid_v2', JSON.stringify(state.topTimes));
    }
    if (data.topFitness) {
        state.topFitness = data.topFitness;
        localStorage.setItem('asteroids_topfitness_grid_v2', JSON.stringify(state.topFitness));
    }
    if (data.deaths) {
        state.totalDeaths = data.deaths.total || 0;
        state.deathsByAsteroid = data.deaths.asteroid || 0;
        state.deathsBySaucer = data.deaths.saucer || 0;
        state.deathsByBullet = data.deaths.bullet || 0;
        state.deathsByHyper = data.deaths.hyper || 0;
        localStorage.setItem('asteroids_deaths_total_v2', state.totalDeaths);
        localStorage.setItem('asteroids_deaths_asteroid_v2', state.deathsByAsteroid);
        localStorage.setItem('asteroids_deaths_saucer_v2', state.deathsBySaucer);
        localStorage.setItem('asteroids_deaths_bullet_v2', state.deathsByBullet);
        localStorage.setItem('asteroids_deaths_hyper_v2', state.deathsByHyper);
    }

    localStorage.setItem('asteroids_ai_pop_grid_v2', JSON.stringify(popList));

    updateLeaderboardUI();
    updateThermometer('');
    document.getElementById('genDisplay').innerText = state.generation;
    document.getElementById('runDisplay').innerText = 1;
    resetGame();
}

export async function exportBrain() {
    if (!state.neat || !state.neat.population || state.neat.population.length === 0) {
        alert('No active AI population to save!');
        return;
    }

    const brainData = {
        version: 'v2',
        inputSize: 106,
        outputSize: 5,
        generation: state.generation,
        genomeIndex: state.genomeIndex,
        exportedAt: new Date().toISOString(),
        topScores: state.topScores,
        topTimes: state.topTimes,
        topFitness: state.topFitness,
        deaths: {
            total: state.totalDeaths,
            asteroid: state.deathsByAsteroid,
            saucer: state.deathsBySaucer,
            bullet: state.deathsByBullet,
            hyper: state.deathsByHyper
        },
        population: state.neat.population.map(n => n.toJSON())
    };

    // 1. Try 1-click auto-save to local server (data/default_brain.json)
    try {
        const res = await fetch('/api/save-brain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brainData)
        });
        if (res.ok) {
            alert(`Auto-saved to data/default_brain.json (Gen ${state.generation})!`);
            return;
        }
    } catch (e) {}

    // 2. Fallback to direct download if server is not handling POST
    const blob = new Blob([JSON.stringify(brainData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `default_brain.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function openLoadModal() {
    const modal = document.getElementById('loadModal');
    const list = document.getElementById('brainList');
    if (!modal || !list) return;

    list.innerHTML = '<div style="color:#888; padding: 15px;">Scanning saved checkpoints...</div>';
    modal.style.display = 'flex';

    try {
        const res = await fetch('/api/list-brains');
        if (!res.ok) throw new Error('Could not list brains');
        const brains = await res.json();

        if (brains.length === 0) {
            list.innerHTML = '<div style="color:#888; padding: 10px;">No saved brains in data/</div>';
        } else {
            let html = '';
            brains.forEach(b => {
                let isDefault = b.filename === 'default_brain.json';
                let label = isDefault ? '⭐ Default Brain' : b.filename;
                let genLabel = b.generation ? `Gen ${b.generation}` : '';
                html += `
                    <button class="brain-item-btn" onclick="loadBrainFile('${b.filename}')">
                        <span>${label}</span>
                        <span class="gen-tag">${genLabel}</span>
                    </button>
                `;
            });
            list.innerHTML = html;
        }
    } catch (e) {
        list.innerHTML = '<div style="color:#f55; padding: 10px;">Could not connect to server.</div>';
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'brain-item-btn';
    uploadBtn.style.marginTop = '8px';
    uploadBtn.style.borderColor = '#555';
    uploadBtn.innerHTML = '<span>📁 Upload Custom JSON File...</span>';
    uploadBtn.onclick = () => {
        closeLoadModal();
        document.getElementById('importBrainInput').click();
    };
    list.appendChild(uploadBtn);
}

export function closeLoadModal() {
    const modal = document.getElementById('loadModal');
    if (modal) modal.style.display = 'none';
}

export async function loadBrainFile(filename) {
    try {
        const res = await fetch(`data/${filename}`);
        if (!res.ok) throw new Error(`Could not load data/${filename}`);
        const data = await res.json();
        applyBrainData(data);
        closeLoadModal();
        if (window.closeIntroScreen) window.closeIntroScreen();
        alert(`Loaded ${filename} (Generation ${state.generation})!`);
    } catch (err) {
        alert('Failed to load brain: ' + err.message);
    }
}

export function importBrain(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            applyBrainData(data);
            alert(`Brain loaded successfully! Resumed at Generation ${state.generation}.`);
        } catch (err) {
            alert('Failed to parse brain JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}



