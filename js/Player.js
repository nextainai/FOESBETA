import { CONFIG } from './config.js';

export class Player {
    constructor(scene, camera, input, charType) {
        this.camera = camera;
        this.input = input;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.canJump = false;
        this.health = 100;
        this.maxHealth = 100;
        
        // Set initial camera position ABOVE the ground
        this.camera.position.set(0, 2, 0);
        
        if(charType === 'speed') this.moveSpeed = 15;
        else if(charType === 'tank') { this.moveSpeed = 8; this.maxHealth = 150; this.health = 150; }
        else this.moveSpeed = 12;

        // Improved weapon model (Group of shapes)
        const weaponGroup = new THREE.Group();
        
        // Main body
        const bodyGeo = new THREE.BoxGeometry(0.15, 0.2, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a3a,
            roughness: 0.3,
            metalness: 0.8
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        weaponGroup.add(body);
        
        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const barrelMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.2,
            metalness: 0.9
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.05, -0.45);
        weaponGroup.add(barrel);
        
        // Sight/Scope
        const sightGeo = new THREE.BoxGeometry(0.08, 0.08, 0.15);
        const sightMat = new THREE.MeshStandardMaterial({ 
            color: 0xff4655,
            emissive: 0xff4655,
            emissiveIntensity: 0.3
        });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.15, -0.1);
        weaponGroup.add(sight);
        
        // Magazine
        const magGeo = new THREE.BoxGeometry(0.12, 0.25, 0.15);
        const magMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.4
        });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0, -0.15, 0.1);
        weaponGroup.add(mag);

        this.weaponMesh = weaponGroup;
        this.weaponMesh.position.set(0.3, -0.25, -0.6);
        this.camera.add(this.weaponMesh);
        scene.add(this.camera);

        // Player hitbox
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 3, 1),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.mesh.position.y = 1.5;
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

        // FIXED: Better floor collision
        if (this.camera.position.y < 2) {
            this.velocity.y = 0;
            this.camera.position.y = 2;
            this.canJump = true;
        }

        // Keep player in bounds
        this.camera.position.x = Math.max(-48, Math.min(48, this.camera.position.x));
        this.camera.position.z = Math.max(-48, Math.min(48, this.camera.position.z));

        if (this.input.keys['Space'] && this.canJump) {
            this.velocity.y = CONFIG.jumpForce;
            this.canJump = false;
        }

        this.mesh.position.copy(this.camera.position);
        this.mesh.position.y -= 1.5;

        // Weapon sway animation
        const walkCycle = Math.sin(Date.now() * 0.01) * 0.02;
        this.weaponMesh.position.x = 0.3 + (this.velocity.x * 0.001);
        this.weaponMesh.position.y = -0.25 + walkCycle + (this.velocity.z * 0.001);
        this.weaponMesh.position.z = THREE.MathUtils.lerp(this.weaponMesh.position.z, -0.6, 0.1);
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
