import re

with open("index.html", "r") as f:
    code = f.read()

# 1. Update Stats HTML
stats_old = """        <div class="stats">
            GEN: <span id="genDisplay" style="display:inline-block; width: 50px; text-align: left;">1</span><br><br>"""
stats_new = """        <div class="stats">
            PLAYER: <span id="playerDisplay" style="color: #0ff; font-weight: bold;">P1 (BLUE)</span><br><br>
            GEN: <span id="genDisplay" style="display:inline-block; width: 50px; text-align: left;">1</span><br><br>"""
code = code.replace(stats_old, stats_new)

# 2. Add Thermometer killer hyperspace
therm_old = """                <div id="barBullet" class="death-bar death-bar-bullet" title="Bullets"></div>
            </div>"""
therm_new = """                <div id="barBullet" class="death-bar death-bar-bullet" title="Bullets"></div>
                <div id="barHyper" class="death-bar" style="background: #a020f0; width: 0%; transition: width 0.3s;" title="Hyperspace"></div>
            </div>"""
code = code.replace(therm_old, therm_new)

labels_old = """                <span style="color:#0088ff">Ast</span> &nbsp; <span style="color:#ff0000">Sau</span> &nbsp; <span style="color:#ffd700">Bul</span>
            </div>"""
labels_new = """                <span style="color:#0088ff">Ast</span> &nbsp; <span style="color:#ff0000">Sau</span> &nbsp; <span style="color:#ffd700">Bul</span> &nbsp; <span style="color:#a020f0">Hyp</span>
            </div>"""
code = code.replace(labels_old, labels_new)

# 3. State variables
state_old = """        let score = 0;
        let framesAlive = 0;
        let saucerTimer = 0;
        let saucerSirenTimer = 0;

        let totalDeaths = parseInt(localStorage.getItem('asteroids_deaths_total')) || 0;
        let deathsByAsteroid = parseInt(localStorage.getItem('asteroids_deaths_asteroid')) || 0;
        let deathsBySaucer = parseInt(localStorage.getItem('asteroids_deaths_saucer')) || 0;
        let deathsByBullet = parseInt(localStorage.getItem('asteroids_deaths_bullet')) || 0;
        let lives = 3;
        let extraLivesEarned = 0;
        let nextLifeScore = 10000;
        window.saucerTimeReload = 1800; // Initial delay ~30 seconds

        let ship = {};
        let bullets = [];
        let enemyBullets = [];
        let asteroids = [];

        let neat;
        let genomeIndex = 0;
        
        function initAI() {
            neat = new neataptic.Neat(16, 4, null, {
                mutation: neataptic.methods.mutation.ALL,
                popsize: 50,
                mutationRate: 0.3,
                elitism: 5,
                network: new neataptic.architect.Random(16, 8, 4)
            });
            let saved = localStorage.getItem('asteroids_ai_pop_v2');
            if (saved) {
                neat.population = JSON.parse(saved).map(j => neataptic.Network.fromJSON(j));
            }
        }
        initAI();"""

state_new = """        let score = 0;
        let framesAlive = 0;
        let saucerTimer = 0;
        let saucerTimeReload = 1800;
        let saucerSirenTimer = 0;

        let totalDeaths = parseInt(localStorage.getItem('asteroids_deaths_total')) || 0;
        let deathsByAsteroid = parseInt(localStorage.getItem('asteroids_deaths_asteroid')) || 0;
        let deathsBySaucer = parseInt(localStorage.getItem('asteroids_deaths_saucer')) || 0;
        let deathsByBullet = parseInt(localStorage.getItem('asteroids_deaths_bullet')) || 0;
        let deathsByHyper = parseInt(localStorage.getItem('asteroids_deaths_hyper')) || 0;
        let lives = 3;
        let extraLivesEarned = 0;
        let nextLifeScore = 10000;

        let ship = {};
        let bullets = [];
        let enemyBullets = [];
        let asteroids = [];
        let bulletsFired = 0;
        let bulletsHit = 0;

        let neatBlue;
        let neatRed;
        let genomeIndex = 0;
        
        let p1State = null;
        let p2State = null;
        let currentPlayer = 1;
        
        function initAI() {
            let options = {
                mutation: neataptic.methods.mutation.ALL,
                popsize: 50,
                mutationRate: 0.3,
                elitism: 5,
                network: new neataptic.architect.Random(16, 8, 5) // 5 outputs for hyperspace
            };
            neatBlue = new neataptic.Neat(16, 5, null, options);
            neatRed = new neataptic.Neat(16, 5, null, options);
            
            let savedB = localStorage.getItem('asteroids_ai_pop_v3_blue');
            if (savedB) neatBlue.population = JSON.parse(savedB).map(j => neataptic.Network.fromJSON(j));
            
            let savedR = localStorage.getItem('asteroids_ai_pop_v3_red');
            if (savedR) neatRed.population = JSON.parse(savedR).map(j => neataptic.Network.fromJSON(j));
        }
        initAI();"""

