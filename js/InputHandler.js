export class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isLocked = false;

        document.addEventListener('keydown', e => this.keys[e.code] = true);
        document.addEventListener('keyup', e => this.keys[e.code] = false);
        
        document.addEventListener('mousemove', e => {
            if (this.isLocked) {
                this.mouse.x = e.movementX;
                this.mouse.y = e.movementY;
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === document.body;
        });
    }
}