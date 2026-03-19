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
        
        // Color change on low health
        if (pct < 30) {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff0000 0%, #ff4444 100%)';
        } else {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff4655 0%, #ff6b6b 50%, #ff8888 100%)';
        }
    }

    updateAmmo(curr, total) {
        this.ammoCurr.innerText = curr;
        if (total !== undefined) {
            this.ammoTotal.innerText = total;
        }
    }

    addKillFeed(msg) {
        const div = document.createElement('div');
        div.className = 'kill-msg';
        div.innerText = msg;
        this.feed.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }

    showHitMarker() {
        const marker = document.createElement('div');
        marker.className = 'hit-marker';
        document.body.appendChild(marker);
        setTimeout(() => marker.remove(), 200);
    }

    showReloadIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'reload-indicator';
        indicator.innerText = 'RELOADING...';
        indicator.id = 'reload-text';
        document.body.appendChild(indicator);
    }

    hideReloadIndicator() {
        const indicator = document.getElementById('reload-text');
        if (indicator) indicator.remove();
    }

    updateLeaderboard(playerKills, bots) {
        let html = `<div class="leaderboard-row"><span>YOU</span><span>${playerKills}</span></div>`;
        
        // Sort bots by random score for leaderboard effect
        const botScores = bots.map(bot => ({
            name: bot.mesh.userData.name,
            score: Math.floor(Math.random() * 8)
        })).sort((a, b) => b.score - a.score);
        
        botScores.forEach(bot => {
            html += `<div class="leaderboard-row"><span>${bot.name}</span><span>${bot.score}</span></div>`;
        });
        
        this.lbContent.innerHTML = html;
    }
    
    showDamageFlash() {
        const overlay = document.getElementById('damage-overlay');
        overlay.style.opacity = 0.8;
        setTimeout(() => overlay.style.opacity = 0, 200);
    }
}