code = code.replace(state_old, state_new)

# 4. updateThermometer
therm_up_old = """                if (killer === 'Bullet') document.getElementById('lastKiller').style.color = '#ffd700';
            }
            if (totalDeaths > 0) {
                let pctA = (deathsByAsteroid / totalDeaths * 100);
                let pctS = (deathsBySaucer / totalDeaths * 100);
                let pctB = (deathsByBullet / totalDeaths * 100);
                
                document.getElementById('barAsteroid').style.width = pctA + '%';
                document.getElementById('barSaucer').style.width = pctS + '%';
                document.getElementById('barBullet').style.width = pctB + '%';

                document.getElementById('barAsteroid').innerText = pctA >= 5 ? Math.round(pctA) + '%' : '';
                document.getElementById('barSaucer').innerText = pctS >= 5 ? Math.round(pctS) + '%' : '';
                document.getElementById('barBullet').innerText = pctB >= 5 ? Math.round(pctB) + '%' : '';
            }"""

therm_up_new = """                if (killer === 'Bullet') document.getElementById('lastKiller').style.color = '#ffd700';
                if (killer === 'Hyperspace') document.getElementById('lastKiller').style.color = '#a020f0';
            }
            if (totalDeaths > 0) {
                let pctA = (deathsByAsteroid / totalDeaths * 100);
                let pctS = (deathsBySaucer / totalDeaths * 100);
                let pctB = (deathsByBullet / totalDeaths * 100);
                let pctH = (deathsByHyper / totalDeaths * 100);
                
                document.getElementById('barAsteroid').style.width = pctA + '%';
                document.getElementById('barSaucer').style.width = pctS + '%';
                document.getElementById('barBullet').style.width = pctB + '%';
                document.getElementById('barHyper').style.width = pctH + '%';

                document.getElementById('barAsteroid').innerText = pctA >= 5 ? Math.round(pctA) + '%' : '';
                document.getElementById('barSaucer').innerText = pctS >= 5 ? Math.round(pctS) + '%' : '';
                document.getElementById('barBullet').innerText = pctB >= 5 ? Math.round(pctB) + '%' : '';
                document.getElementById('barHyper').innerText = pctH >= 5 ? Math.round(pctH) + '%' : '';
            }"""

code = code.replace(therm_up_old, therm_up_new)

# 5. resetGame
reset_old = """        function resetGame(isRespawn = false) {
            ship = {
                x: canvas.width / 2, y: canvas.height / 2, a: -Math.PI / 2, 
                dx: 0, dy: 0, rot: 0, thrusting: false,
                radar: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                cooldown: 0,
                isRespawning: isRespawn,
                respawnTimer: isRespawn ? 180 : 0
            };
            bullets = [];
            
            if (!isRespawn) {
                enemyBullets = [];
                asteroids = [];
                score = 0;
                framesAlive = 0;
                saucerTimer = 0;
                lives = 3;
                extraLivesEarned = 0;
                nextLifeScore = 10000;
                window.saucerTimeReload = 1800; // Initial delay ~30 seconds
                
                document.getElementById('scoreDisplay').innerText = score;
                document.getElementById('genDisplay').innerText = generation;
                document.getElementById('timeDisplay').innerText = "0.0s";

                for(let i=0; i<4; i++) {
                    let x, y;
                    do {
                        x = Math.random() * canvas.width;
                        y = Math.random() * canvas.height;
                    } while (Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2)) < 200); 
                    asteroids.push(createAsteroid(x, y, 3));
                }
            } else {
                // In classic Asteroids, rocks are not cleared. We just wait for a safe spawn.
            }
        }"""

