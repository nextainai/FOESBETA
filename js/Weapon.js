import { WEAPONS } from './config.js';

export class Weapon {
    constructor(type) {
        this.stats = WEAPONS[type];
        this.currentAmmo = this.stats.magSize;
        this.totalAmmo = 90;
        this.lastShot = 0;
        this.isReloading = false;
        this.recoil = 0;
        this.recoilRecovery = 0.12;
    }

    shoot(camera, raycaster, enemies, onHit) {
        const now = Date.now();
        if (this.isReloading || this.currentAmmo <= 0 || now - this.lastShot < this.stats.fireRate * 1000) return false;

        this.lastShot = now;
        this.currentAmmo--;
        this.recoil += this.stats.recoil;

        // Add recoil to camera
        camera.rotation.x += this.recoil * 0.4;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects(enemies);

        if (hits.length > 0) {
            const bot = enemies.find(b => b.mesh === hits[0].object);
            if (bot) onHit(bot, this.stats.damage);
            return true;
        }
        return false;
    }

    reload(callback) {
        if (this.isReloading || this.currentAmmo === this.stats.magSize) return;
        this.isReloading = true;
        
        setTimeout(() => {
            this.currentAmmo = this.stats.magSize;
            this.isReloading = false;
            if (callback) callback();
        }, this.stats.reloadTime);
    }

    update() {
        if (this.recoil > 0) {
            this.recoil -= this.recoilRecovery;
            if (this.recoil < 0) this.recoil = 0;
        }
    }
}
