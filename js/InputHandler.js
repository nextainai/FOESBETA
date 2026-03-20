export class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isLocked = false;
        this.mouseDown = false;

        document.addEventListener('keydown', e => this.keys[e.code] = true);
        document.addEventListener('keyup', e => this.keys[e.code] = false);
        
        document.addEventListener('mousemove', e => {
            if (this.isLocked) {
                this.mouse.x = e.movementX;
                this.mouse.y = e.movementY;
            }
        });

        document.addEventListener('mousedown', () => {
            this.mouseDown = true;
            if (this.onShoot) this.onShoot();
        });

        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === document.body;
        });
    }

    onShoot = null;
    onReload = null;
}
