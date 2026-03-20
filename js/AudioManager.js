export default class AudioManager {
  constructor() {
    this.shootSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-gun-shot-1681.mp3");
    this.hitSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-hit-1115.mp3");
  }

  playShoot() {
    this.shootSound.currentTime = 0;
    this.shootSound.play();
  }

  playHit() {
    this.hitSound.currentTime = 0;
    this.hitSound.play();
  }
}
