import { WEAPONS } from './config.js';

export class Weapon {
    constructor(type) {
        this.stats = WEAPONS[type];
        this.currentAmmo = this.stats.magSize;
        this.lastShot = 0;
        this.isReloading = false;
        this.recoil = 0;
    }

    shoot(camera, raycaster, enemies, onHit, onMiss) {
        const now = Date.now();
        if (this.isReloading || this.currentAmmo <= 0 || now - this.lastShot < this.stats.fireRate * 1000) return;

        this.lastShot = now;
        this.currentAmmo--;
        this.recoil = 0.05; 

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(enemies);

        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            onHit(hitObj, this.stats.damage);
        } else {
            onMiss();
        }
    }

    reload(callback) {
        if (this.isReloading || this.currentAmmo === this.stats.magSize) return;
        this.isReloading = true;
        setTimeout(() => {
            this.currentAmmo = this.stats.magSize;
            this.isReloading = false;
            if(callback) callback();
        }, this.stats.reloadTime);
    }
}