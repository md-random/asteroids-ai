        const AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx;
        let masterGain;
        let isMuted = true;
        let globalVolume = 0.2;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new AudioContext();
                masterGain = audioCtx.createGain();
                masterGain.connect(audioCtx.destination);
                masterGain.gain.value = 0; 
            }
        }

        function toggleMute() {
            initAudio();
            isMuted = !isMuted;
            document.getElementById('muteBtn').innerText = isMuted ? "🔈 Unmute" : "🔊 Mute";
            if (audioCtx.state === 'suspended') audioCtx.resume();
            masterGain.gain.setValueAtTime(isMuted ? 0 : globalVolume, audioCtx.currentTime);
        }

        function updateVolume(val) {
            globalVolume = parseFloat(val);
            if (!isMuted && masterGain) {
                masterGain.gain.setValueAtTime(globalVolume, audioCtx.currentTime);
            }
        }

        function playShoot() {
            if (isMuted || !audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }

        function playSaucerShoot() {
            if (isMuted || !audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }

        function playBang(isLarge) {
            if (isMuted || !audioCtx) return;
            const dur = isLarge ? 0.3 : 0.15;
            const bufferSize = Math.floor(audioCtx.sampleRate * dur);
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = isLarge ? 400 : 1000;

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(isLarge ? 1 : 0.5, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            noise.start();
        }

        function playSaucerSiren() {
            if (isMuted || !audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        }

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            let margin = 50;
            let availableWidth = window.innerWidth;
            let availableHeight = window.innerHeight;
            
            let size = Math.min(availableWidth, availableHeight) - (margin * 2);
            if (size < 200) size = 200; // Prevent infinite loop in do...while spawning
            
            size = Math.floor(size);
            
            canvas.width = size;
            canvas.height = size;
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            canvas.style.aspectRatio = '1 / 1';
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let topScores = JSON.parse(localStorage.getItem('asteroids_top10_v2')) || [];
        let topTimes = JSON.parse(localStorage.getItem('asteroids_toptime_v2')) || [];
        
        if (!localStorage.getItem('asteroids_gens_converted')) {
            topScores = topScores.map(s => ({...s, gen: Math.max(1, Math.floor(s.gen / 50))}));
            topTimes = topTimes.map(t => ({...t, gen: Math.max(1, Math.floor(t.gen / 50))}));
            localStorage.setItem('asteroids_top10', JSON.stringify(topScores));
            localStorage.setItem('asteroids_toptime', JSON.stringify(topTimes));
            localStorage.setItem('asteroids_gens_converted', 'true');
        }
        
        function updateLeaderboardUI() {
            const scoreList = document.getElementById('leaderboardList');
            if (topScores.length === 0) {
                scoreList.innerHTML = '<li>No scores yet</li>';
            } else {
                let sHtml = '';
                topScores.forEach((s, index) => {
                    sHtml += `<li onclick="alert('Replay functionality coming soon!')"><span>${index + 1}. Gen ${s.gen}</span><span>${s.score} pts</span></li>`;
                });
                scoreList.innerHTML = sHtml;
            }

            const timeList = document.getElementById('timeLeaderboardList');
            if (topTimes.length === 0) {
                timeList.innerHTML = '<li>No times yet</li>';
            } else {
                let tHtml = '';
                topTimes.forEach((t, index) => {
                    tHtml += `<li onclick="alert('Replay functionality coming soon!')"><span>${index + 1}. Gen ${t.gen}</span><span>${t.time}s</span></li>`;
                });
                timeList.innerHTML = tHtml;
            }
        }
        updateLeaderboardUI(); 

        let generation = 1;
        let maxScoreGen = topScores.length > 0 ? Math.max(...topScores.map(s => s.gen)) : 0;
        let maxTimeGen = topTimes.length > 0 ? Math.max(...topTimes.map(t => t.gen)) : 0;
        let highestSavedGen = Math.max(maxScoreGen, maxTimeGen);
        if (highestSavedGen > 0) generation = highestSavedGen + 1;
        
        let score = 0;
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
        initAI();

        const ATARI_SHAPES = [
            [ [0.6, 0.3], [1.0, 0.0], [0.6, -0.6], [0.0, -1.0], [-0.3, -0.6], [-0.6, -1.0], [-1.0, -0.6], [-1.0, 0.0], [-0.3, 0.3], [-1.0, 0.6], [-0.3, 1.0], [0.3, 1.0] ],
            [ [0.6, 0.3], [1.0, 0.0], [0.6, -0.6], [0.3, -1.0], [-0.3, -1.0], [-1.0, -0.3], [-1.0, 0.3], [-0.3, 0.6], [-0.6, 1.0], [0.0, 1.0], [0.6, 0.6] ],
            [ [0.3, 0.0], [1.0, -0.3], [0.3, -0.6], [0.6, -1.0], [0.0, -1.0], [-0.6, -0.6], [-1.0, 0.0], [-0.6, 0.3], [-1.0, 0.6], [-0.3, 1.0], [0.3, 0.6], [0.6, 0.6] ],
            [ [0.6, 0.0], [1.0, -0.3], [0.6, -0.6], [0.0, -1.0], [-0.6, -0.6], [-1.0, -0.3], [-1.0, 0.3], [-0.6, 0.6], [0.0, 1.0], [0.6, 0.6], [0.3, 0.3] ]
        ];

        const SAUCER_SHAPE = [ 
            [-1, 0], [-0.5, -0.3], [0.5, -0.3], [1, 0], [0.5, 0.3], [-0.5, 0.3], [-1, 0], 
            [1, 0], 
            [0.5, -0.3], [0.2, -0.7], [-0.2, -0.7], [-0.5, -0.3] 
        ];

        function createAsteroid(x, y, size) {
            let speedMultiplier = (6 - size) * 0.8; 
            let shapeSelection = ATARI_SHAPES[Math.floor(Math.random() * ATARI_SHAPES.length)];
            return {
                x: x, y: y, 
                xv: (Math.random() - 0.5) * speedMultiplier,
                yv: (Math.random() - 0.5) * speedMultiplier,
                size: size, shape: shapeSelection,
                rot: 0, rotSpeed: (Math.random() - 0.5) * 0.02,
                isSaucer: false
            };
        function updateThermometer(killer) {
            if (killer) {
                let id = currentPlayer === 1 ? 'lastKillerB' : 'lastKillerR';
                document.getElementById(id).innerText = killer;
                let color = '#fff';
                if (killer === 'Asteroid') color = '#0088ff';
                if (killer === 'Saucer') color = '#ff0000';
                if (killer === 'Bullet') color = '#ffd700';
                if (killer === 'Hyperspace') color = '#a020f0';
                document.getElementById(id).style.color = color;
            }
            if (totalDeathsB > 0) {
                let pctA = (deathsByAsteroidB / totalDeathsB * 100);
                let pctS = (deathsBySaucerB / totalDeathsB * 100);
                let pctB = (deathsByBulletB / totalDeathsB * 100);
                let pctH = (deathsByHyperB / totalDeathsB * 100);
                document.getElementById('barAsteroidB').style.width = pctA + '%';
                document.getElementById('barSaucerB').style.width = pctS + '%';
                document.getElementById('barBulletB').style.width = pctB + '%';
                document.getElementById('barHyperB').style.width = pctH + '%';
                document.getElementById('barAsteroidB').innerText = pctA >= 5 ? Math.round(pctA) + '%' : '';
                document.getElementById('barSaucerB').innerText = pctS >= 5 ? Math.round(pctS) + '%' : '';
                document.getElementById('barBulletB').innerText = pctB >= 5 ? Math.round(pctB) + '%' : '';
                document.getElementById('barHyperB').innerText = pctH >= 5 ? Math.round(pctH) + '%' : '';
            }
            if (totalDeathsR > 0) {
                let pctA = (deathsByAsteroidR / totalDeathsR * 100);
                let pctS = (deathsBySaucerR / totalDeathsR * 100);
                let pctB = (deathsByBulletR / totalDeathsR * 100);
                let pctH = (deathsByHyperR / totalDeathsR * 100);
                document.getElementById('barAsteroidR').style.width = pctA + '%';
                document.getElementById('barSaucerR').style.width = pctS + '%';
                document.getElementById('barBulletR').style.width = pctB + '%';
                document.getElementById('barHyperR').style.width = pctH + '%';
                document.getElementById('barAsteroidR').innerText = pctA >= 5 ? Math.round(pctA) + '%' : '';
                document.getElementById('barSaucerR').innerText = pctS >= 5 ? Math.round(pctS) + '%' : '';
                document.getElementById('barBulletR').innerText = pctB >= 5 ? Math.round(pctB) + '%' : '';
                document.getElementById('barHyperR').innerText = pctH >= 5 ? Math.round(pctH) + '%' : '';
            }
            document.getElementById('deathDisplay').innerText = totalDeathsB + totalDeathsR;
        }

        function saveState() {
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
        }

        function act() {
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
        }

        function update() {
            if (!ship.isRespawning) {
                if (act()) {
                    handleDeath('Hyperspace');
                    requestAnimationFrame(update);
                    return;
                }
                framesAlive++;
            }
            
            saucerTimer++;

            let activeRocks = asteroids.filter(a => !a.isSaucer);
            if (activeRocks.length === 0) {
                for(let i=0; i<4; i++) {
                    let x, y;
                    do {
                        x = Math.random() * canvas.width;
                        y = Math.random() * canvas.height;
                    } while (Math.sqrt(Math.pow(x - ship.x, 2) + Math.pow(y - ship.y, 2)) < 200); 
                    asteroids.push(createAsteroid(x, y, 3));
                }
            }

            if (saucerTimer > window.saucerTimeReload) {
                let saucerExists = asteroids.some(a => a.isSaucer);
                if (!saucerExists) {
                    let isLeft = (score % 20) === 0;
                    let isSmallSaucer = false;
                    if (score >= 35000) {
                        isSmallSaucer = true;
                    } else if (score >= 8000) {
                        isSmallSaucer = Math.random() < 0.5;
                    }
                    asteroids.push({
                        x: isLeft ? 0 : canvas.width, 
                        y: (score * 7) % canvas.height,
                        xv: isLeft ? (isSmallSaucer ? 3 : 2) : (isSmallSaucer ? -3 : -2), 
                        yv: 0,
                        size: isSmallSaucer ? 1 : 2, 
                        shape: SAUCER_SHAPE,
                        rot: 0, rotSpeed: 0, 
                        isSaucer: true,
                        isSmallSaucer: isSmallSaucer,
                        shootCooldown: isSmallSaucer ? 30 : 45
                    });
                    
                    // Factual Arcade Timing Logic: decrease reload time until it hits a minimum
                    window.saucerTimeReload = Math.max(450, window.saucerTimeReload - 85);
                }
                saucerTimer = 0;
            }

            let timeAlive = parseFloat((framesAlive / 60).toFixed(1));
            document.getElementById('timeDisplay').innerText = timeAlive + 's';

            const wrap = (obj, r) => {
                if(obj.x < 0) obj.x += canvas.width;
                else if(obj.x >= canvas.width) obj.x -= canvas.width;
                if(obj.y < 0) obj.y += canvas.height;
                else if(obj.y >= canvas.height) obj.y -= canvas.height;
            };

            if (!ship.isRespawning) {
                ship.a += ship.rot;
                if (ship.thrusting) {
                    ship.dx += 0.08 * Math.cos(ship.a);
                    ship.dy += 0.08 * Math.sin(ship.a);
                }
                ship.dx *= 0.99; 
                ship.dy *= 0.99;
                ship.x += ship.dx;
                ship.y += ship.dy;

                wrap(ship, 10);
            } else {
                ship.respawnTimer--;
                if (ship.respawnTimer <= 0) {
                    let isSafe = true;
                    for (let a of asteroids) {
                        if (Math.sqrt(Math.pow(a.x - ship.x, 2) + Math.pow(a.y - ship.y, 2)) < (a.size * 10) + 120) {
                            isSafe = false;
                            break;
                        }
                    }
                    if (isSafe) {
                        for (let b of enemyBullets) {
                            if (Math.sqrt(Math.pow(b.x - ship.x, 2) + Math.pow(b.y - ship.y, 2)) < 120) {
                                isSafe = false;
                                break;
                            }
                        }
                    }
                    if (isSafe) {
                        ship.isRespawning = false;
                    }
                }
            }

            for(let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].x += bullets[i].xv;
                bullets[i].y += bullets[i].yv;
                if(bullets[i].x < 0 || bullets[i].x > canvas.width || bullets[i].y < 0 || bullets[i].y > canvas.height) {
                    bullets.splice(i, 1);
                }
            }

            for(let i = enemyBullets.length - 1; i >= 0; i--) {
                enemyBullets[i].x += enemyBullets[i].xv;
                enemyBullets[i].y += enemyBullets[i].yv;
                if(enemyBullets[i].x < 0 || enemyBullets[i].x > canvas.width || enemyBullets[i].y < 0 || enemyBullets[i].y > canvas.height) {
                    enemyBullets.splice(i, 1);
                }
            }

            for (let j = asteroids.length - 1; j >= 0; j--) {
                let a = asteroids[j];
                a.x += a.xv;
                a.y += a.yv;
                a.rot += a.rotSpeed;

                if (a.isSaucer) {
                    if ((a.xv > 0 && a.x > canvas.width) || (a.xv < 0 && a.x < 0)) {
                        asteroids.splice(j, 1);
                        continue;
                    }
                    saucerSirenTimer++;
                    if (saucerSirenTimer > 15) {
                        playSaucerSiren();
                        saucerSirenTimer = 0;
                    }
                    if (a.shootCooldown > 0) a.shootCooldown--;
                    if (a.shootCooldown <= 0) {
                        let exactAngle;
                        if (!a.isSmallSaucer) {
                            exactAngle = Math.random() * Math.PI * 2;
                        } else {
                            exactAngle = Math.atan2(ship.y - a.y, ship.x - a.x);
                            if (score < 35000) {
                                exactAngle += (Math.random() - 0.5) * 0.4;
                            }
                        }
                        let arcadeAngle = Math.round(exactAngle / 0.392) * 0.392;
                        enemyBullets.push({x: a.x, y: a.y, xv: 6 * Math.cos(arcadeAngle), yv: 6 * Math.sin(arcadeAngle)});
                        a.shootCooldown = a.isSmallSaucer ? 30 : 45;
                        playSaucerShoot();
                    }
                } else {
                    wrap(a, a.size * 10);
                }
            }

            const MAX_RADAR_DIST = 250;
            const MAX_BULLET_RADAR_DIST = 375;
            if (!ship.isRespawning) {
                for(let i=0; i<8; i++) {
                    let angle = ship.a + (i * Math.PI / 4);
                    let minDist = MAX_RADAR_DIST;
                    asteroids.forEach(a => {
                        for(let d=0; d<MAX_RADAR_DIST; d+=10) {
                            let rx = (ship.x + Math.cos(angle) * d) % canvas.width;
                            if(rx < 0) rx += canvas.width;
                            let ry = (ship.y + Math.sin(angle) * d) % canvas.height;
                            if(ry < 0) ry += canvas.height;

                            let dx = rx - a.x;
                            let dy = ry - a.y;
                            if(Math.sqrt(dx*dx + dy*dy) < a.size * 10) {
                                if(d < minDist) minDist = d;
                                break;
                            }
                        }
                    });
                    ship.radar[i] = minDist; 

                    let minBulletDist = MAX_BULLET_RADAR_DIST;
                    enemyBullets.forEach(b => {
                        for(let d=0; d<MAX_BULLET_RADAR_DIST; d+=10) {
                            let rx = (ship.x + Math.cos(angle) * d) % canvas.width;
                            if(rx < 0) rx += canvas.width;
                            let ry = (ship.y + Math.sin(angle) * d) % canvas.height;
                            if(ry < 0) ry += canvas.height;

                            let dx = rx - b.x;
                            let dy = ry - b.y;
                            if(Math.sqrt(dx*dx + dy*dy) < 5) {
                                if(d < minBulletDist) minBulletDist = d;
                                break;
                            }
                        }
                    });
                    ship.radar[i + 8] = minBulletDist;
                }
            }

            const handleDeath = (killer) => {
                playBang(true);
                
                if (currentPlayer === 1) {
                    totalDeathsB++;
                    if (killer === 'Asteroid') deathsByAsteroidB++;
                    if (killer === 'Saucer') deathsBySaucerB++;
                    if (killer === 'Bullet') deathsByBulletB++;
                    if (killer === 'Hyperspace') deathsByHyperB++;
                    localStorage.setItem('asteroids_deaths_total_b', totalDeathsB);
                    localStorage.setItem('asteroids_deaths_ast_b', deathsByAsteroidB);
                    localStorage.setItem('asteroids_deaths_sau_b', deathsBySaucerB);
                    localStorage.setItem('asteroids_deaths_bul_b', deathsByBulletB);
                    localStorage.setItem('asteroids_deaths_hyp_b', deathsByHyperB);
                } else {
                    totalDeathsR++;
                    if (killer === 'Asteroid') deathsByAsteroidR++;
                    if (killer === 'Saucer') deathsBySaucerR++;
                    if (killer === 'Bullet') deathsByBulletR++;
                    if (killer === 'Hyperspace') deathsByHyperR++;
                    localStorage.setItem('asteroids_deaths_total_r', totalDeathsR);
                    localStorage.setItem('asteroids_deaths_ast_r', deathsByAsteroidR);
                    localStorage.setItem('asteroids_deaths_sau_r', deathsBySaucerR);
                    localStorage.setItem('asteroids_deaths_bul_r', deathsByBulletR);
                    localStorage.setItem('asteroids_deaths_hyp_r', deathsByHyperR);
                }

                updateThermometer(killer);

                lives--;
                
                if (currentPlayer === 1) p1State = saveState();
                else p2State = saveState();

                if (p1State.lives <= 0 && p2State.lives <= 0) {
                    let scoreAdded = false;
                    if (p1State.score > 0) {
                        topScores.push({ gen: generation, score: p1State.score, player: 'B' });
                        scoreAdded = true;
                    }
                    if (p2State.score > 0) {
                        topScores.push({ gen: generation, score: p2State.score, player: 'R' });
                        scoreAdded = true;
                    }
                    if (scoreAdded) {
                        topScores.sort((a, b) => b.score - a.score);
                        topScores = topScores.slice(0, 10);
                        localStorage.setItem('asteroids_top10_v2', JSON.stringify(topScores));
                    }

                    let p1Time = p1State.framesAlive / 60;
                    let p2Time = p2State.framesAlive / 60;
                    let timeAdded = false;
                    if (p1Time > 0.5) {
                        topTimes.push({ gen: generation, time: parseFloat(p1Time.toFixed(1)), player: 'B' });
                        timeAdded = true;
                    }
                    if (p2Time > 0.5) {
                        topTimes.push({ gen: generation, time: parseFloat(p2Time.toFixed(1)), player: 'R' });
                        timeAdded = true;
                    }
                    if (timeAdded) {
                        topTimes.sort((a, b) => b.time - a.time);
                        topTimes = topTimes.slice(0, 10);
                        localStorage.setItem('asteroids_toptime_v2', JSON.stringify(topTimes));
                    }
                    updateLeaderboardUI();


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
            };

            if (!ship.isRespawning) {
                for(let i = 0; i < enemyBullets.length; i++) {
                    let dx = ship.x - enemyBullets[i].x;
                    let dy = ship.y - enemyBullets[i].y;
                    if(Math.sqrt(dx*dx + dy*dy) < 15) {
                        if (handleDeath('Bullet')) {
                            requestAnimationFrame(update);
                            return;
                        }
                    }
                }

                for(let j = 0; j < asteroids.length; j++) {
                    let a = asteroids[j];
                    let dx = ship.x - a.x;
                    let dy = ship.y - a.y;
                    if(Math.sqrt(dx*dx + dy*dy) < (a.size * 10) + 10) {
                        if (handleDeath(a.isSaucer ? 'Saucer' : 'Asteroid')) {
                            requestAnimationFrame(update);
                            return;
                        }
                    }
                }
            }

            for(let i = bullets.length - 1; i >= 0; i--) {
                let bulletDestroyed = false;
                for(let j = asteroids.length - 1; j >= 0; j--) {
                    let a = asteroids[j];
                    let r = a.size * 10; 
                    let dx = bullets[i].x - a.x;
                    let dy = bullets[i].y - a.y;

                    if(Math.sqrt(dx*dx + dy*dy) < r) { 
                        bullets.splice(i, 1);
                        asteroids.splice(j, 1);
                        bulletDestroyed = true;
                        bulletsHit++;
                        
                        let points = 0;
                        if (a.isSaucer) {
                            points = a.isSmallSaucer ? 1000 : 500;
                        } else {
                            if (a.size === 3) points = 20;
                            else if (a.size === 2) points = 50;
                            else if (a.size === 1) points = 100;
                        }
                        score += points; 
                        document.getElementById('scoreDisplay').innerText = score;
                        playBang(false); 

                        if (score >= nextLifeScore) {
                            lives++;
                            extraLivesEarned++;
                            nextLifeScore += 10000;
                        }

                        if(a.size > 1 && !a.isSaucer) {
                            asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                            asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                        }
                        break; 
                    }
                }
                if(bulletDestroyed) continue;
            }

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Score
            ctx.fillStyle = '#fff';
            ctx.font = '30px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(score.toString().padStart(2, '0'), 40, 30);
            
            // Draw Lives
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            for(let i=0; i<lives; i++) {
                ctx.save();
                ctx.translate(55 + i * 25, 80);
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(-8, 10);
                ctx.lineTo(-3, 6);
                ctx.lineTo(3, 6);
                ctx.lineTo(8, 10);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }

            ctx.lineWidth = 1;
            if (!ship.isRespawning) {
                for(let i=0; i<8; i++) {
                    let angle = ship.a + (i * Math.PI / 4);
                    
                    let distA = ship.radar[i];
                    ctx.strokeStyle = `rgba(0, 255, 0, ${1 - (distA/MAX_RADAR_DIST)})`; 
                    ctx.beginPath();
                    ctx.moveTo(ship.x, ship.y);
                    ctx.lineTo(ship.x + Math.cos(angle)*distA, ship.y + Math.sin(angle)*distA);
                    ctx.stroke();

                    let distB = ship.radar[i + 8];
                    ctx.strokeStyle = `rgba(255, 0, 0, ${1 - (distB/MAX_BULLET_RADAR_DIST)})`; 
                    ctx.beginPath();
                    ctx.moveTo(ship.x, ship.y);
                    ctx.lineTo(ship.x + Math.cos(angle)*distB, ship.y + Math.sin(angle)*distB);
                    ctx.stroke();
                }
            }

            ctx.shadowBlur = 10;
            ctx.shadowColor = currentPlayer === 1 ? '#0ff' : '#f00';
            ctx.strokeStyle = currentPlayer === 1 ? '#0ff' : '#f00';
            ctx.lineWidth = 1.5;

            function drawShip(x, y) {
                ctx.beginPath();
                ctx.moveTo(x + 15 * Math.cos(ship.a), y + 15 * Math.sin(ship.a)); 
                ctx.lineTo(x - 12 * Math.cos(ship.a) - 10 * Math.sin(ship.a), y - 12 * Math.sin(ship.a) + 10 * Math.cos(ship.a)); 
                ctx.lineTo(x - 8 * Math.cos(ship.a), y - 8 * Math.sin(ship.a)); 
                ctx.lineTo(x - 12 * Math.cos(ship.a) + 10 * Math.sin(ship.a), y - 12 * Math.sin(ship.a) - 10 * Math.cos(ship.a)); 
                ctx.closePath();
                ctx.stroke();

                if(ship.thrusting) {
                    ctx.beginPath();
                    ctx.moveTo(x - 8 * Math.cos(ship.a), y - 8 * Math.sin(ship.a));
                    ctx.lineTo(x - 22 * Math.cos(ship.a) - 4 * Math.sin(ship.a), y - 22 * Math.sin(ship.a) + 4 * Math.cos(ship.a));
                    ctx.lineTo(x - 14 * Math.cos(ship.a), y - 14 * Math.sin(ship.a));
                    ctx.lineTo(x - 22 * Math.cos(ship.a) + 4 * Math.sin(ship.a), y - 22 * Math.sin(ship.a) - 4 * Math.cos(ship.a));
                    ctx.stroke();
                }
            }

            if (!ship.isRespawning || (ship.respawnTimer <= 60 && Math.floor(ship.respawnTimer / 10) % 2 === 0)) {
                let shipOffsetsX = [0];
                if (ship.x < 30) shipOffsetsX.push(canvas.width);
                else if (ship.x > canvas.width - 30) shipOffsetsX.push(-canvas.width);
                
                let shipOffsetsY = [0];
                if (ship.y < 30) shipOffsetsY.push(canvas.height);
                else if (ship.y > canvas.height - 30) shipOffsetsY.push(-canvas.height);
                
                for (let ox of shipOffsetsX) {
                    for (let oy of shipOffsetsY) {
                        drawShip(ship.x + ox, ship.y + oy);
                    }
                }
            }

            bullets.forEach(b => {
                ctx.strokeStyle = currentPlayer === 1 ? '#0ff' : '#f00';
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - b.xv * 0.5, b.y - b.yv * 0.5);
                ctx.stroke();
            });

            enemyBullets.forEach(b => {
                ctx.strokeStyle = '#f0f';
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - b.xv * 0.5, b.y - b.yv * 0.5);
                ctx.stroke();
            });

            asteroids.forEach(a => {
                ctx.strokeStyle = '#fff';
                ctx.shadowColor = '#fff';
                let r = a.size * 10; 
                function drawAst(dx, dy) {
                    ctx.beginPath();
                    for(let j = 0; j < a.shape.length; j++) {
                        let rotatedX = a.shape[j][0] * Math.cos(a.rot) - a.shape[j][1] * Math.sin(a.rot);
                        let rotatedY = a.shape[j][0] * Math.sin(a.rot) + a.shape[j][1] * Math.cos(a.rot);
                        let px = a.x + dx + rotatedX * r;
                        let py = a.y + dy + rotatedY * r;
                        if(j === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }

                let offsetsX = [0];
                if (a.x < r) offsetsX.push(canvas.width);
                else if (a.x > canvas.width - r) offsetsX.push(-canvas.width);
                
                let offsetsY = [0];
                if (a.y < r) offsetsY.push(canvas.height);
                else if (a.y > canvas.height - r) offsetsY.push(-canvas.height);
                
                for (let ox of offsetsX) {
                    for (let oy of offsetsY) {
                        drawAst(ox, oy);
                    }
                }
            });

            ctx.shadowBlur = 0;
            requestAnimationFrame(update);
        }
        
        resetGame(true);
        updateThermometer(null);
        update();
