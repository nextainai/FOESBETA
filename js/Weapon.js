import { WEAPONS } from './config.js';

export class Weapon {
    constructor(type, audioManager) {
        this.stats = WEAPONS[type];
        this.currentAmmo = this.stats.magSize;
        this.totalAmmo = 90;
        this.lastShot = 0;
        this.isReloading = false;
        this.recoil = 0;
        this.recoilRecovery = 0.1;
        this.audioManager = audioManager;
    }

    shoot(camera, raycaster, enemies, onHit, onMiss) {
        const now = Date.now();
        if (this.isReloading || this.currentAmmo <= 0 || now - this.lastShot < this.stats.fireRate * 1000) return false;

        this.lastShot = now;
        this.currentAmmo--;
        this.recoil += this.stats.recoil;
        
        if (this.audioManager) this.audioManager.playShoot();

        // Add recoil to camera
        camera.rotation.x += this.recoil * 0.5;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(enemies);

        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            onHit(hitObj, this.stats.damage);
            return true;
        } else {
            onMiss();
            return false;
        }
    }

    reload(callback) {
        if (this.isReloading || this.currentAmmo === this.stats.magSize) return;
        this.isReloading = true;
        
        if (this.audioManager) this.audioManager.playReload();
        
        setTimeout(() => {
            this.currentAmmo = this.stats.magSize;
            this.isReloading = false;
            if(callback) callback();
        }, this.stats.reloadTime);
    }

    update() {
        // Recover recoil over time
        if (this.recoil > 0) {
            this.recoil -= this.recoilRecovery;
            if (this.recoil < 0) this.recoil = 0;
        }
    }
}
