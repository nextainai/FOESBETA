import { CONFIG, BOT_NAMES } from './config.js';

export class Bot {
    constructor(scene, difficulty, audioManager) {
        this.audioManager = audioManager;
        this.difficulty = difficulty;
        
        // Create bot with glowing material
        const botColor = CONFIG.colors.enemy;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 3, 1.5),
            new THREE.MeshStandardMaterial({ 
                color: botColor,
                emissive: botColor,
                emissiveIntensity: 0.4,
                roughness: 0.3,
                metalness: 0.5
            })
        );
        
        // FIXED: Spawn bots far from player
        const angle = Math.random() * Math.PI * 2;
        const distance = CONFIG.botSpawnDistance + Math.random() * 15;
        this.mesh.position.set(
            Math.cos(angle) * distance,
            1.5,
            Math.sin(angle) * distance
        );
        
        this.mesh.userData = { 
            isEnemy: true, 
            health: 100, 
            maxHealth: 100, 
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] 
        };
        scene.add(this.mesh);

        // Bot head (for visual)
        const headGeo = new THREE.BoxGeometry(1, 1, 1);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: botColor,
            emissive: botColor,
            emissiveIntensity: 0.5
        });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 1.8;
        this.mesh.add(this.head);

        // AI State
        this.state = 'PATROL';
        this.targetPos = this.getRandomPosition();
        this.lastShot = 0;
        this.reactionTimer = 0;
        
        // Difficulty settings
        this.moveSpeed = difficulty === 'easy' ? 5 : (difficulty === 'medium' ? 8 : 11);
        this.fireRate = CONFIG.botFireRate[difficulty] || 1000;
        this.accuracy = CONFIG.botAccuracy[difficulty] || 0.5;
        this.damage = CONFIG.botDamage[difficulty] || 8;
        this.reactionDelay = CONFIG.botReactionDelay[difficulty] || 1000;
    }

    getRandomPosition() {
        const x = (Math.random() * 80) - 40;
        const z = (Math.random() * 80) - 40;
        return new THREE.Vector3(x, 1.5, z);
    }

    update(dt, playerPos, playerMesh) {
        const dist = this.mesh.position.distanceTo(playerPos);
        
        // State machine with delays
        this.reactionTimer += dt * 1000;
        
        if (dist < 35 && this.reactionTimer > this.reactionDelay) {
            this.state = 'ATTACK';
        } else if (dist < 50) {
            this.state = 'CHASE';
        } else {
            this.state = 'PATROL';
        }

        if (this.state === 'PATROL') {
            if (this.mesh.position.distanceTo(this.targetPos) < 2) {
                this.targetPos = this.getRandomPosition();
            }
            this.moveTo(this.targetPos, dt);
        } else if (this.state === 'CHASE') {
            this.moveTo(playerPos, dt);
        } else if (this.state === 'ATTACK') {
            this.lookAt(playerPos);
            
            const now = Date.now();
            if (now - this.lastShot > this.fireRate) {
                // Aim with accuracy spread
                const direction = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
                
                // Add inaccuracy based on difficulty
                const spread = (1 - this.accuracy) * 0.3;
                direction.x += (Math.random() - 0.5) * spread;
                direction.y += (Math.random() - 0.5) * spread;
                direction.z += (Math.random() - 0.5) * spread;
                direction.normalize();
                
                const raycaster = new THREE.Raycaster(this.mesh.position, direction);
                const hits = raycaster.intersectObject(playerMesh);
                
                if (hits.length > 0) {
                    this.lastShot = now;
                    return true; // Bot fired
                }
                this.lastShot = now;
            }
        }
        return false;
    }

    moveTo(target, dt) {
        const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
        dir.y = 0; // Keep on ground
        dir.normalize();
        this.mesh.position.add(dir.multiplyScalar(this.moveSpeed * dt));
        this.lookAt(target);
    }

    lookAt(target) {
        this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    }

    takeDamage(amount) {
        this.mesh.userData.health -= amount;
        
        // Flash white on hit
        this.mesh.material.emissive.setHex(0xffffff);
        setTimeout(() => {
            this.mesh.material.emissive.setHex(CONFIG.colors.enemy);
        }, 100);

        if (this.mesh.userData.health <= 0) {
            return true;
        }
        return false;
    }
}
