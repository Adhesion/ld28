function Avatar() {
    GameObject.call(this, this.buildMesh(), 0xf2e85c, 0xdbd14c);

    this.maxSpeed = 2;
    this.inputScale = 1;
    this.pos.y = -70;
    this.startHP = 5;
    this.hp = this.startHP;

    this.missfireActive = false;

    this.range = 100;
    this.rangeMat = new THREE.MeshPhongMaterial({ color:0xffffff, transparent:true, shading: THREE.FlatShading  });

    this.range2Mats = [
        new THREE.MeshPhongMaterial({ color:0xf53d54, transparent:true, shading: THREE.FlatShading  }) ,
        new THREE.MeshPhongMaterial({ color:0x04bf9d, transparent:true, shading: THREE.FlatShading  }),
        new THREE.MeshPhongMaterial({ color:0x2e6fac, transparent:true, shading: THREE.FlatShading  }),
        new THREE.MeshPhongMaterial({ color:0xf2e85c, transparent:true, shading: THREE.FlatShading  }),
        new THREE.MeshPhongMaterial({ color:0x9572c0, transparent:true, shading: THREE.FlatShading  })
    ];

    var rangeGeom = new THREE.TorusGeometry(this.range, 0.2, 4, 10);
    var range2Geom = new THREE.TorusGeometry(this.range-25, 30, 4, 10);

    this.rangeMesh = new THREE.Mesh(rangeGeom, this.rangeMat);

    this.range2Mesh = new THREE.Mesh(range2Geom, this.range2Mats[0]);
    this.range2Mesh.scale.z = 0.01;
    this.range2Mesh.z = 4;

    this.range2Mesh.material.opacity = 0;

    this.holder.add(this.range2Mesh);
    this.holder.add(this.rangeMesh);
}

Avatar.prototype = new GameObject();
Avatar.prototype.constructor = Avatar;

Avatar.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);

    if(this.missfireActive ){
        this.rangeMesh.material.opacity = 0.1;
        this.range2Mesh.material.opacity = 0.1;
    }else{
        this.rangeMesh.material.opacity = 1;
    }

    this.rangeMesh.rotation.z += dt * 0.25;
    this.range2Mesh.rotation.z += dt * 0.25;

    this.range2Mesh.scale.x += dt * 5;
    this.range2Mesh.scale.y += dt * 5;

    if(this.range2Mesh.scale.x > 1)this.range2Mesh.scale.x =1;
    if(this.range2Mesh.scale.y > 1)this.range2Mesh.scale.y =1;

    this.range2Mesh.material.opacity -=dt * 5;
    if(this.range2Mesh.material.opacity < 0) this.range2Mesh.material.opacity = 0;
};

Avatar.prototype.showRing = function (i) {
    this.range2Mesh.material = this.range2Mats[i];
    this.range2Mesh.material.opacity = 1;
    this.range2Mesh.scale.x =0.25;
    this.range2Mesh.scale.y =0.25;
};

Avatar.prototype.missfire = function (active) {
    this.missfireActive = active;
};

Avatar.prototype.fire = function () {
    var jitter = 2;
    this.pos.x += Math.random() * jitter - jitter * 0.5;
    this.pos.y += Math.random() * jitter - jitter * 0.5;
};

Avatar.prototype.move = function (v) {
    //this.vel.addSelf(v);
    this.vel.x += v.x * this.inputScale;
    this.vel.y += v.y * this.inputScale;
    if (this.vel.length > this.maxSpeed) {
        this.vel.normalize();
        this.vel.multiplyScalar(this.maxSpeed);
    }
};

Avatar.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    var w = 5;
    var h = 10;
    var d = 3;

    // right side
    geometry.vertices.push(new THREE.Vector3(w, -h * 0.25, -d));
    geometry.vertices.push(new THREE.Vector3(0, h, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    // left side
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, h, 0));
    geometry.vertices.push(new THREE.Vector3(-w, -h * 0.25, -d));


    geometry.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3( 0, 0, 1 )), new THREE.Face3(3, 4, 5, new THREE.Vector3( 0, 0, 1 )));

    geometry.computeBoundingSphere();


    return geometry;
};
