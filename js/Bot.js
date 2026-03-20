import { CONFIG, BOT_NAMES } from './config.js';

export class Bot {
    constructor(scene, difficulty) {
        this.difficulty = difficulty;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 3, 1.5),
            new THREE.MeshStandardMaterial({ 
                color: CONFIG.colors.enemy,
                emissive: CONFIG.colors.enemy,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.5
            })
        );
        
        // ✅ FIXED: Spawn far away (Rivals style)
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.botSpawnDistance + Math.random() * 20;
        this.mesh.position.set(
            Math.cos(angle) * dist,
            1.5,
            Math.sin(angle) * dist
        );
        
        this.mesh.userData = { 
            isEnemy: true, 
            health: 100, 
            maxHealth: 100, 
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] 
        };
        scene.add(this.mesh);

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ 
                color: CONFIG.colors.enemy,
                emissive: CONFIG.colors.enemy,
                emissiveIntensity: 0.4
            })
        );
        head.position.y = 1.8;
        this.mesh.add(head);

        // AI
        this.state = 'PATROL';
        this.targetPos = this.getRandomPos();
        this.lastShot = 0;
        this.reactionTimer = 0;
        
        this.moveSpeed = difficulty === 'easy' ? 5 : (difficulty === 'medium' ? 8 : 11);
        this.fireRate = CONFIG.botFireRate[difficulty];
        this.accuracy = CONFIG.botAccuracy[difficulty];
        this.damage = CONFIG.botDamage[difficulty];
        this.reactionDelay = CONFIG.botReactionDelay[difficulty];
    }

    getRandomPos() {
        return new THREE.Vector3(
            (Math.random() * 90) - 45,
            1.5,
            (Math.random() * 90) - 45
        );
    }

    update(dt, playerPos) {
        const dist = this.mesh.position.distanceTo(playerPos);
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
                this.targetPos = this.getRandomPos();
            }
            this.moveTo(this.targetPos, dt);
        } else if (this.state === 'CHASE') {
            this.moveTo(playerPos, dt);
        } else if (this.state === 'ATTACK') {
            this.lookAt(playerPos);
            
            const now = Date.now();
            if (now - this.lastShot > this.fireRate) {
                const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
                
                // Aim spread
                const spread = (1 - this.accuracy) * 0.4;
                dir.x += (Math.random() - 0.5) * spread;
                dir.y += (Math.random() - 0.5) * spread;
                dir.z += (Math.random() - 0.5) * spread;
                dir.normalize();
                
                const raycaster = new THREE.Raycaster(this.mesh.position, dir);
                const hits = raycaster.intersectObject(this.playerHitbox);
                
                if (hits.length > 0) {
                    this.lastShot = now;
                    return true;
                }
                this.lastShot = now;
            }
        }
        return false;
    }

    moveTo(target, dt) {
        const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
        dir.y = 0;
        dir.normalize();
        this.mesh.position.add(dir.multiplyScalar(this.moveSpeed * dt));
        this.lookAt(target);
    }

    lookAt(target) {
        this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    }

    takeDamage(amount) {
        this.mesh.userData.health -= amount;
        this.mesh.material.emissive.setHex(0xffffff);
        setTimeout(() => this.mesh.material.emissive.setHex(CONFIG.colors.enemy), 100);
        return this.mesh.userData.health <= 0;
    }
}
