export default class Bot {
  constructor(scene) {
    this.health = 50;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1,2,1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );

    this.mesh.position.set(
      Math.random()*20-10,
      1,
      Math.random()*20-10
    );

    this.lastShot = 0;

    scene.add(this.mesh);
  }

  update(player) {
    const target = player.camera.position;

    this.mesh.lookAt(target);

    // move
    this.mesh.position.x += (target.x - this.mesh.position.x) * 0.01;
    this.mesh.position.z += (target.z - this.mesh.position.z) * 0.01;

    // attack
    if (Date.now() - this.lastShot > 1000) {
      this.lastShot = Date.now();

      const dist = this.mesh.position.distanceTo(target);
      if (dist < 10) {
        player.health -= 5;
      }
    }
  }
}
