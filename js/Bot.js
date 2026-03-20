export default class Bot {
  constructor(scene) {
    this.health = 50;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );

    this.mesh.position.set(
      Math.random()*10-5,
      1,
      Math.random()*10-5
    );

    scene.add(this.mesh);
  }

  update(player) {
    this.mesh.lookAt(player.camera.position);

    // move toward player
    this.mesh.position.x += (player.camera.position.x - this.mesh.position.x) * 0.01;
    this.mesh.position.z += (player.camera.position.z - this.mesh.position.z) * 0.01;
  }
}
