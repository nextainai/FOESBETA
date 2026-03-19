constructor(scene, camera, input, charType) {
    this.camera = camera;
    this.input = input;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.canJump = false;
    this.health = 100;
    this.maxHealth = 100;
    
    // Set initial camera position ABOVE the ground
    this.camera.position.set(0, 2, 0);
    
    if(charType === 'speed') this.moveSpeed = 15;
    else if(charType === 'tank') { this.moveSpeed = 8; this.maxHealth = 150; this.health = 150; }
    else this.moveSpeed = 12;

    // Improved weapon model (more detailed)
    const weaponGroup = new THREE.Group();
    
    // Main body
    const bodyGeo = new THREE.BoxGeometry(0.15, 0.2, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a3a,
        roughness: 0.3,
        metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    weaponGroup.add(body);
    
    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.2,
        metalness: 0.9
    });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.45);
    weaponGroup.add(barrel);
    
    // Sight/Scope
    const sightGeo = new THREE.BoxGeometry(0.08, 0.08, 0.15);
    const sightMat = new THREE.MeshStandardMaterial({ 
        color: 0xff4655,
        emissive: 0xff4655,
        emissiveIntensity: 0.3
    });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0, 0.15, -0.1);
    weaponGroup.add(sight);
    
    // Magazine
    const magGeo = new THREE.BoxGeometry(0.12, 0.25, 0.15);
    const magMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.4
    });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0, -0.15, 0.1);
    weaponGroup.add(mag);

    this.weaponMesh = weaponGroup;
    this.weaponMesh.position.set(0.3, -0.25, -0.6);
    this.camera.add(this.weaponMesh);
    scene.add(this.camera);

    // Player hitbox
    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 1),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    this.mesh.position.y = 1.5;
    scene.add(this.mesh);
}
