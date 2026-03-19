setupLights() {
    // Brighter ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Main directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    // Add point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 50);
    pointLight1.position.set(-30, 10, -30);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 50);
    pointLight2.position.set(30, 10, 30);
    this.scene.add(pointLight2);
}

setupMap() {
    // Brighter floor with grid texture effect
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a3a, 
        roughness: 0.4,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Add grid helper for Rivals-style look
    const gridHelper = new THREE.GridHelper(200, 50, 0x00ffff, 0x444444);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Create colorful obstacles (Rivals style)
    const colors = [0xff4655, 0x00d4ff, 0xffd700, 0x9d00ff, 0x00ff88];
    
    for (let i = 0; i < 30; i++) {
        const type = Math.floor(Math.random() * 3);
        let geometry, material, mesh;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        material = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.3,
            metalness: 0.5,
            emissive: color,
            emissiveIntensity: 0.2
        });

        if (type === 0) {
            // Box
            geometry = new THREE.BoxGeometry(4, 4, 4);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 2;
        } else if (type === 1) {
            // Cylinder
            geometry = new THREE.CylinderGeometry(2, 2, 6, 8);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 3;
        } else {
            // Tall pillar
            geometry = new THREE.BoxGeometry(2, 10, 2);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 5;
        }

        mesh.position.x = (Math.random() * 80) - 40;
        mesh.position.z = (Math.random() * 80) - 40;
        
        // Keep center area clear for spawn
        if (mesh.position.distanceTo(new THREE.Vector3(0, 0, 0)) < 10) {
            mesh.position.x += 15;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
    }

    // Add boundary walls
    const wallMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.5
    });
    
    const wallHeight = 8;
    const wallThickness = 2;
    
    // North wall
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(100, wallHeight, wallThickness), wallMat);
    northWall.position.set(0, wallHeight/2, -50);
    northWall.receiveShadow = true;
    this.scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(100, wallHeight, wallThickness), wallMat);
    southWall.position.set(0, wallHeight/2, 50);
    southWall.receiveShadow = true;
    this.scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 100), wallMat);
    eastWall.position.set(50, wallHeight/2, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 100), wallMat);
    westWall.position.set(-50, wallHeight/2, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);
}
