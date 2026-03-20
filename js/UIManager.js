export class UIManager {
    constructor() {
        this.lbContent = document.getElementById('lb-content');
        this.feed = document.getElementById('kill-feed');
        this.healthFill = document.getElementById('health-fill');
        this.healthText = document.getElementById('health-text');
        this.ammoCurr = document.getElementById('ammo-current');
        this.ammoTotal = document.getElementById('ammo-total');
        
        this.mainMenu = document.getElementById('main-menu');
        this.gameOverScreen = document.getElementById('game-over');
        this.hud = document.getElementById('hud');
        this.finalScore = document.getElementById('final-score');
        this.crosshair = document.getElementById('crosshair');
    }

    showMenu() {
        this.mainMenu.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.crosshair.style.display = 'none';
    }

    startGame() {
        this.mainMenu.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.crosshair.style.display = 'block';
    }

    endGame(score) {
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.finalScore.innerText = `Kills: ${score}`;
        this.crosshair.style.display = 'none';
    }

    updateHealth(curr, max) {
        const pct = Math.max(0, (curr / max) * 100);
        this.healthFill.style.width = `${pct}%`;
        this.healthText.innerText = Math.ceil(curr);
        
        if (pct < 30) {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff0000 0%, #ff4444 100%)';
        } else {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff4655 0%, #ff6b6b 50%, #ff8888 100%)';
        }
    }

    updateAmmo(curr, total) {
        this.ammoCurr.innerText = curr;
        this.ammoTotal.innerText = total;
    }

    addKillFeed(msg) {
        const div = document.createElement('div');
        div.className = 'kill-msg';
        div.innerText = msg;
        this.feed.appendChild(div);
        setTimeout(() => div.remove(), 4500);
    }

    showHitMarker() {
        const marker = document.createElement('div');
        marker.className = 'hit-marker';
        document.body.appendChild(marker);
        setTimeout(() => marker.remove(), 180);
    }

    updateLeaderboard(playerKills, bots) {
        let html = `<div class="leaderboard-row"><span>YOU</span><span>${playerKills}</span></div>`;
        
        const scores = bots.map(b => ({
            name: b.mesh.userData.name,
            score: Math.floor(Math.random() * 6)
        })).sort((a, b) => b.score - a.score);
        
        scores.forEach(s => {
            html += `<div class="leaderboard-row"><span>${s.name}</span><span>${s.score}</span></div>`;
        });
        
        this.lbContent.innerHTML = html;
    }
    
    showDamageFlash() {
        const overlay = document.getElementById('damage-overlay');
        overlay.style.opacity = 0.7;
        setTimeout(() => overlay.style.opacity = 0, 180);
    }
}
