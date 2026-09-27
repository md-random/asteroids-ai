import re

with open("index.html", "r") as f:
    code = f.read()

# 1. Update HTML structure for thermometers and leaderboards
therm_old = """        <div class="thermometer-container">
            <div class="cause-label">KILLED BY: <span id="lastKiller" style="color:#fff;">-</span></div>
            <div class="thermometer-bar">
                <div id="barAsteroid" class="death-bar death-bar-asteroid" title="Asteroids"></div>
                <div id="barSaucer" class="death-bar death-bar-saucer" title="Saucers"></div>
                <div id="barBullet" class="death-bar death-bar-bullet" title="Bullets"></div>
                <div id="barHyper" class="death-bar" style="background: #a020f0; width: 0%; transition: width 0.3s;" title="Hyperspace"></div>
            </div>
            <div style="width: 100%; text-align: center; font-weight: bold; margin-top: 5px;">
                <span style="color:#0088ff">Ast</span> &nbsp; <span style="color:#ff0000">Sau</span> &nbsp; <span style="color:#ffd700">Bul</span> &nbsp; <span style="color:#a020f0">Hyp</span>
            </div>
        </div>"""

therm_new = """        <div class="thermometer-container">
            <div class="cause-label">P1 (BLUE) DEATHS: <span id="lastKillerB" style="color:#0ff;">-</span></div>
            <div class="thermometer-bar" style="border-color: #0ff;">
                <div id="barAsteroidB" class="death-bar death-bar-asteroid" title="Asteroids"></div>
                <div id="barSaucerB" class="death-bar death-bar-saucer" title="Saucers"></div>
                <div id="barBulletB" class="death-bar death-bar-bullet" title="Bullets"></div>
                <div id="barHyperB" class="death-bar" style="background: #a020f0; width: 0%; transition: width 0.3s;" title="Hyperspace"></div>
            </div>
            <div class="cause-label" style="margin-top:10px;">P2 (RED) DEATHS: <span id="lastKillerR" style="color:#f00;">-</span></div>
            <div class="thermometer-bar" style="border-color: #f00;">
                <div id="barAsteroidR" class="death-bar death-bar-asteroid" title="Asteroids"></div>
                <div id="barSaucerR" class="death-bar death-bar-saucer" title="Saucers"></div>
                <div id="barBulletR" class="death-bar death-bar-bullet" title="Bullets"></div>
                <div id="barHyperR" class="death-bar" style="background: #a020f0; width: 0%; transition: width 0.3s;" title="Hyperspace"></div>
            </div>
            <div style="width: 100%; text-align: center; font-weight: bold; margin-top: 5px;">
                <span style="color:#0088ff">Ast</span> &nbsp; <span style="color:#ff0000">Sau</span> &nbsp; <span style="color:#ffd700">Bul</span> &nbsp; <span style="color:#a020f0">Hyp</span>
            </div>
        </div>"""

code = code.replace(therm_old, therm_new)

# 2. Add player to Leaderboard UI
lb_ui_old = """        function updateLeaderboardUI() {
            let lb = document.getElementById('leaderboardList');
            lb.innerHTML = '';
            if (topScores.length === 0) {
                lb.innerHTML = '<li>No scores yet</li>';
            } else {
                topScores.forEach(s => {
                    let li = document.createElement('li');
                    li.innerHTML = `<span>Gen ${s.gen}</span><span>${s.score}</span>`;
                    lb.appendChild(li);
                });
            }

            let tl = document.getElementById('timeLeaderboardList');
            tl.innerHTML = '';
            if (topTimes.length === 0) {
                tl.innerHTML = '<li>No times yet</li>';
            } else {
                topTimes.forEach(t => {
                    let li = document.createElement('li');
                    li.innerHTML = `<span>Gen ${t.gen}</span><span>${t.time}s</span>`;
                    tl.appendChild(li);
                });
            }
        }"""

