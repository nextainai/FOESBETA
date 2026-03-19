import { CONFIG } from './config.js';
import { InputHandler } from './InputHandler.js';
import { Player } from './Player.js';
import { Weapon } from './Weapon.js';
import { Bot } from './Bot.js';
import { UIManager } from './UIManager.js';
import { AudioManager } from './AudioManager.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.FogExp2(CONFIG.colors.sky, 0.015);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.input = new InputHandler();
        this.ui = new UIManager();
        this.audio = new AudioManager();
        this.raycaster = new THREE.Raycaster();
        
        this.bots = [];
        this.playerKills = 0;
        this.isPlaying = false;

        this.setupLights();
        this.setupMap();
        
        window.addEventListener('resize', () => this.onWindowResize());

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => location.reload());
    }

    setupLights() {
        // Bright ambient for visibility
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Main sun light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.bias = -0.0001;
        this.scene.add(dirLight);

        // Colored point lights for Rivals atmosphere
        const light1 = new THREE.PointLight(0x00d4ff, 0.8, 60);
        light1.position.set(-35, 8, -35);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff4655, 0.8, 60);
        light2.position.set(35, 8, 35);
        this.scene.add(light2);

        const light3 = new THREE.PointLight(0x00ff88, 0.5, 50);
        light3.position.set(-35, 8, 35);
        this.scene.add(light3);

        const light4 = new THREE.PointLight(0xffd700, 0.5, 50);
        light4.position.set(35, 8, -35);
        this.scene.add(light4);
    }

    setupMap() {
        // Floor with grid
        const floorGeo = new THREE.PlaneGeometry(200, 200);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.floor, 
            roughness: 0.5,
            metalness: 0.3
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Glowing grid
        const gridHelper = new THREE.GridHelper(200, 40, 0x00d4ff, 0x333344);
        gridHelper.position.y = 0.02;
        this.scene.add(gridHelper);

        // Colorful obstacles (Rivals style)
        const colors = [0xff4655, 0x00d4ff, 0xffd700, 0x9d00ff, 0x00ff88, 0xff6b35];
        const geometries = [
            new THREE.BoxGeometry(4, 4, 4),
            new THREE.CylinderGeometry(2, 2, 6, 8),
            new THREE.BoxGeometry(3, 8, 3),
            new THREE.ConeGeometry(2.5, 6, 6)
        ];
        
        for (let i = 0; i < 35; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const mat = new THREE.MeshStandardMaterial({ 
                color: color,
                roughness: 0.3,
                metalness: 0.6,
                emissive: color,
                emissiveIntensity: 0.25
            });

            const mesh = new THREE.Mesh(geo, mat);
            
            // Random position (avoid center spawn area)
            let x, z;
            do {
                x = (Math.random() * 90) - 45;
                z = (Math.random() * 90) - 45;
            } while (Math.sqrt(x*x + z*z) < 12);
            
            mesh.position.set(x, geo.parameters.height / 2 || 2, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // Boundary walls with glow
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.4,
            metalness: 0.5,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.15
        });
        
        const wallHeight = 10;
        const wallThickness = 3;
        
        const walls = [
            { pos: [0, wallHeight/2, -50], scale: [100, wallHeight, wallThickness] },
            { pos: [0, wallHeight/2, 50], scale: [100, wallHeight, wallThickness] },
            { pos: [-50, wallHeight/2, 0], scale: [wallThickness, wallHeight, 100] },
            { pos: [50, wallHeight/2, 0], scale: [wallThickness, wallHeight, 100] }
        ];
        
        walls.forEach(w => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.scale), wallMat);
            wall.position.set(...w.pos);
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        // Resume audio context on user interaction
        this.audio.resume();
        
        const charType = document.getElementById('char-select').value;
        const diff = document.getElementById('diff-select').value;

        this.player = new Player(this.scene, this.camera, this.input, charType, this.audio);
        this.weapon = new Weapon('rifle', this.audio);
        
        // Setup input callbacks
        this.input.onShoot = () => {
            if (this.isPlaying) {
                this.player.shoot(this.weapon, this.raycaster, this.bots, 
                    (bot) => {
                        this.killBot(bot);
                        this.ui.showHitMarker();
                    },
                    () => {}
                );
            }
        };
        
        this.input.onReload = () => {
            if (this.isPlaying) {
                this.ui.showReloadIndicator();
                this.weapon.reload(() => {
                    this.ui.hideReloadIndicator();
                    this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.totalAmmo);
                });
            }
        };
        
        this.bots = [];
        for(let i = 0; i < CONFIG.botCount; i++) {
            this.bots.push(new Bot(this.scene, diff, this.audio));
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
        
        // Respawn bot after delay
        setTimeout(() => {
            if (this.isPlaying) {
                const diff = document.getElementById('diff-select').value;
                this.bots.push(new Bot(this.scene, diff, this.audio));
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

        // Update player with weapon recoil
        this.weapon.update();
        this.player.update(dt, this.weapon.recoil);
        
        // Update bots
        this.bots.forEach(bot => {
            const botFired = bot.update(dt, this.player.camera.position, this.player.mesh);
            if (botFired) {
                // Bot hit chance
                if (Math.random() > 0.4) {
                    const dead = this.player.takeDamage(bot.damage);
                    this.ui.updateHealth(this.player.health, this.player.maxHealth);
                    this.ui.showDamageFlash();
                    if (dead) this.gameOver();
                }
            }
        });

        // Update UI
        this.ui.updateAmmo(this.weapon.currentAmmo, this.weapon.totalAmmo);
        
        // Throttle leaderboard updates
        if (Math.random() < 0.02) {
            this.ui.updateLeaderboard(this.playerKills, this.bots);
        }

        this.renderer.render(this.scene, this.camera);
    }
}
