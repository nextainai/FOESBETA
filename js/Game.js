import Player from "./Player.js";
import InputHandler from "./InputHandler.js";
import Weapon from "./Weapon.js";
import Bot from "./Bot.js";
import UIManager from "./UIManager.js";
import AudioManager from "./AudioManager.js";

export default class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.input = new InputHandler(camera);
    this.player = new Player(camera, this.input);

    this.weapons = {
      rifle: new Weapon("rifle"),
      pistol: new Weapon("pistol")
    };

    this.currentWeapon = this.weapons.rifle;

    this.ui = new UIManager();
    this.audio = new AudioManager();

    this.raycaster = new THREE.Raycaster();

    this.bots = [];
    for (let i = 0; i < 6; i++) {
      this.bots.push(new Bot(scene));
    }

    this.createArena();
    this.addLights();

    document.addEventListener("click", () => this.shoot());

    document.addEventListener("keydown", e => {
      if (e.key === "r") this.currentWeapon.reload();
      if (e.key === "1") this.currentWeapon = this.weapons.rifle;
      if (e.key === "2") this.currentWeapon = this.weapons.pistol;
    });
  }

  createArena() {
    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);

    // cover blocks
    for (let i = 0; i < 10; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(3,2,3),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );

      box.position.set(
        Math.random()*40-20,
        1,
        Math.random()*40-20
      );

      this.scene.add(box);
    }

    // mountain illusion
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(20, 30, 4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    mountain.position.set(-30, 15, -30);
    this.scene.add(mountain);
  }

  addLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 30, 10);
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0x404040));
  }

  shoot() {
    if (!this.currentWeapon.shoot(this.camera)) return;

    this.audio.playShoot();

    this.raycaster.setFromCamera({x:0,y:0}, this.camera);

    this.bots.forEach(bot => {
      const hit = this.raycaster.intersectObject(bot.mesh);

      if (hit.length > 0) {
        bot.health -= this.currentWeapon.damage;

        this.audio.playHit();
        this.ui.hitMarker();

        if (bot.health <= 0) {
          bot.mesh.position.set(
            Math.random()*20-10,1,Math.random()*20-10
          );
          bot.health = 50;
        }
      }
    });
  }

  update() {
    this.player.update();

    this.bots.forEach(bot => bot.update(this.player));

    if (this.player.health <= 0) {
      alert("You Died!");
      location.reload();
    }

    this.ui.update(this.player, this.currentWeapon);
  }
}