reset_new = """        function saveState() {
            return {
                score, framesAlive, saucerTimer, saucerTimeReload, lives,
                extraLivesEarned, nextLifeScore, ship: JSON.parse(JSON.stringify(ship)),
                bullets: JSON.parse(JSON.stringify(bullets)),
                enemyBullets: JSON.parse(JSON.stringify(enemyBullets)),
                asteroids: JSON.parse(JSON.stringify(asteroids)),
                bulletsFired, bulletsHit
            };
        }

        function loadState(state) {
            score = state.score;
            framesAlive = state.framesAlive;
            saucerTimer = state.saucerTimer;
            saucerTimeReload = state.saucerTimeReload;
            lives = state.lives;
            extraLivesEarned = state.extraLivesEarned;
            nextLifeScore = state.nextLifeScore;
            ship = JSON.parse(JSON.stringify(state.ship));
            bullets = JSON.parse(JSON.stringify(state.bullets));
            enemyBullets = JSON.parse(JSON.stringify(state.enemyBullets));
            asteroids = JSON.parse(JSON.stringify(state.asteroids));
            bulletsFired = state.bulletsFired;
            bulletsHit = state.bulletsHit;
        }

        function createInitialState() {
            let newAsteroids = [];
            for(let i=0; i<4; i++) {
                let x, y;
                do {
                    x = Math.random() * canvas.width;
                    y = Math.random() * canvas.height;
                } while (Math.sqrt(Math.pow(x - canvas.width/2, 2) + Math.pow(y - canvas.height/2, 2)) < 200); 
                newAsteroids.push(createAsteroid(x, y, 3));
            }
            
            return {
                score: 0, framesAlive: 0, saucerTimer: 0, saucerTimeReload: 1800,
                lives: 3, extraLivesEarned: 0, nextLifeScore: 10000,
                ship: {
                    x: canvas.width / 2, y: canvas.height / 2, a: -Math.PI / 2, 
                    dx: 0, dy: 0, rot: 0, thrusting: false,
                    radar: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    cooldown: 0, isRespawning: false, respawnTimer: 0
                },
                bullets: [], enemyBullets: [], asteroids: newAsteroids,
                bulletsFired: 0, bulletsHit: 0
            };
        }

        function resetGame(fullReset = false) {
            if (fullReset) {
                p1State = createInitialState();
                p2State = createInitialState();
                currentPlayer = 1;
                loadState(p1State);
                document.getElementById('genDisplay').innerText = generation;
                document.getElementById('playerDisplay').innerText = "P1 (BLUE)";
                document.getElementById('playerDisplay').style.color = "#0ff";
                document.getElementById('scoreDisplay').innerText = score;
                document.getElementById('timeDisplay').innerText = "0.0s";
            }
        }

        function switchTurns() {
            if (currentPlayer === 1) p1State = saveState();
            else p2State = saveState();

            if (currentPlayer === 1 && p2State.lives > 0) currentPlayer = 2;
            else if (currentPlayer === 2 && p1State.lives > 0) currentPlayer = 1;

            loadState(currentPlayer === 1 ? p1State : p2State);

            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.dx = 0; ship.dy = 0; ship.a = -Math.PI / 2;
            ship.isRespawning = true;
            ship.respawnTimer = 180;
            
            document.getElementById('playerDisplay').innerText = currentPlayer === 1 ? "P1 (BLUE)" : "P2 (RED)";
            document.getElementById('playerDisplay').style.color = currentPlayer === 1 ? "#0ff" : "#f00";
            document.getElementById('scoreDisplay').innerText = score;
            let timeAlive = parseFloat((framesAlive / 60).toFixed(1));
            document.getElementById('timeDisplay').innerText = timeAlive + 's';
        }"""
code = code.replace(reset_old, reset_new)

# 6. act
act_old = """        function act() {
            let inputs = ship.radar.map((d, idx) => idx < 8 ? d / 250 : d / 375);
            let outputs = neat.population[genomeIndex].activate(inputs);
            
            ship.rot = 0;
            if (outputs[0] > 0.5) ship.rot = -0.1;
            if (outputs[1] > 0.5) ship.rot = 0.1; 
            
            ship.thrusting = outputs[2] > 0.5;     
            
            if (ship.cooldown > 0) ship.cooldown--;
            if (outputs[3] > 0.5 && bullets.length < 4 && ship.cooldown === 0) {
                bullets.push({x: ship.x, y: ship.y, xv: 10 * Math.cos(ship.a), yv: 10 * Math.sin(ship.a)});
                ship.cooldown = 15; 
                playShoot(); 
            }
        }"""

act_new = """        function act() {
            let inputs = ship.radar.map((d, idx) => idx < 8 ? d / 250 : d / 375);
            let currentNeat = currentPlayer === 1 ? neatBlue : neatRed;
            let outputs = currentNeat.population[genomeIndex].activate(inputs);
            
            ship.rot = 0;
            if (outputs[0] > 0.5) ship.rot = -0.1;
            if (outputs[1] > 0.5) ship.rot = 0.1; 
            
            ship.thrusting = outputs[2] > 0.5;     
            
            if (ship.cooldown > 0) ship.cooldown--;
            if (outputs[3] > 0.5 && bullets.length < 4 && ship.cooldown === 0) {
                bullets.push({x: ship.x, y: ship.y, xv: 10 * Math.cos(ship.a), yv: 10 * Math.sin(ship.a)});
                ship.cooldown = 15; 
                bulletsFired++;
                playShoot(); 
            }

            if (outputs[4] > 0.5 && !ship.isRespawning) {
                if (Math.random() < 0.1666) {
                    return true; // Hyperspace death
                } else {
                    ship.x = Math.random() * canvas.width;
                    ship.y = Math.random() * canvas.height;
                    ship.dx = 0;
                    ship.dy = 0;
                    ship.isRespawning = true;
                    ship.respawnTimer = 60;
                }
            }
            return false;
        }"""
