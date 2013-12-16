function EndRoomObject( type, pos ) {

    this.pos = pos;
    this.vel = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);

    var geometry;
    switch(type){
        case"brick":
            geometry = window.main.loader.get("assets/models/brick.js");
            break;
        case"bomb":
            geometry = window.main.loader.get("assets/models/bomb.js");
            break;
        case"gem":
            geometry = window.main.loader.get("assets/models/gem.js");
            break;
    }

    this.color = 0xffffff;

    var materials = [
        new THREE.MeshBasicMaterial({ color:0xff0000, wireframe:false, shading: THREE.FlatShading }),
        new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];
    this.size = 200;
    this.mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    this.mesh.scale.set(this.size, this.size, this.size);
    this.mesh.position.copy(pos);

    this.active = false;

    this.collided = false;
    this.timeMult = 1;
    this.alive = true;
    this.toTarget = new THREE.Vector3();
}

EndRoomObject.prototype.hitByAvatar = function (avatar) {
    this.toTarget.copy(avatar.pos).sub(this.pos);
    this.toTarget.normalize();
    this.toTarget.multiplyScalar( avatar.vel.length() );

    window.main.state.uiController.addScore(Math.floor( this.toTarget.length() ));

    this.vel.add( this.toTarget );
}

EndRoomObject.prototype.checkCollision = function (obj) {

    //only allow one collision per update.
    //if(this.collided)return false;
    this.toTarget.copy(obj.pos).sub(this.pos);

    if(this.toTarget.length() < this.size){

        var n =1+Math.round(Math.random()*4);
        window.main.loader.get("sound/hit" + n ).play();
        this.collided = true;
        obj.collided = true;
        this.toTarget.normalize();
        this.toTarget.multiplyScalar(this.size);
        obj.pos.copy(this.pos);
        obj.pos.add(this.toTarget);
        obj.vel.add(this.vel);


        this.toTarget.normalize();
        this.toTarget.multiplyScalar(this.vel.length() * -0.8);
        this.vel.copy(this.toTarget);


        window.main.state.uiController.addScore(Math.floor( this.vel.length()* 0.25 ));


        return true;
    }

    return false;
}

EndRoomObject.prototype.update = function (delta) {
    this.collided = false;
    var dt = delta/1000;

    if(this.vel.length > 1000){
        this.vel.normalize();
        this.vel.multiplyScalar(1000);
    }

    this.pos.x += this.vel.x * dt * this.timeMult;
    this.pos.y += this.vel.y * dt * this.timeMult;
    this.pos.z += this.vel.z * dt * this.timeMult;

    var x = 2000 - this.size * 0.5;
    var y = 8000 - this.size * 0.5;
    var z = 1000 - this.size * 0.5;

    if(this.pos.x > x)   { this.pos.x = x;    this.vel.x *= -0.2; }
    if(this.pos.x < -x)  { this.pos.x = -x;   this.vel.x *= -0.2; }

    if(this.pos.y > y)   { this.pos.y = y;    this.vel.y *= -0.2; }
    if(this.pos.y < -y)  { this.pos.y = -y;   this.vel.y *= -0.2; }

    if(this.pos.z > z)   { this.pos.z = z;    this.vel.z *= -0.2; }
    if(this.pos.z < -z)  { this.pos.z = -z;   this.vel.z *= -0.2; }

    this.mesh.rotation.y += this.vel.x * dt * this.timeMult * 0.001;
    this.mesh.rotation.z += this.vel.y * dt * this.timeMult * 0.001;
    this.mesh.rotation.x += this.vel.z * dt * this.timeMult * 0.001;

    this.mesh.position.copy(this.pos);


};
