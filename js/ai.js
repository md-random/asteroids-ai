import { state } from './state.js';
import { playShoot } from './audio.js';
import { handleDeath } from './game.js';

export function initAI() {
    state.neat = new neataptic.Neat(106, 5, null, {
        mutation: neataptic.methods.mutation.ALL,
        popsize: 100,
        mutationRate: 0.3,
        elitism: 10,
        network: new neataptic.architect.Random(106, 25, 5)
    });
    let saved = localStorage.getItem('asteroids_ai_pop_grid_v2');
    if (saved) {
        try {
            let pop = JSON.parse(saved).map(j => neataptic.Network.fromJSON(j));
            if (pop.length > 0 && pop[0].input === 106) {
                state.neat.population = pop;
            }
        } catch(e) {}
    }
}

export async function loadDefaultBrainIfEmpty() {
    let saved = localStorage.getItem('asteroids_ai_pop_grid_v2');
    if (!saved) {
        try {
            let res = await fetch('data/default_brain.json?v=' + Date.now());
            if (res.ok) {
                let data = await res.json();
                let popList = data.population || (Array.isArray(data) ? data : null);
                if (Array.isArray(popList) && popList.length > 0 && popList[0].input === 106) {
                    state.neat.population = popList.map(j => neataptic.Network.fromJSON(j));
                    if (data.generation) state.generation = data.generation;
                    if (data.topScores) state.topScores = data.topScores;
                    if (data.topTimes) state.topTimes = data.topTimes;
                    if (data.topFitness) state.topFitness = data.topFitness;
                    localStorage.setItem('asteroids_ai_pop_grid_v2', JSON.stringify(popList));
                    if (document.getElementById('genDisplay')) {
                        document.getElementById('genDisplay').innerText = state.generation;
                    }
                    console.log(`Loaded default pre-trained brain from data/default_brain.json (Gen ${state.generation})`);
                }
            }
        } catch(e) {
            // Server has no default brain or offline - runs standard initial random networks
        }
    }
}

