import Player from "./Player.js";
import InputHandler from "./InputHandler.js";
import Weapon from "./Weapon.js";
import Bot from "./Bot.js";
import UIManager from "./UIManager.js";

export default class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.input = new InputHandler(camera);
    this.player = new Player(camera, this.input);
    this.weapon = new Weapon("rifle");
    this.ui = new UIManager();

    this.raycaster = new THREE.Raycaster();

    this.bots = [];
    for (let i = 0; i < 5; i++) {
      this.bots.push(new Bot(scene));
    }

    this.createArena();
    this.addLights();

    document.addEventListener("click", () => this.shoot());
    document.addEventListener("keydown", e => {
      if (e.key === "r") this.weapon.reload();
    });
  }

  createArena() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);

    // walls
    for (let i = 0; i < 4; i++) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(50, 5, 1),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );

      if (i === 0) wall.position.set(0,2.5,25);
      if (i === 1) wall.position.set(0,2.5,-25);
      if (i === 2) {
        wall.rotation.y = Math.PI/2;
        wall.position.set(25,2.5,0);
      }
      if (i === 3) {
        wall.rotation.y = Math.PI/2;
        wall.position.set(-25,2.5,0);
      }

      this.scene.add(wall);
    }
  }

  addLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    this.scene.add(ambient);
  }

  shoot() {
    if (!this.weapon.shoot()) return;

    this.raycaster.setFromCamera({x:0,y:0}, this.camera);

    this.bots.forEach(bot => {
      const hit = this.raycaster.intersectObject(bot.mesh);
      if (hit.length > 0) {
        bot.health -= this.weapon.damage;

        if (bot.health <= 0) {
          bot.mesh.position.set(
            Math.random()*10-5,1,Math.random()*10-5
          );
          bot.health = 50;
        }
      }
    });
  }

  update() {
    this.player.update();

    this.bots.forEach(bot => bot.update(this.player));

    this.ui.update(this.player, this.weapon);
  }
}
