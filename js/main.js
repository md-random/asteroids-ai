import { state } from './state.js';
import { toggleMute, updateVolume, playSaucerSiren, playSaucerShoot, playBang } from './audio.js';
import { updateLeaderboardUI, resetAI, clearLeaderboards, updateThermometer } from './storage.js';
import { initAI, act } from './ai.js';
import { createAsteroid, resetGame, handleDeath } from './game.js';
import { drawGame } from './render.js';

// Expose handlers to window for HTML inline events
window.toggleMute = toggleMute;
window.updateVolume = updateVolume;
window.resetAI = resetAI;
window.clearLeaderboards = clearLeaderboards;

state.canvas = document.getElementById('gameCanvas');
state.ctx = state.canvas.getContext('2d');

function resizeCanvas() {
    let margin = 50;
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight;
    
    let size = Math.min(availableWidth, availableHeight) - (margin * 2);
    if (size < 200) size = 200;
    
    size = Math.floor(size);
    
    state.canvas.width = size;
    state.canvas.height = size;
    state.canvas.style.width = size + 'px';
    state.canvas.style.height = size + 'px';
    state.canvas.style.aspectRatio = '1 / 1';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

state.ctx.lineCap = 'round';
state.ctx.lineJoin = 'round';

updateLeaderboardUI();
initAI();
resetGame();
updateThermometer(null);

function update() {
    if (!state.ship.isRespawning) {
        act();
        state.framesAlive++;
    }
    
    state.saucerTimer++;

    let activeRocks = state.asteroids.filter(a => !a.isSaucer);
    if (activeRocks.length === 0) {
        for (let i = 0; i < 4; i++) {
            let x, y;
            do {
                x = Math.random() * state.canvas.width;
                y = Math.random() * state.canvas.height;
            } while (Math.sqrt(Math.pow(x - state.ship.x, 2) + Math.pow(y - state.ship.y, 2)) < 200); 
            state.asteroids.push(createAsteroid(x, y, 3));
        }
    }

    if (state.saucerTimer > state.saucerTimeReload) {
        let saucerExists = state.asteroids.some(a => a.isSaucer);
        if (!saucerExists) {
            let isLeft = (state.score % 20) === 0;
            let isSmallSaucer = false;
            if (state.score >= 35000) {
                isSmallSaucer = true;
            } else if (state.score >= 8000) {
                isSmallSaucer = Math.random() < 0.5;
            }
            state.asteroids.push({
                x: isLeft ? 0 : state.canvas.width, 
                y: (state.score * 7) % state.canvas.height,
                xv: isLeft ? (isSmallSaucer ? 3 : 2) : (isSmallSaucer ? -3 : -2), 
                yv: 0,
                size: isSmallSaucer ? 1 : 2, 
                shape: state.SAUCER_SHAPE,
                rot: 0, rotSpeed: 0, 
                isSaucer: true,
                isSmallSaucer: isSmallSaucer,
                shootCooldown: isSmallSaucer ? 30 : 45
            });
            state.saucerTimeReload = Math.max(450, state.saucerTimeReload - 85);
        }
        state.saucerTimer = 0;
    }

    let timeAlive = parseFloat((state.framesAlive / 60).toFixed(1));
    document.getElementById('timeDisplay').innerText = timeAlive + 's';
    document.getElementById('fitnessDisplay').innerText = Math.max(0, Math.round(state.runFitness));

    const wrap = (obj) => {
        if (obj.x < 0) obj.x += state.canvas.width;
        else if (obj.x >= state.canvas.width) obj.x -= state.canvas.width;
        if (obj.y < 0) obj.y += state.canvas.height;
        else if (obj.y >= state.canvas.height) obj.y -= state.canvas.height;
    };

    if (!state.ship.isRespawning) {
        state.ship.a += state.ship.rot;
        if (state.ship.thrusting) {
            state.ship.dx += 0.08 * Math.cos(state.ship.a);
            state.ship.dy += 0.08 * Math.sin(state.ship.a);
        }
        state.ship.dx *= 0.99; 
        state.ship.dy *= 0.99;
        state.ship.x += state.ship.dx;
        state.ship.y += state.ship.dy;
        wrap(state.ship);

        let col = Math.floor(state.ship.x / (state.canvas.width / 4));
        let row = Math.floor(state.ship.y / (state.canvas.height / 4));
        col = Math.max(0, Math.min(3, col)); 
        row = Math.max(0, Math.min(3, row));
        state.visitedZones.add(`${col},${row}`);
    } else {
        state.ship.respawnTimer--;
        if (state.ship.respawnTimer <= 0) {
            let isSafe = true;
            for (let a of state.asteroids) {
                if (Math.sqrt(Math.pow(a.x - state.ship.x, 2) + Math.pow(a.y - state.ship.y, 2)) < (a.size * 10) + 120) {
                    isSafe = false;
                    break;
                }
            }
            if (isSafe) {
                for (let b of state.enemyBullets) {
                    if (Math.sqrt(Math.pow(b.x - state.ship.x, 2) + Math.pow(b.y - state.ship.y, 2)) < 120) {
                        isSafe = false;
                        break;
                    }
                }
            }
            if (isSafe) {
                state.ship.isRespawning = false;
            }
        }
    }

    for (let i = state.bullets.length - 1; i >= 0; i--) {
        state.bullets[i].x += state.bullets[i].xv;
        state.bullets[i].y += state.bullets[i].yv;
        wrap(state.bullets[i]);
        state.bullets[i].life = (state.bullets[i].life || 60) - 1;
        if (state.bullets[i].life <= 0) {
            state.bullets.splice(i, 1);
        }
    }

    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        state.enemyBullets[i].x += state.enemyBullets[i].xv;
        state.enemyBullets[i].y += state.enemyBullets[i].yv;
        wrap(state.enemyBullets[i]);
        state.enemyBullets[i].life = (state.enemyBullets[i].life || 90) - 1;
        if (state.enemyBullets[i].life <= 0) {
            state.enemyBullets.splice(i, 1);
        }
    }

    for (let j = state.asteroids.length - 1; j >= 0; j--) {
        let a = state.asteroids[j];
        a.x += a.xv;
        a.y += a.yv;
        a.rot += a.rotSpeed;

        if (a.isSaucer) {
            if ((a.xv > 0 && a.x > state.canvas.width) || (a.xv < 0 && a.x < 0)) {
                state.asteroids.splice(j, 1);
                continue;
            }
            state.saucerSirenTimer++;
            if (state.saucerSirenTimer > 15) {
                playSaucerSiren();
                state.saucerSirenTimer = 0;
            }
            if (a.shootCooldown > 0) a.shootCooldown--;
            if (a.shootCooldown <= 0) {
                let exactAngle;
                if (!a.isSmallSaucer) {
                    exactAngle = Math.random() * Math.PI * 2;
                } else {
                    exactAngle = Math.atan2(state.ship.y - a.y, state.ship.x - a.x);
                    if (state.score < 35000) {
                        exactAngle += (Math.random() - 0.5) * 0.4;
                    }
                }
                let arcadeAngle = Math.round(exactAngle / 0.392) * 0.392;
                state.enemyBullets.push({x: a.x, y: a.y, xv: 6 * Math.cos(arcadeAngle), yv: 6 * Math.sin(arcadeAngle), life: 90});
                a.shootCooldown = a.isSmallSaucer ? 30 : 45;
                playSaucerShoot();
            }
        } else {
            wrap(a);
        }
    }

    if (!state.ship.isRespawning) {
        let gridInputs = new Array(100).fill(0);
        let cellCounts = new Array(25).fill(0);
        let cellW = state.canvas.width / 5;
        let cellH = state.canvas.height / 5;

        state.asteroids.forEach(a => {
            let dx = a.x - state.ship.x;
            let dy = a.y - state.ship.y;
            if (dx > state.canvas.width/2) dx -= state.canvas.width;
            if (dx < -state.canvas.width/2) dx += state.canvas.width;
            if (dy > state.canvas.height/2) dy -= state.canvas.height;
            if (dy < -state.canvas.height/2) dy += state.canvas.height;

            let col = Math.floor((dx + state.canvas.width/2) / cellW);
            let row = Math.floor((dy + state.canvas.height/2) / cellH);
            col = Math.max(0, Math.min(4, col));
            row = Math.max(0, Math.min(4, row));
            let idx = row * 5 + col;
            gridInputs[idx * 4 + 0] += a.size / 3;
            gridInputs[idx * 4 + 2] += a.xv / 5;
            gridInputs[idx * 4 + 3] += a.yv / 5;
            cellCounts[idx]++;
        });

        state.enemyBullets.forEach(b => {
            let dx = b.x - state.ship.x;
            let dy = b.y - state.ship.y;
            if (dx > state.canvas.width/2) dx -= state.canvas.width;
            if (dx < -state.canvas.width/2) dx += state.canvas.width;
            if (dy > state.canvas.height/2) dy -= state.canvas.height;
            if (dy < -state.canvas.height/2) dy += state.canvas.height;

            let col = Math.floor((dx + state.canvas.width/2) / cellW);
            let row = Math.floor((dy + state.canvas.height/2) / cellH);
            col = Math.max(0, Math.min(4, col));
            row = Math.max(0, Math.min(4, row));
            let idx = row * 5 + col;
            gridInputs[idx * 4 + 1] += 1;
            gridInputs[idx * 4 + 2] += b.xv / 5;
            gridInputs[idx * 4 + 3] += b.yv / 5;
            cellCounts[idx]++;
        });

        for (let i = 0; i < 25; i++) {
            if (cellCounts[i] > 0) {
                gridInputs[i * 4 + 2] /= cellCounts[i];
                gridInputs[i * 4 + 3] /= cellCounts[i];
            }
        }
        
        state.ship.gridMap = gridInputs;
    }

    if (!state.ship.isRespawning) {
        for (let i = 0; i < state.enemyBullets.length; i++) {
            let dx = state.ship.x - state.enemyBullets[i].x;
            let dy = state.ship.y - state.enemyBullets[i].y;
            if (Math.sqrt(dx*dx + dy*dy) < 15) {
                handleDeath('Bullet');
                requestAnimationFrame(update);
                return;
            }
        }

        for (let j = 0; j < state.asteroids.length; j++) {
            let a = state.asteroids[j];
            let dx = state.ship.x - a.x;
            let dy = state.ship.y - a.y;
            if (Math.sqrt(dx*dx + dy*dy) < (a.size * 10) + 10) {
                handleDeath(a.isSaucer ? 'Saucer' : 'Asteroid');
                requestAnimationFrame(update);
                return;
            }
        }
    }

    for (let i = state.bullets.length - 1; i >= 0; i--) {
        let bulletDestroyed = false;
        for (let j = state.asteroids.length - 1; j >= 0; j--) {
            let a = state.asteroids[j];
            let r = a.size * 10; 
            let dx = state.bullets[i].x - a.x;
            let dy = state.bullets[i].y - a.y;

            if (Math.sqrt(dx*dx + dy*dy) < r) { 
                state.bullets.splice(i, 1);
                state.asteroids.splice(j, 1);
                bulletDestroyed = true;
                state.bulletsHit++;
                
                let points = 0;
                if (a.isSaucer) {
                    points = a.isSmallSaucer ? 1000 : 500;
                } else {
                    if (a.size === 3) points = 20;
                    else if (a.size === 2) points = 50;
                    else if (a.size === 1) points = 100;
                }
                state.score += points; 
                state.runFitness += points; 
                document.getElementById('scoreDisplay').innerText = state.score;
                playBang(false); 

                if (state.score >= state.nextLifeScore) {
                    state.lives++;
                    state.extraLivesEarned++;
                    state.nextLifeScore += 10000;
                }

                if (a.size > 1 && !a.isSaucer) {
                    state.asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                    state.asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                }
                break; 
            }
        }
        if (bulletDestroyed) continue;
    }

    drawGame();
    requestAnimationFrame(update);
}

update();
