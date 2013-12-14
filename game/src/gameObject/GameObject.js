function GameObject(geometry, color, wireColor) {
    this.wireColor = wireColor ? wireColor : 0xffffff;
    this.color = color ? color : 0xffffff;

    this.pos = new THREE.Vector3(0, 0, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);

    this.solidMat = new THREE.MeshPhongMaterial( { color: this.color, transparent:true, shading: THREE.FlatShading  } );
    this.whiteMat = new THREE.MeshPhongMaterial({ color:0xffffff, transparent:true, shading: THREE.FlatShading  });

    this.wireMat = new THREE.MeshPhongMaterial({ color:this.wireColor, wireframe:true, shading: THREE.FlatShading  });

    this.wireMat.opacity = 0.75;
    this.wireMat.blending = THREE.AdditiveAlphaBlending;

    this.solid = new THREE.Mesh(geometry, this.solidMat);
    this.wire = new THREE.Mesh(geometry, this.wireMat);
    this.wire.scale = new THREE.Vector3(1.05, 1.05, 1.05);

    this.holder = new THREE.Object3D();
    this.holder.add(this.wire);
    this.holder.add(this.solid);

    this.hitCountMax = 2;
    this.hitCount = 0;

    this.hp = 1;
    this.size = 10;
    this.alive = true;
    this.timeMult = 1;
}

GameObject.prototype.update = function (dt) {

    if(!dt) dt = 0;

    this.pos.x += this.vel.x * dt * this.timeMult;
    this.pos.y += this.vel.y * dt * this.timeMult;
    this.pos.z += this.vel.z * dt * this.timeMult;

    this.holder.position = this.pos;

    this.solid.rotation = this.rotation;
    this.wire.rotation = this.rotation;

    if (this.hitCount > 0) {
        this.hitCount--;
        if (this.solid.material != this.whiteMat) {
            this.solid.material = this.whiteMat;
        }
    } else {
        if (this.solid.material != this.solidMat) {
            this.solid.material = this.solidMat;
        }
    }
};

GameObject.prototype.hit = function (damage) {
    this.hp -= damage;

    if (this.hitCount <= 0) this.hitCount = this.hitCountMax;

    if (this.hp <= 0) {
        this.hp = 0;
        this.alive = false;
    }else{
        this.pos.x += Math.random()*4-2;
        this.pos.y += Math.random()*4-2;
    }
};

GameObject.prototype.dispose = function () {
    //TODO: dispose meshes and materials
};