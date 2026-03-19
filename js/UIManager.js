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
    }

    showMenu() {
        this.mainMenu.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
    }

    startGame() {
        this.mainMenu.classList.add('hidden');
        this.hud.classList.remove('hidden');
    }

    endGame(score) {
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.finalScore.innerText = `Kills: ${score}`;
    }

    updateHealth(curr, max) {
        const pct = Math.max(0, (curr / max) * 100);
        this.healthFill.style.width = `${pct}%`;
        this.healthText.innerText = Math.ceil(curr);
    }

    updateAmmo(curr) {
        this.ammoCurr.innerText = curr;
    }

    addKillFeed(msg) {
        const div = document.createElement('div');
        div.className = 'kill-msg';
        div.innerText = msg;
        this.feed.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }

    updateLeaderboard(playerKills, bots) {
        let html = `<div class="leaderboard-row"><span>YOU</span><span>${playerKills}</span></div>`;
        bots.forEach(bot => {
            const score = Math.floor(Math.random() * 5); 
            html += `<div class="leaderboard-row" style="opacity:0.7"><span>${bot.mesh.userData.name}</span><span>${score}</span></div>`;
        });
        this.lbContent.innerHTML = html;
    }
    
    showDamageFlash() {
        const overlay = document.getElementById('damage-overlay');
        overlay.style.opacity = 1;
        setTimeout(() => overlay.style.opacity = 0, 200);
    }
}