code = code.replace(act_old, act_new)

# 7. handleDeath inside update()
handledeath_old = """            const handleDeath = (killer) => {
                playBang(true);
                
                totalDeaths++;
                if (killer === 'Asteroid') deathsByAsteroid++;
                if (killer === 'Saucer') deathsBySaucer++;
                if (killer === 'Bullet') deathsByBullet++;
                
                localStorage.setItem('asteroids_deaths_total', totalDeaths);
                localStorage.setItem('asteroids_deaths_asteroid', deathsByAsteroid);
                localStorage.setItem('asteroids_deaths_saucer', deathsBySaucer);
                localStorage.setItem('asteroids_deaths_bullet', deathsByBullet);

                updateThermometer(killer);

                lives--;
                if (lives > 0) {
                    resetGame(true);
                    return true; 
                }

                if (score > 0) {
                    let existingScore = topScores.find(s => s.gen === generation);
                    if (!existingScore) {
                        topScores.push({ gen: generation, score: score });
                        topScores.sort((a, b) => b.score - a.score);
                        topScores = topScores.slice(0, 10);
                        localStorage.setItem('asteroids_top10', JSON.stringify(topScores));
                    }
                }
                if (timeAlive > 0.5) { 
                    let existingTime = topTimes.find(t => t.gen === generation);
                    if (!existingTime) {
                        topTimes.push({ gen: generation, time: timeAlive });
                        topTimes.sort((a, b) => b.time - a.time);
                        topTimes = topTimes.slice(0, 10);
                        localStorage.setItem('asteroids_toptime', JSON.stringify(topTimes));
                    }
                }
                updateLeaderboardUI();

                neat.population[genomeIndex].score = score + (timeAlive * 0.1) + (extraLivesEarned * 1000);
                
                genomeIndex++;
                if (genomeIndex >= neat.popsize) {
                    neat.sort();
                    let newPop = [];
                    for(let k=0; k<neat.elitism; k++) newPop.push(neat.population[k]);
                    for(let k=0; k<neat.popsize - neat.elitism; k++) newPop.push(neat.getOffspring());
                    neat.population = newPop;
                    neat.mutate();
                    genomeIndex = 0;
                    generation++;
                    localStorage.setItem('asteroids_ai_pop_v2', JSON.stringify(neat.population.map(n => n.toJSON())));
                }
                
                resetGame(false);
                return true;
            };"""

