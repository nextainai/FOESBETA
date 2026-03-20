import { CONFIG } from './config.js';
import { InputHandler } from './InputHandler.js';
import { Player } from './Player.js';
import { Weapon } from './Weapon.js';
import { Bot } from './Bot.js';
import { UIManager } from './UIManager.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.sky, 0.012);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.input = new InputHandler();
        this.ui = new UIManager();
        this.raycaster = new THREE.Raycaster();
        
        this.bots = [];
        this.playerKills = 0;
        this.isPlaying = false;

        this.setupLights();
        this.setupMap();
        
        window.addEventListener('resize', () => this.onResize());
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => location.reload());
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
        dirLight.position.set(50, 120, 50);
Light.castShadow = true;
        dirLight.shadow.camera.left = -120;
        dirLight.shadow.camera.right = 120;
        dirLight.shadow.camera.top = 120;
        dirLight.shadow.camera.bottom = -120;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Rivals-style colored lights
        const l1 = new THREE.PointLight(0x00d4ff, 0.7, 70);
        l1.position.set(-40, 10, -40);
        this.scene.add(l1);

        const l2 = new THREE.PointLight(0xff4655, 0.7, 70);
        l2.position.set(40, 10, 40);
        this.scene.add(l2);
    }

    setupMap() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(100, 100);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.floor, 
            roughness: 0.6,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid (Rivals style)
        const grid = new THREE.GridHelper(100, 50, 0x00d4ff, 0x333344);
        grid.position.y = 0.01;
        this.scene.add(grid);

        // Platforms (like Rivals)
        const platforms = [
            { pos: [-25, 2, -25], size: [10, 4, 10], color: 0xff4655 },
            { pos: [25, 2, 25], size: [10, 4, 10], color: 0x00d4ff },
            { pos: [-25, 2, 25], size: [10, 4, 10], color: 0xffd700 },
            { pos: [25, 2, -25], size: [10, 4, 10], color: 0x9d00ff },
            { pos: [0, 4, 0], size: [20, 6, 20], color: 0x00ff88 }
        ];

        platforms.forEach(p => {
            const geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2]);
            const mat = new THREE.MeshStandardMaterial({
                color: p.color,
                roughness: 0.3,
                metalness: 0.6,
                emissive: p.color,
                emissiveIntensity: 0.2
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // Walls
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.4,
            metalness: 0.5,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.1
        });
        
        const walls = [
            { pos: [0, 5, -50], size: [100, 10, 3] },
            { pos: [0, 5, 50], size: [100, 10, 3] },
            { pos: [-50, 5, 0], size: [3, 10, 100] },
            { pos: [50, 5, 0], size: [3, 10, 100] }
        ];
        
        walls.forEach(w => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
            wall.position.set(...w.pos);
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        const charType = document.getElementById('char-select').value;
        const diff = document.getElementById('diff-select').value;

        this.player = new Player(this.scene, this.camera, this.input, charType);
        this.weapon = new Weapon('rifle');
        
        this.input.onShoot = () => {
            if (this.isPlaying) {
                this.player.shoot(this.weapon, this.raycaster, this.bots, (bot) => {
                    this.killBot(bot);
                    this.ui.showHitMarker();
                });
            }
        };
        
        this.input.onReload = () => {
            if (this.isPlaying) {
                this.weapon.reload(() => {
                    this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.totalAmmo);
                });
            }
        };

        this.bots = [];
        for(let i = 0; i < CONFIG.botCount; i++) {
            this.bots.push(new Bot(this.scene, diff));
        }

        this.isPlaying = true;
        this.playerKills = 0;
        this.ui.startGame();
        this.ui.updateHealth(this.player.health, this.player.maxHealth);
        this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.totalAmmo);
        
        document.body.requestPointerLock();
        this.animate();
    }

    killBot(bot) {
        this.scene.remove(bot.mesh);
        this.bots = this.bots.filter(b => b !== bot);
        this.playerKills++;
        this.ui.addKillFeed(`You killed ${bot.mesh.userData.name}`);
        
        setTimeout(() => {
            if (this.isPlaying) {
                const diff = document.getElementById('diff-select').value;
                this.bots.push(new Bot(this.scene, diff));
            }
        }, 4000);

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

        this.weapon.update();
        this.player.update(dt, this.weapon.recoil);
        
        this.bots.forEach(bot => {
            const fired = bot.update(dt, this.player.camera.position);
            if (fired) {
                if (Math.random() > 0.5) {
                    const dead = this.player.takeDamage(bot.damage);
                    this.ui.updateHealth(this.player.health, this.player.maxHealth);
                    this.ui.showDamageFlash();
                    if (dead) this.gameOver();
                }
            }
        });

        this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.totalAmmo);
        if (Math.random() < 0.01) this.ui.updateLeaderboard(this.playerKills, this.bots);

        this.renderer.render(this.scene, this.camera);
    }
}
