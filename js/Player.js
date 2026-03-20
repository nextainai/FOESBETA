import { CONFIG, CHARACTERS } from './config.js';

export class Player {
    constructor(scene, camera, input, charType) {
        this.camera = camera;
        this.input = input;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.canJump = false;
        
        const charStats = CHARACTERS[charType] || CHARACTERS.balanced;
        this.moveSpeed = charStats.speed;
        this.health = charStats.health;
        this.maxHealth = charStats.health;
        
        // ✅ FIXED: Start at safe height
        this.camera.position.set(0, 2.2, 0);
        this.camera.rotation.order = 'YXZ';
        
        // Weapon group
        this.weaponGroup = this.createWeapon();
        this.weaponGroup.position.set(0.35, -0.32, -0.75);
        this.camera.add(this.weaponGroup);
        scene.add(this.camera);

        // Hitbox
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 3, 1),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.mesh.position.set(0, 1.5, 0);
        scene.add(this.mesh);
        
        this.walkTime = 0;
        this.recoil = 0;
    }

    createWeapon() {
        const g = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.18, 0.7),
            new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.3, metalness: 0.8 })
        );
        g.add(body);
        
        // Barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12),
            new THREE.MeshStandardMaterial({ color: 01a1a2e, roughness: 0.2, metalness: 0.9 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.5);
        g.add(barrel);
        
        // Muzzle flash point
        const muzzle = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 })
        );
        muzzle.position.set(0, 0.03, -0.68);
        g.add(muzzle);
        
        // Sight
        const sight = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.06, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xff4655, emissive: 0xff4655, emissiveIntensity: 0.5 })
        );
        sight.position.set(0, 0.12, -0.05);
        g.add(sight);
        
        return g;
    }

    update(dt, recoil) {
        // Mouse look
        this.camera.rotation.y -= this.input.mouse.x * CONFIG.sensitivity;
        this.camera.rotation.x -= this.input.mouse * CONFIG.sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, this.camera.rotation.x));
        this.input.mouse.x = 0;
        this.input.mouse.y = 0;

        // Movement
        this.direction.z = Number(this.input.keys['KeyW']) - Number(this.input.keys['KeyS']);
        this.direction.x = Number(this.input.keys['KeyD']) - Number(this.input.keys['KeyA']);
        this.direction.normalize();

        const targetVel = new THREE.Vector3();
        if (this.input.keys['KeyW'] || this.input.keys['KeyS']) targetVel.z = -this.direction.z * this.moveSpeed;
        if (this.input.keys['KeyA'] || this.input.keys['KeyD']) targetVel.x = -this.direction.x * this.moveSpeed;

        // Smooth acceleration
        this.velocity.x += (targetVel.x - this.velocity.x) * 5 * dt;
        this.velocity.z += (targetVel.z - this.velocity.z) * 5 * dt;

        // Friction
        this.velocity.x *= 0.92;
        this.velocity.z *= 0.92;

        // Gravity
        this.velocity.y -= CONFIG.gravity * dt;

        // Apply
        this.camera.position.x += this.velocity.x * dt;
        this.camera.position.z += this.velocity.z * dt;
        this.camera.position.y += this.velocity.y * dt;

        // ✅ FIXED: Floor collision (no falling through)
        if (this.camera.position.y < 2.2) {
            this.velocity.y = 0;
            this.camera.position.y = 2.2;
            this.canJump = true;
        }

        // Bounds (Rivals-style arena: 50x50)
        this.camera.position.x = Math.max(-49, Math.min(49, this.camera.position.x));
        this.camera.position.z = Math(-49, Math.min(49, this.camera.position.z));

        // Jump
        if (this.input.keys['Space'] && this.canJump) {
            this.velocity.y = CONFIG.jumpForce;
            this.canJump = false;
        }

        // Sync hitbox
        this.mesh.position.copy(this.camera.position);
        this.mesh.position.y -= 0.7;

        // Weapon animation
        const walkSway = Math.sin(this.walkTime) * 0.018;
        const walkBob = Math.abs(Math.sin(this.walkTime)) * 0.025;
        
        this.weaponGroup.position.x = 0.35 + walkSway + (this.velocity.x * 0.0008);
        this.weaponGroup.position.y = -0.32 - walkBob + (this.velocity.z * 0.0008) + (recoil * 0.3);
        this.weaponGroup.position.z = -0.75 + (recoil * 0.5);
        this.weaponGroup.rotation.x = recoil * 0.7;
        this.weaponGroup.rotation.y = walkSway * 0.2;

        this.walkTime += dt * 10;
    }

    shoot(weapon, raycaster, enemies, onHit) {
        const now = Date.now();
        if (weapon.isReloading || weapon.currentAmmo <= 0 || now - weapon.lastShot < weapon.stats.fireRate * 1000) return;

        weapon.lastShot = now;
        weapon.currentAmmo--;
        weapon.recoil += weapon.stats.recoil;

        // Raycast
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const hits = raycaster.intersectObjects(enemies);

        if (hits.length > 0) {
            const bot = enemies.find(b => b.mesh === hits[0].object);
            if (bot) {
                const dead = bot.takeDamage(weapon.stats.damage);
                if (dead) onHit(bot);
                
                // Muzzle flash
                const muzzle = this.weaponGroup.children.find(c => c.type === 'Mesh' && c.geometry.type === 'SphereGeometry');
                if (muzzle) {
                    muzzle.material.opacity = 1;
                    setTimeout(() => { muzzle.material.opacity = 0; }, 50);
                }
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}