handledeath_new = """            const handleDeath = (killer) => {
                playBang(true);
                
                totalDeaths++;
                if (killer === 'Asteroid') deathsByAsteroid++;
                if (killer === 'Saucer') deathsBySaucer++;
                if (killer === 'Bullet') deathsByBullet++;
                if (killer === 'Hyperspace') deathsByHyper++;
                
                localStorage.setItem('asteroids_deaths_total', totalDeaths);
                localStorage.setItem('asteroids_deaths_asteroid', deathsByAsteroid);
                localStorage.setItem('asteroids_deaths_saucer', deathsBySaucer);
                localStorage.setItem('asteroids_deaths_bullet', deathsByBullet);
                localStorage.setItem('asteroids_deaths_hyper', deathsByHyper);

                updateThermometer(killer);

                lives--;
                
                if (currentPlayer === 1) p1State = saveState();
                else p2State = saveState();

                if (p1State.lives <= 0 && p2State.lives <= 0) {
                    if (p1State.score > 0 || p2State.score > 0) {
                        let bestScore = Math.max(p1State.score, p2State.score);
                        let existingScore = topScores.find(s => s.gen === generation);
                        if (!existingScore) {
                            topScores.push({ gen: generation, score: bestScore });
                            topScores.sort((a, b) => b.score - a.score);
                            topScores = topScores.slice(0, 10);
                            localStorage.setItem('asteroids_top10', JSON.stringify(topScores));
                        }
                    }
                    updateLeaderboardUI();

                    let p1Time = p1State.framesAlive / 60;
                    let p2Time = p2State.framesAlive / 60;
                    
                    // Blue (Survival)
                    neatBlue.population[genomeIndex].score = p1State.score + (p1Time * 2) + (p1State.extraLivesEarned * 5000);
                    // Red (Aggression)
                    let p2Acc = p2State.bulletsFired > 0 ? (p2State.bulletsHit / p2State.bulletsFired) : 0;
                    neatRed.population[genomeIndex].score = p2State.score + (p2Acc * 1000) + (p2State.extraLivesEarned * 5000);
                    
                    genomeIndex++;
                    if (genomeIndex >= neatBlue.popsize) {
                        neatBlue.sort();
                        let newPopB = [];
                        for(let k=0; k<neatBlue.elitism; k++) newPopB.push(neatBlue.population[k]);
                        for(let k=0; k<neatBlue.popsize - neatBlue.elitism; k++) newPopB.push(neatBlue.getOffspring());
                        neatBlue.population = newPopB;
                        neatBlue.mutate();
                        
                        neatRed.sort();
                        let newPopR = [];
                        for(let k=0; k<neatRed.elitism; k++) newPopR.push(neatRed.population[k]);
                        for(let k=0; k<neatRed.popsize - neatRed.elitism; k++) newPopR.push(neatRed.getOffspring());
                        neatRed.population = newPopR;
                        neatRed.mutate();
                        
                        genomeIndex = 0;
                        generation++;
                        localStorage.setItem('asteroids_ai_pop_v3_blue', JSON.stringify(neatBlue.population.map(n => n.toJSON())));
                        localStorage.setItem('asteroids_ai_pop_v3_red', JSON.stringify(neatRed.population.map(n => n.toJSON())));
                    }
                    resetGame(true);
                    return true;
                }
                
                switchTurns();
                return true;
            };"""
code = code.replace(handledeath_old, handledeath_new)

# 8. Act call in update
update_act_old = """        function update() {
            if (!ship.isRespawning) {
                act(); 
                framesAlive++;
            }"""
update_act_new = """        function update() {
            if (!ship.isRespawning) {
                if (act()) {
                    handleDeath('Hyperspace');
                    requestAnimationFrame(update);
                    return;
                }
                framesAlive++;
            }"""
code = code.replace(update_act_old, update_act_new)

# 9. bulletsHit 
bullets_hit_old = """                        bullets.splice(i, 1);
                        asteroids.splice(j, 1);
                        bulletDestroyed = true;
                        
                        let points = 0;"""
bullets_hit_new = """                        bullets.splice(i, 1);
                        asteroids.splice(j, 1);
                        bulletDestroyed = true;
                        bulletsHit++;
                        
                        let points = 0;"""
code = code.replace(bullets_hit_old, bullets_hit_new)

# 10. Drawing Colors
ctx_shadow_old = """            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;"""
ctx_shadow_new = """            ctx.shadowBlur = 10;
            ctx.shadowColor = currentPlayer === 1 ? '#0ff' : '#f00';
            ctx.strokeStyle = currentPlayer === 1 ? '#0ff' : '#f00';
            ctx.lineWidth = 1.5;"""
code = code.replace(ctx_shadow_old, ctx_shadow_new)

ctx_bullets_old = """            bullets.forEach(b => {
                ctx.beginPath();"""
ctx_bullets_new = """            bullets.forEach(b => {
                ctx.strokeStyle = currentPlayer === 1 ? '#0ff' : '#f00';
                ctx.beginPath();"""
code = code.replace(ctx_bullets_old, ctx_bullets_new)

ctx_enemyb_old = """            enemyBullets.forEach(b => {
                ctx.beginPath();"""
ctx_enemyb_new = """            enemyBullets.forEach(b => {
                ctx.strokeStyle = '#f0f';
                ctx.beginPath();"""
code = code.replace(ctx_enemyb_old, ctx_enemyb_new)

ctx_asteroids_old = """            asteroids.forEach(a => {
                let r = a.size * 10; 
                function drawAst(dx, dy) {"""
ctx_asteroids_new = """            asteroids.forEach(a => {
                ctx.strokeStyle = '#fff';
                ctx.shadowColor = '#fff';
                let r = a.size * 10; 
                function drawAst(dx, dy) {"""
code = code.replace(ctx_asteroids_old, ctx_asteroids_new)

# Reset game call at bottom
reset_bot_old = """        resetGame();
        updateThermometer(null);
        update();"""
reset_bot_new = """        resetGame(true);
        updateThermometer(null);
        update();"""
code = code.replace(reset_bot_old, reset_bot_new)

# Write back
with open("index.html", "w") as f:
    f.write(code)

