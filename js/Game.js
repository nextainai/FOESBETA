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
        // Brighter ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        // Main directional light (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Add point lights for atmosphere (Rivals Style)
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 50);
        pointLight1.position.set(-30, 10, -30);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 50);
        pointLight2.position.set(30, 10, 30);
        this.scene.add(pointLight2);
    }

    setupMap() {
        // Brighter floor with grid texture effect
        const floorGeo = new THREE.PlaneGeometry(200, 200);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.floor, 
            roughness: 0.4,
            metalness: 0.3
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add grid helper for Rivals-style look
        const gridHelper = new THREE.GridHelper(200, 50, 0x00ffff, 0x444444);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // Create colorful obstacles (Rivals style)
        const colors = [0xff4655, 0x00d4ff, 0xffd700, 0x9d00ff, 0x00ff88];
        
        for (let i = 0; i < 30; i++) {
            const type = Math.floor(Math.random() * 3);
            let geometry, material, mesh;
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            material = new THREE.MeshStandardMaterial({ 
                color: color,
                roughness: 0.3,
                metalness: 0.5,
                emissive: color,
                emissiveIntensity: 0.2
            });

            if (type === 0) {
                // Box
                geometry = new THREE.BoxGeometry(4, 4, 4);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 2;
            } else if (type === 1) {
                // Cylinder
                geometry = new THREE.CylinderGeometry(2, 2, 6, 8);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 3;
            } else {
                // Tall pillar
                geometry = new THREE.BoxGeometry(2, 10, 2);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 5;
            }

            mesh.position.x = (Math.random() * 80) - 40;
            mesh.position.z = (Math.random() * 80) - 40;
            
            // Keep center area clear for spawn
            if (mesh.position.distanceTo(new THREE.Vector3(0, 0, 0)) < 10) {
                mesh.position.x += 15;
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // Add boundary walls
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.5
        });
        
        const wallHeight = 8;
        const wallThickness = 2;
        
        // North wall
        const northWall = new THREE.Mesh(new THREE.BoxGeometry(100, wallHeight, wallThickness), wallMat);
        northWall.position.set(0, wallHeight/2, -50);
        northWall.receiveShadow = true;
        this.scene.add(northWall);
        
        // South wall
        const southWall = new THREE.Mesh(new THREE.BoxGeometry(100, wallHeight, wallThickness), wallMat);
        southWall.position.set(0, wallHeight/2, 50);
        southWall.receiveShadow = true;
        this.scene.add(southWall);
        
        // East wall
        const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 100), wallMat);
        eastWall.position.set(50, wallHeight/2, 0);
        eastWall.receiveShadow = true;
        this.scene.add(eastWall);
        
        // West wall
        const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 100), wallMat);
        westWall.position.set(-50, wallHeight/2, 0);
        westWall.receiveShadow = true;
        this.scene.add(westWall);
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
