import { CONFIG, BOT_NAMES } from './config.js';

export class Bot {
    constructor(scene, difficulty) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 3, 1.5),
            new THREE.MeshStandardMaterial({ 
                color: CONFIG.colors.enemy,
                emissive: 0xff0000,
                emissiveIntensity: 0.3,
                roughness: 0.3
            })
        );
        this.mesh.position.set(this.rnd(-40, 40), 1.5, this.rnd(-40, 40));
        this.mesh.userData = { isEnemy: true, health: 100, maxHealth: 100, name: BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] };
        scene.add(this.mesh);

        this.state = 'PATROL';
        this.targetPos = new THREE.Vector3();
        this.moveSpeed = difficulty === 'easy' ? 4 : (difficulty === 'medium' ? 7 : 10);
        this.accuracy = difficulty === 'easy' ? 0.3 : (difficulty === 'medium' ? 0.6 : 0.9);
        this.lastShot = 0;
        this.fireRate = 1000;
    }

    rnd(min, max) { return Math.random() * (max - min) + min; }

    update(dt, playerPos, playerMesh) {
        const dist = this.mesh.position.distanceTo(playerPos);
        
        if (dist < 30) this.state = 'ATTACK';
        else if (dist < 50) this.state = 'CHASE';
        else this.state = 'PATROL';

        if (this.state === 'PATROL') {
            if (this.mesh.position.distanceTo(this.targetPos) < 2) {
                this.targetPos.set(this.rnd(-40, 40), 1.5, this.rnd(-40, 40));
            }
            this.moveTo(this.targetPos, dt);
        } else if (this.state === 'CHASE') {
            this.moveTo(playerPos, dt);
        } else if (this.state === 'ATTACK') {
            this.lookAt(playerPos);
            const now = Date.now();
            if (now - this.lastShot > this.fireRate) {
                const direction = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
                direction.x += this.rnd(-0.1, 0.1) * (1 - this.accuracy);
                direction.z += this.rnd(-0.1, 0.1) * (1 - this.accuracy);
                
                const raycaster = new THREE.Raycaster(this.mesh.position, direction);
                const hits = raycaster.intersectObject(playerMesh);
                
                if (hits.length > 0) {
                    return true; 
                }
                this.lastShot = now;
            }
        }
        return false;
    }

    moveTo(target, dt) {
        const dir = new THREE.Vector3().subVectors(target, this.mesh.position).normalize();
        this.mesh.position.add(dir.multiplyScalar(this.moveSpeed * dt));
        this.lookAt(target);
    }

    lookAt(target) {
        this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    }

    takeDamage(amount) {
        this.mesh.userData.health -= amount;
        this.mesh.material.emissive.setHex(0xffffff);
        setTimeout(() => this.mesh.material.emissive.setHex(0x000000), 100);

        if (this.mesh.userData.health <= 0) return true;
        return false;
    }
}
