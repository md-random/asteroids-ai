import { state } from './state.js';

export function drawGame() {
    const ctx = state.ctx;
    const canvas = state.canvas;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '30px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(state.score.toString().padStart(2, '0'), 40, 30);
    
    // Lives
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < state.lives; i++) {
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

    // Grid Map Overlay
    ctx.lineWidth = 1;
    if (!state.ship.isRespawning) {
        let cellW = canvas.width / 5;
        let cellH = canvas.height / 5;
        let startX = state.ship.x - canvas.width/2;
        let startY = state.ship.y - canvas.height/2;

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                let idx = r * 5 + c;
                let astDensity = state.ship.gridMap[idx * 4 + 0];
                let bulDensity = state.ship.gridMap[idx * 4 + 1];
                
                let drawX = startX + c * cellW;
                let drawY = startY + r * cellH;
                
                if (drawX < -cellW) drawX += canvas.width;
                if (drawX > canvas.width) drawX -= canvas.width;
                if (drawY < -cellH) drawY += canvas.height;
                if (drawY > canvas.height) drawY -= canvas.height;

                if (astDensity > 0 || bulDensity > 0) {
                    ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(0.5, astDensity * 0.2)})`;
                    if (bulDensity > 0) ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.5, bulDensity * 0.2)})`;
                    ctx.fillRect(drawX, drawY, cellW, cellH);
                    
                    let xv = state.ship.gridMap[idx * 4 + 2] * 5;
                    let yv = state.ship.gridMap[idx * 4 + 3] * 5;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.moveTo(drawX + cellW/2, drawY + cellH/2);
                    ctx.lineTo(drawX + cellW/2 + xv * 5, drawY + cellH/2 + yv * 5);
                    ctx.stroke();
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeRect(drawX, drawY, cellW, cellH);
            }
        }
    }

    // Ship
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ff';
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1.5;

    function drawShip(x, y) {
        ctx.beginPath();
        ctx.moveTo(x + 15 * Math.cos(state.ship.a), y + 15 * Math.sin(state.ship.a)); 
        ctx.lineTo(x - 12 * Math.cos(state.ship.a) - 10 * Math.sin(state.ship.a), y - 12 * Math.sin(state.ship.a) + 10 * Math.cos(state.ship.a)); 
        ctx.lineTo(x - 8 * Math.cos(state.ship.a), y - 8 * Math.sin(state.ship.a)); 
        ctx.lineTo(x - 12 * Math.cos(state.ship.a) + 10 * Math.sin(state.ship.a), y - 12 * Math.sin(state.ship.a) - 10 * Math.cos(state.ship.a)); 
        ctx.closePath();
        ctx.stroke();

        if (state.ship.thrusting) {
            ctx.beginPath();
            ctx.moveTo(x - 8 * Math.cos(state.ship.a), y - 8 * Math.sin(state.ship.a));
            ctx.lineTo(x - 22 * Math.cos(state.ship.a) - 4 * Math.sin(state.ship.a), y - 22 * Math.sin(state.ship.a) + 4 * Math.cos(state.ship.a));
            ctx.lineTo(x - 14 * Math.cos(state.ship.a), y - 14 * Math.sin(state.ship.a));
            ctx.lineTo(x - 22 * Math.cos(state.ship.a) + 4 * Math.sin(state.ship.a), y - 22 * Math.sin(state.ship.a) - 4 * Math.cos(state.ship.a));
            ctx.stroke();
        }
    }

    if (!state.ship.isRespawning || (state.ship.respawnTimer <= 60 && Math.floor(state.ship.respawnTimer / 10) % 2 === 0)) {
        let shipOffsetsX = [0];
        if (state.ship.x < 30) shipOffsetsX.push(canvas.width);
        else if (state.ship.x > canvas.width - 30) shipOffsetsX.push(-canvas.width);
        
        let shipOffsetsY = [0];
        if (state.ship.y < 30) shipOffsetsY.push(canvas.height);
        else if (state.ship.y > canvas.height - 30) shipOffsetsY.push(-canvas.height);
        
        for (let ox of shipOffsetsX) {
            for (let oy of shipOffsetsY) {
                drawShip(state.ship.x + ox, state.ship.y + oy);
            }
        }
    }

    // Player bullets
    state.bullets.forEach(b => {
        ctx.strokeStyle = '#0ff';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.xv * 0.5, b.y - b.yv * 0.5);
        ctx.stroke();
    });

    // Enemy bullets
    state.enemyBullets.forEach(b => {
        ctx.strokeStyle = '#f0f';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.xv * 0.5, b.y - b.yv * 0.5);
        ctx.stroke();
    });

    // Asteroids & saucers
    state.asteroids.forEach(a => {
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#fff';
        let r = a.size * 10; 
        function drawAst(dx, dy) {
            ctx.beginPath();
            for (let j = 0; j < a.shape.length; j++) {
                let rotatedX = a.shape[j][0] * Math.cos(a.rot) - a.shape[j][1] * Math.sin(a.rot);
                let rotatedY = a.shape[j][0] * Math.sin(a.rot) + a.shape[j][1] * Math.cos(a.rot);
                let px = a.x + dx + rotatedX * r;
                let py = a.y + dy + rotatedY * r;
                if (j === 0) ctx.moveTo(px, py);
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
}
