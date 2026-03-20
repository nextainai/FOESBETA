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

    this.weapon = new Weapon("rifle", camera);

    this.ui = new UIManager();
    this.audio = new AudioManager();

    this.raycaster = new THREE.Raycaster();

    this.isADS = false;

    this.bots = [];
    for (let i = 0; i < 6; i++) {
      this.bots.push(new Bot(scene));
    }

    this.createMap();
    this.addLights();

    this.setupControls();
  }

  setupControls() {
    document.addEventListener("click", () => this.shoot());

    document.addEventListener("contextmenu", e => {
      e.preventDefault();
      this.toggleADS(true);
    });

    document.addEventListener("mouseup", () => {
      this.toggleADS(false);
    });

    document.addEventListener("keydown", e => {
      if (e.key === "r") this.weapon.reload();
    });
  }

  toggleADS(state) {
    this.isADS = state;

    if (state) {
      this.camera.fov = 40;
      document.body.classList.add("ads");
    } else {
      this.camera.fov = 75;
      document.body.classList.remove("ads");
    }

    this.camera.updateProjectionMatrix();
  }

  createMap() {
    const texture = new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/terrain/grasslight-big.jpg"
    );

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10,10);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100,100),
      new THREE.MeshStandardMaterial({ map: texture })
    );

    floor.rotation.x = -Math.PI/2;
    this.scene.add(floor);

    // arena blocks
    for (let i = 0; i < 12; i++) {
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

    // mountains
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(20, 30, 6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    mountain.position.set(-40,15,-40);
    this.scene.add(mountain);
  }

  addLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20,30,10);
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0x404040));
  }

  shoot() {
    if (!this.weapon.shoot()) return;

    this.audio.playShoot();

    this.raycaster.setFromCamera({x:0,y:0}, this.camera);

    this.bots.forEach(bot => {
      const hit = this.raycaster.intersectObject(bot.mesh);

      if (hit.length > 0) {
        bot.health -= this.weapon.damage;

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

    const moving = this.input.keys["w"] || this.input.keys["a"] ||
                   this.input.keys["s"] || this.input.keys["d"];

    this.weapon.update(moving);

    this.bots.forEach(bot => bot.update(this.player));

    this.ui.update(this.player, this.weapon);
  }
}
