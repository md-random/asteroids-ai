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
        if (angleDiff < (15 * Math.PI / 180)) aimedAtAny = true;
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
    });
    
    if (minDist > 100) state.runFitness += 1;
    if (aimedAtAny) state.runFitness += 1;
    
    state.ship.rot = 0;
    if (outputs[0] > outputs[1] && outputs[0] > 0.5) state.ship.rot = -0.1;
    else if (outputs[1] > outputs[0] && outputs[1] > 0.5) state.ship.rot = 0.1; 
    
    state.ship.thrusting = outputs[2] > 0.5;     
    
    if (state.ship.cooldown > 0) state.ship.cooldown--;
    if (outputs[3] > 0.5 && state.bullets.length < 4 && state.ship.cooldown === 0) {
        state.bullets.push({
            x: state.ship.x, y: state.ship.y, 
            xv: state.ship.dx + 10 * Math.cos(state.ship.a), 
            yv: state.ship.dy + 10 * Math.sin(state.ship.a),
            aimed: false,
            life: 60
        });
        state.ship.cooldown = 15; 
        state.bulletsFired++;
        playShoot(); 
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
