import { CONFIG, CHARACTERS } from './config.js';

export class Player {
    constructor(scene, camera, input, charType, audioManager) {
        this.camera = camera;
        this.input = input;
        this.audioManager = audioManager;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.canJump = false;
        
        const charStats = CHARACTERS[charType] || CHARACTERS.balanced;
        this.moveSpeed = charStats.speed;
        this.health = charStats.health;
        this.maxHealth = charStats.health;
        
        // FIXED: Start player at proper height above floor
        this.camera.position.set(0, 2, 0);
        this.camera.rotation.order = 'YXZ';
        
        // Create detailed weapon model
        this.weaponGroup = this.createWeaponModel();
        this.weaponGroup.position.set(0.35, -0.3, -0.7);
        this.camera.add(this.weaponGroup);
        scene.add(this.camera);

        // Player hitbox (for bot targeting)
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 3, 1),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.mesh.position.set(0, 1.5, 0);
        scene.add(this.mesh);
        
        // Movement smoothing
        this.smoothVelocity = new THREE.Vector3();
        this.walkTime = 0;
    }

    createWeaponModel() {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.18, 0.7);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a3a,
            roughness: 0.3,
            metalness: 0.8,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        
        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12);
        const barrelMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.2,
            metalness: 0.9
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.5);
        group.add(barrel);
        
        // Muzzle
        const muzzleGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.08, 8);
        const muzzle = new THREE.Mesh(muzzleGeo, barrelMat);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, 0.03, -0.68);
        group.add(muzzle);
        
        // Sight
        const sightGeo = new THREE.BoxGeometry(0.06, 0.06, 0.12);
        const sightMat = new THREE.MeshStandardMaterial({ 
            color: 0xff4655,
            emissive: 0xff4655,
            emissiveIntensity: 0.4
        });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.12, -0.05);
        group.add(sight);
        
        // Magazine
        const magGeo = new THREE.BoxGeometry(0.1, 0.28, 0.12);
        const magMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.5
        });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0, -0.18, 0.08);
        mag.rotation.x = 0.1;
        group.add(mag);
        
        // Handguard
        const guardGeo = new THREE.BoxGeometry(0.14, 0.08, 0.3);
        const guardMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a3a4a,
            roughness: 0.5
        });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.set(0, -0.08, -0.25);
        group.add(guard);
        
        return group;
    }

    update(dt, weaponRecoil) {
        // Mouse look with proper rotation order
        this.camera.rotation.y -= this.input.mouse.x * CONFIG.sensitivity;
        this.camera.rotation.x -= this.input.mouse.y * CONFIG.sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, this.camera.rotation.x));
        this.input.mouse.x = 0;
        this.input.mouse.y = 0;

        // Movement input
        this.direction.z = Number(this.input.keys['KeyW']) - Number(this.input.keys['KeyS']);
        this.direction.x = Number(this.input.keys['KeyD']) - Number(this.input.keys['KeyA']);
        
        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.walkTime += dt * 10;
        }

        // Acceleration
        const targetVelocity = new THREE.Vector3();
        if (this.input.keys['KeyW'] || this.input.keys['KeyS']) {
            targetVelocity.z = -this.direction.z * this.moveSpeed;
        }
        if (this.input.keys['KeyA'] || this.input.keys['KeyD']) {
            targetVelocity.x = -this.direction.x * this.moveSpeed;
        }

        // Smooth movement
        this.smoothVelocity.x += (targetVelocity.x - this.smoothVelocity.x) * 5 * dt;
        this.smoothVelocity.z += (targetVelocity.z - this.smoothVelocity.z) * 5 * dt;

        // Apply friction
        this.smoothVelocity.x -= this.smoothVelocity.x * 8.0 * dt;
        this.smoothVelocity.z -= this.smoothVelocity.z * 8.0 * dt;

        // Gravity
        this.velocity.y -= CONFIG.gravity * dt;

        // Apply movement
        this.camera.position.x += this.smoothVelocity.x * dt;
        this.camera.position.z += this.smoothVelocity.z * dt;
        this.camera.position.y += this.velocity.y * dt;

        // FIXED: Floor collision - keep player ABOVE ground
        const floorHeight = 2;
        if (this.camera.position.y < floorHeight) {
            this.velocity.y = 0;
            this.camera.position.y = floorHeight;
            this.canJump = true;
        }

        // Keep player in bounds (with padding)
        const bound = 47;
        this.camera.position.x = Math.max(-bound, Math.min(bound, this.camera.position.x));
        this.camera.position.z = Math.max(-bound, Math.min(bound, this.camera.position.z));

        // Jump
        if (this.input.keys['Space'] && this.canJump) {
            this.velocity.y = CONFIG.jumpForce;
            this.canJump = false;
        }

        // Sync hitbox with camera
        this.mesh.position.x = this.camera.position.x;
        this.mesh.position.z = this.camera.position.z;
        this.mesh.position.y = this.camera.position.y - 0.5;

        // Weapon sway and recoil animation
        const walkSway = Math.sin(this.walkTime) * 0.015;
        const walkBob = Math.abs(Math.sin(this.walkTime * 0.5)) * 0.02;
        
        // Base position
        const baseX = 0.35;
        const baseY = -0.3;
        const baseZ = -0.7;
        
        // Apply sway, bob, and recoil
        this.weaponGroup.position.x = baseX + walkSway + (this.smoothVelocity.x * 0.0008);
        this.weaponGroup.position.y = baseY - walkBob + (this.smoothVelocity.z * 0.0008) + (weaponRecoil * 0.3);
        this.weaponGroup.position.z = baseZ + (weaponRecoil * 0.5);
        
        // Weapon rotation from recoil
        this.weaponGroup.rotation.x = weaponRecoil * 0.8;
        this.weaponGroup.rotation.y = walkSway * 0.3;
    }

    shoot(weapon, raycaster, enemies, onHit, onMiss) {
        const hit = weapon.shoot(
            this.camera, 
            raycaster, 
            enemies.map(b => b.mesh),
            (hitObj, dmg) => {
                const bot = enemies.find(b => b.mesh === hitObj);
                if(bot) {
                    const dead = bot.takeDamage(dmg);
                    if(dead) onHit(bot);
                    // Muzzle flash effect
                    this.createMuzzleFlash();
                }
            },
            () => {}
        );
        
        if (hit && this.audioManager) {
            this.audioManager.playShoot();
        }
    }

    createMuzzleFlash() {
        const flashGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 1
        });
        const flash = new THREE.Mesh(flashGeo, flashMat);
        
        // Position at end of barrel (in world space)
        const flashPos = new THREE.Vector3(0, 0.03, -0.85);
        flashPos.applyMatrix4(this.weaponGroup.matrixWorld);
        flash.position.copy(flashPos);
        
        // Add to scene temporarily
        const scene = this.camera.parent;
        if (scene) {
            scene.add(flash);
            setTimeout(() => scene.remove(flash), 50);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.audioManager) this.audioManager.playDamage();
        if (this.health <= 0) return true;
        return false;
    }
}