export function act() {
    let inputs = [
        ...state.ship.gridMap,
        state.ship.x / state.canvas.width,
        state.ship.y / state.canvas.height,
        state.ship.dx / 5,
        state.ship.dy / 5,
        Math.cos(state.ship.a),
        Math.sin(state.ship.a)
    ];
    let outputs = state.neat.population[state.genomeIndex].activate(inputs);
    
    let minDist = Infinity;
    let aimedAtAny = false;
    let inCollisionCorridor = false;
    
    state.asteroids.forEach(a => {
        let dx = a.x - state.ship.x;
        let dy = a.y - state.ship.y;
        if (dx > state.canvas.width/2) dx -= state.canvas.width;
        if (dx < -state.canvas.width/2) dx += state.canvas.width;
        if (dy > state.canvas.height/2) dy -= state.canvas.height;
        if (dy < -state.canvas.height/2) dy += state.canvas.height;
        
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) minDist = dist;
        
        let targetAngle = Math.atan2(dy, dx);
        let angleDiff = Math.abs(state.ship.a - targetAngle) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff = (Math.PI * 2) - angleDiff;
        
        let targetRadius = (a.size * 10) || 20;
        let aimTolerance = Math.max(0.22, Math.atan2(targetRadius, Math.max(dist, 1)));
        if (angleDiff < aimTolerance && dist < 380) {
            aimedAtAny = true;
        }

        // Relative velocity obstacle check (flight corridor)
        let relVx = state.ship.dx - (a.xv || 0);
        let relVy = state.ship.dy - (a.yv || 0);
        let relSpeedSq = relVx * relVx + relVy * relVy;
        if (relSpeedSq > 0.15) {
            let dot = dx * relVx + dy * relVy;
            if (dot > 0) {
                let tClose = dot / relSpeedSq;
                if (tClose > 0 && tClose < 40) {
                    let perpDistSq = (dx * dx + dy * dy) - (tClose * tClose * relSpeedSq);
                    let collisionBuffer = targetRadius + 18;
                    if (perpDistSq >= 0 && Math.sqrt(perpDistSq) < collisionBuffer) {
                        inCollisionCorridor = true;
                    }
                }
            }
        }
    });
    
    state.enemyBullets.forEach(b => {
        let dx = b.x - state.ship.x;
        let dy = b.y - state.ship.y;
        if (dx > state.canvas.width/2) dx -= state.canvas.width;
        if (dx < -state.canvas.width/2) dx += state.canvas.width;
        if (dy > state.canvas.height/2) dy -= state.canvas.height;
        if (dy < -state.canvas.height/2) dy += state.canvas.height;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) minDist = dist;

        let relVx = state.ship.dx - b.xv;
        let relVy = state.ship.dy - b.yv;
        let relSpeedSq = relVx * relVx + relVy * relVy;
        if (relSpeedSq > 0.1) {
            let dot = dx * relVx + dy * relVy;
            if (dot > 0) {
                let tClose = dot / relSpeedSq;
                if (tClose > 0 && tClose < 30) {
                    let perpDistSq = (dx * dx + dy * dy) - (tClose * tClose * relSpeedSq);
                    if (perpDistSq >= 0 && Math.sqrt(perpDistSq) < 18) {
                        inCollisionCorridor = true;
                    }
                }
            }
        }
    });
    
    // 1. Gentle baseline survival bonus
    if (minDist > 100) state.runFitness += 0.2;

    // 2. Dynamic evasive maneuvering: reward widening gap when in close proximity
    if (minDist < 120 && state.ship.prevMinDist !== undefined) {
        if (minDist > state.ship.prevMinDist) {
            state.runFitness += 0.5;
        }
    }
    state.ship.prevMinDist = minDist;
    
    // Steering controls
    state.ship.rot = 0;
    if (outputs[0] > outputs[1] && outputs[0] > 0.5) state.ship.rot = -0.1;
    else if (outputs[1] > outputs[0] && outputs[1] > 0.5) state.ship.rot = 0.1; 
    
    let shipThrusting = outputs[2] > 0.5;
    state.ship.thrusting = shipThrusting;     

    // 3. Blind Kamikaze Penalty: only penalized when holding full thrust straight into an imminent obstacle corridor
    if (inCollisionCorridor && shipThrusting) {
        state.runFitness = Math.max(0, state.runFitness - 1.5);
    }
    
    // 4. Disciplined Targeted Shooting
    if (state.ship.cooldown > 0) state.ship.cooldown--;
    if (outputs[3] > 0.5 && state.bullets.length < 4 && state.ship.cooldown === 0) {
        let shotAimed = aimedAtAny;
        state.bullets.push({
            x: state.ship.x, y: state.ship.y, 
            xv: state.ship.dx + 10 * Math.cos(state.ship.a), 
            yv: state.ship.dy + 10 * Math.sin(state.ship.a),
            aimed: shotAimed,
            life: 60
        });
        state.ship.cooldown = 15; 
        state.bulletsFired++;
        playShoot(); 

        if (shotAimed) {
            // Targeted shot with asteroid or saucer in sights
            state.runFitness += 2;
        } else {
            // Wasted shot into empty space
            state.runFitness = Math.max(0, state.runFitness - 1.5);
        }
    }

    let wantsHyper = outputs[4] > 0.7;
    if (wantsHyper && !state.ship.hyperPressed) {
        state.ship.hyperPressed = true; 
        
        let roll = Math.floor(Math.random() * 32) * 2;
        let activeAsteroids = state.asteroids.filter(a => !a.isSaucer).length;
        if (roll >= (activeAsteroids + 44)) {
            handleDeath('Hyperspace');
            return;
        }

        state.ship.x = Math.random() * state.canvas.width;
        state.ship.y = Math.random() * state.canvas.height;
        state.ship.dx = 0;
        state.ship.dy = 0;
    } else if (!wantsHyper) {
        state.ship.hyperPressed = false; 
    }
    return false;
}
