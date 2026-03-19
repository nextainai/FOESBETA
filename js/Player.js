import { CONFIG } from './config.js';
import { Weapon } from './Weapon.js';

export class Player {
    constructor(scene, camera, input, charType) {
        this.camera = camera;
        this.input = input;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.canJump = false;
        this.health = 100;
        this.maxHealth = 100;
        
        if(charType === 'speed') this.moveSpeed = 15;
        else if(charType === 'tank') { this.moveSpeed = 8; this.maxHealth = 150; this.health = 150; }
        else this.moveSpeed = 10;

        this.weaponMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.8),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        this.weaponMesh.position.set(0.3, -0.3, -0.5);
        this.camera.add(this.weaponMesh);
        scene.add(this.camera);

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        scene.add(this.mesh);
    }

    update(dt) {
        this.camera.rotation.y -= this.input.mouse.x * CONFIG.sensitivity;
        this.camera.rotation.x -= this.input.mouse.y * CONFIG.sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
        this.input.mouse.x = 0;
        this.input.mouse.y = 0;

        this.direction.z = Number(this.input.keys['KeyW']) - Number(this.input.keys['KeyS']);
        this.direction.x = Number(this.input.keys['KeyD']) - Number(this.input.keys['KeyA']);
        this.direction.normalize();

        if (this.input.keys['KeyW'] || this.input.keys['KeyS']) this.velocity.z -= this.direction.z * this.moveSpeed * dt;
        if (this.input.keys['KeyA'] || this.input.keys['KeyD']) this.velocity.x -= this.direction.x * this.moveSpeed * dt;

        this.velocity.x -= this.velocity.x * 10.0 * dt;
        this.velocity.z -= this.velocity.z * 10.0 * dt;
        this.velocity.y -= CONFIG.gravity * dt;

        this.camera.position.x += this.velocity.x * dt;
        this.camera.position.z += this.velocity.z * dt;
        this.camera.position.y += this.velocity.y * dt;

        if (this.camera.position.y < 2) {
            this.velocity.y = 0;
            this.camera.position.y = 2;
            this.canJump = true;
        }

        if (this.input.keys['Space'] && this.canJump) {
            this.velocity.y = CONFIG.jumpForce;
            this.canJump = false;
        }

        this.mesh.position.copy(this.camera.position);
        this.mesh.position.y -= 1;

        this.weaponMesh.position.z = THREE.MathUtils.lerp(this.weaponMesh.position.z, -0.5, 0.1);
        this.weaponMesh.rotation.x = THREE.MathUtils.lerp(this.weaponMesh.rotation.x, 0, 0.1);
    }

    shoot(weapon, raycaster, enemies, onHit, onMiss) {
        weapon.shoot(
            this.camera, 
            raycaster, 
            enemies.map(b => b.mesh),
            (hitObj, dmg) => {
                const bot = enemies.find(b => b.mesh === hitObj);
                if(bot) {
                    const dead = bot.takeDamage(dmg);
                    if(dead) onHit(bot); // Bot died
                    this.camera.position.y += 0.05; // Screen shake
                }
            },
            () => {}
        );
        this.weaponMesh.position.z += 0.2;
        this.weaponMesh.rotation.x += 0.2;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) return true; // Dead
        return false;
    }
}