lb_ui_new = """        function updateLeaderboardUI() {
            let lb = document.getElementById('leaderboardList');
            lb.innerHTML = '';
            if (topScores.length === 0) {
                lb.innerHTML = '<li>No scores yet</li>';
            } else {
                topScores.forEach(s => {
                    let li = document.createElement('li');
                    let color = s.player === 'B' ? '#0ff' : (s.player === 'R' ? '#f00' : '#fff');
                    li.innerHTML = `<span style="color:${color}">Gen ${s.gen} [${s.player}]</span><span style="color:${color}">${s.score}</span>`;
                    lb.appendChild(li);
                });
            }

            let tl = document.getElementById('timeLeaderboardList');
            tl.innerHTML = '';
            if (topTimes.length === 0) {
                tl.innerHTML = '<li>No times yet</li>';
            } else {
                topTimes.forEach(t => {
                    let li = document.createElement('li');
                    let color = t.player === 'B' ? '#0ff' : (t.player === 'R' ? '#f00' : '#fff');
                    li.innerHTML = `<span style="color:${color}">Gen ${t.gen} [${t.player}]</span><span style="color:${color}">${t.time}s</span>`;
                    tl.appendChild(li);
                });
            }
        }"""

code = code.replace(lb_ui_old, lb_ui_new)

# 3. Update death tracking variables
death_var_old = """        let totalDeaths = parseInt(localStorage.getItem('asteroids_deaths_total')) || 0;
        let deathsByAsteroid = parseInt(localStorage.getItem('asteroids_deaths_asteroid')) || 0;
        let deathsBySaucer = parseInt(localStorage.getItem('asteroids_deaths_saucer')) || 0;
        let deathsByBullet = parseInt(localStorage.getItem('asteroids_deaths_bullet')) || 0;
        let deathsByHyper = parseInt(localStorage.getItem('asteroids_deaths_hyper')) || 0;"""

death_var_new = """        let totalDeathsB = parseInt(localStorage.getItem('asteroids_deaths_total_b')) || 0;
        let deathsByAsteroidB = parseInt(localStorage.getItem('asteroids_deaths_ast_b')) || 0;
        let deathsBySaucerB = parseInt(localStorage.getItem('asteroids_deaths_sau_b')) || 0;
        let deathsByBulletB = parseInt(localStorage.getItem('asteroids_deaths_bul_b')) || 0;
        let deathsByHyperB = parseInt(localStorage.getItem('asteroids_deaths_hyp_b')) || 0;

        let totalDeathsR = parseInt(localStorage.getItem('asteroids_deaths_total_r')) || 0;
        let deathsByAsteroidR = parseInt(localStorage.getItem('asteroids_deaths_ast_r')) || 0;
        let deathsBySaucerR = parseInt(localStorage.getItem('asteroids_deaths_sau_r')) || 0;
        let deathsByBulletR = parseInt(localStorage.getItem('asteroids_deaths_bul_r')) || 0;
        let deathsByHyperR = parseInt(localStorage.getItem('asteroids_deaths_hyp_r')) || 0;"""

code = code.replace(death_var_old, death_var_new)

# 4. updateThermometer tracking logic
therm_logic_old = """        function updateThermometer(killer) {
            if (killer) {
                document.getElementById('lastKiller').innerText = killer;
                document.getElementById('lastKiller').style.color = '#fff';
                if (killer === 'Asteroid') document.getElementById('lastKiller').style.color = '#0088ff';
                if (killer === 'Saucer') document.getElementById('lastKiller').style.color = '#ff0000';
                if (killer === 'Bullet') document.getElementById('lastKiller').style.color = '#ffd700';
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
            }
        }"""

therm_logic_new = """        function updateThermometer(killer) {
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
        }"""
code = code.replace(therm_logic_old, therm_logic_new)

# 5. handleDeath modifications
hd_old = """            const handleDeath = (killer) => {
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
                    updateLeaderboardUI();"""

hd_new = """            const handleDeath = (killer) => {
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
                    updateLeaderboardUI();"""

code = code.replace(hd_old, hd_new)

# 6. Change topScores loading logic to clear old versions
ts_old = """        let topScores = JSON.parse(localStorage.getItem('asteroids_top10')) || [];
        let topTimes = JSON.parse(localStorage.getItem('asteroids_toptime')) || [];"""
ts_new = """        let topScores = JSON.parse(localStorage.getItem('asteroids_top10_v2')) || [];
        let topTimes = JSON.parse(localStorage.getItem('asteroids_toptime_v2')) || [];"""
code = code.replace(ts_old, ts_new)

# Write back
with open("index.html", "w") as f:
    f.write(code)

