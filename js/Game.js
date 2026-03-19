import { CONFIG } from './config.js';
import { InputHandler } from './InputHandler.js';
import { Player } from './Player.js';
import { Weapon } from './Weapon.js';
import { Bot } from './Bot.js';
import { UIManager } from './UIManager.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.Fog(0x111111, 20, 80);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.input = new InputHandler();
        this.ui = new UIManager();
        this.raycaster = new THREE.Raycaster();
        
        this.bots = [];
        this.playerKills = 0;
        this.isPlaying = false;

        this.setupLights();
        this.setupMap();
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        // Bind UI Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => location.reload());
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        this.scene.add(dirLight);
    }

    setupMap() {
        const floorGeo = new THREE.PlaneGeometry(200, 200);
        const floorMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.floor, roughness: 0.8 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.wall });

        for (let i = 0; i < 40; i++) {
            const h = Math.random() * 4 + 2;
            const w = Math.random() * 3 + 2;
            const d = Math.random() * 3 + 2;
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set((Math.random() * 80) - 40, h/2, (Math.random() * 80) - 40);
            box.scale.set(w, h, d);
            box.castShadow = true;
            box.receiveShadow = true;
            this.scene.add(box);
        }
    }

    start() {
        const charType = document.getElementById('char-select').value;
        const diff = document.getElementById('diff-select').value;

        this.player = new Player(this.scene, this.camera, this.input, charType);
        this.weapon = new Weapon('rifle');
        
        this.bots = [];
        for(let i=0; i<CONFIG.botCount; i++) {
            this.bots.push(new Bot(this.scene, diff));
        }

        this.isPlaying = true;
        this.playerKills = 0;
        this.ui.startGame();
        this.ui.updateHealth(this.player.health, this.player.maxHealth);
        
        document.body.requestPointerLock();

        document.addEventListener('mousedown', () => {
            if(this.isPlaying) this.player.shoot(this.weapon, this.raycaster, this.bots, 
                (bot) => this.killBot(bot), 
                () => {}
            );
        });

        document.addEventListener('keydown', (e) => {
            if(e.code === 'KeyR' && this.isPlaying) {
                this.weapon.reload(() => this.ui.updateAmmo(this.weapon.currentAmmo));
            }
        });

        this.animate();
    }

    killBot(bot) {
        this.scene.remove(bot.mesh);
        this.bots = this.bots.filter(b => b !== bot);
        this.playerKills++;
        this.ui.addKillFeed(`You killed ${bot.mesh.userData.name}`);
        
        setTimeout(() => {
            const diff = document.getElementById('diff-select').value;
            this.bots.push(new Bot(this.scene, diff));
        }, 3000);

        this.ui.updateLeaderboard(this.playerKills, this.bots);
    }

    gameOver() {
        this.isPlaying = false;
        document.exitPointerLock();
        this.ui.endGame(this.playerKills);
    }

    animate() {
        if (!this.isPlaying) return;
        requestAnimationFrame(this.animate);

        const dt = Math.min(this.clock.getDelta(), 0.1);

        this.player.update(dt);
        
        this.bots.forEach(bot => {
            const botShot = bot.update(dt, this.player.camera.position, this.player.mesh);
            if(botShot) {
                // Simple hit chance for bots
                if(Math.random() > 0.3) {
                    const dead = this.player.takeDamage(10);
                    this.ui.updateHealth(this.player.health, this.player.maxHealth);
                    this.ui.showDamageFlash();
                    if(dead) this.gameOver();
                }
            }
        });

        this.ui.updateAmmo(this.weapon.currentAmmo);
        if(Math.random() < 0.05) this.ui.updateLeaderboard(this.playerKills, this.bots);

        this.renderer.render(this.scene, this.camera);
    }
}