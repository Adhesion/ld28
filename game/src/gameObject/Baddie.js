function Baddie(pos, size, note) {
    //
    this.target = new GameObject();
    this.note = note;
    this.type = note % 5;
    this.shape = Math.floor(note / 5);

    this.size = size;
    this.score = Math.round(this.size);

    this.child = null;
    this.active = true;
    this.slowed = false;

    this.deathTimer = -1;

    var color;
    switch(this.type){
        case 0:
            //red
            color = 0xf53d54;
            break;
        case 1:
            //green
            color = 0x04bf9d;
            break;
        case 2:
            //blue
            color = 0x2e6fac;
            break;
        case 3:
            //yellow
            color = 0xf2e85c;
            break;
        case 4:
            //purpp
            color = 0x9572c0;
            break;
    }

    var geom;
    var s = 1;

    switch(this.shape){
        case 0:
            //geom = new THREE.TetrahedronGeometry(this.size);
            geom = window.main.loader.get("assets/models/diamond.js");
            break;
        case 1:
            //geom = new THREE.CubeGeometry(this.size, this.size, this.size, 1);
            geom = window.main.loader.get("assets/models/tritorus.js");
             s = 0.75;
            break;
        case 2:
            //geom = new THREE.OctahedronGeometry(this.size, 1)
            geom = window.main.loader.get("assets/models/xena.js");
            s = 1.5;
            break;
    }
    GameObject.call(this, geom, color, color);

    this.objectScale = this.size/5 * s;
    this.solid.scale = new THREE.Vector3(this.objectScale, this.objectScale, this.objectScale);
    this.wire.scale = new THREE.Vector3(this.objectScale, this.objectScale, this.objectScale);

    this.linkMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    var linkGeom = new THREE.Geometry();
    linkGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    linkGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.link = new THREE.Line(linkGeom, this.linkMat, THREE.LineStrip);

    this.pos = pos;
    this.hp = 1;
    this.fire = false;
    this.speed = 150;

    this.update(0);

    this.rotation.x = Math.random() * Math.PI * 2;
    this.rotation.y = Math.random() * Math.PI * 2;
    this.rotation.z = Math.random() * Math.PI * 2;
}

Baddie.prototype = new GameObject();
Baddie.prototype.constructor = Baddie;

Baddie.prototype.linkChild = function (baddie) {
    this.child = baddie;
    this.child.disable();
    this.holder.add(this.link);
};

Baddie.prototype.disable = function () {
    this.active = false;
    this.solid.scale = new THREE.Vector3(this.objectScale * 0.5, this.objectScale * 0.5, this.objectScale * 0.5);
};

Baddie.prototype.enable = function () {
    this.active = true;
    this.solid.scale = new THREE.Vector3(this.objectScale * 1.0, this.objectScale * 1.0, this.objectScale * 1.0);
};

Baddie.prototype.update = function (dt) {
    this.seekTarget();

    if( this.deathTimer > -1 ) {
        this.timeMult = 0.075;
        this.deathTimer--;
    }
    else if(this.slowed){
        this.timeMult = 0.4;
    }else{
        this.timeMult = 1.0;
    }

    // deathtimer case is for delayed death - enemies in chains
    if( this.deathTimer == 0 ) {
        this.alive = false;
        window.hitSounds[this.note].play();
        window.main.state.goController.spawnChainParticles(this);
        console.log( "delayed death" );
    }

    GameObject.prototype.update.call(this, dt);

    this.rotation.x += 0.025;
    this.rotation.y += 0.025;

    if(this.child != null){

        this.holder.remove(this.link);

        if(this.child.alive){
            var dv = new THREE.Vector3();
            dv.subVectors(this.child.pos, this.pos);


            var linkGeom = new THREE.Geometry();
            linkGeom.vertices.push(new THREE.Vector3(0, 0, 0));
            linkGeom.vertices.push(dv);
            this.link = new THREE.Line(linkGeom, this.linkMat, THREE.LineStrip);
            this.holder.add(this.link);
        }else{
            this.child = null;
        }
    }
};

Baddie.prototype.hit = function (damage, chain) {
    if (this.hp -damage <= 0){
        if(this.child != null && !this.child.active){
            this.disable();
            this.child.enable();
            this.solidMat.opacity = 0;
            return;
        }
        else if( chain && this.child == null ) {
            this.disable();
            this.solidMat.opacity = 0;
            return;
        }
    }

    // buh? this might never get called
    GameObject.prototype.hit.call(this, damage);
};

Baddie.prototype.seekTarget = function () {
   if(this.target == null )return;

    var dv = new THREE.Vector3();
   dv.subVectors(this.target.pos, this.pos);
   dv.setLength(this.speed);

   this.vel = dv;
};

