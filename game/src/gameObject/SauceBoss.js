function SauceBoss() {
    //
    this.target = new THREE.Vector3();
    this.size = 100;
    //GameObject.call(this, new THREE.OctahedronGeometry(this.size, 2), 0xff0000);
    GameObject.call(this,window.main.loader.get("assets/models/boss_body.js"), 0xf53d54, 0xf2e85c);
    this.holder.scale = new THREE.Vector3( 15.0, 15.0, 15.0 );

    this.linkMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    var linkGeom = new THREE.Geometry();
    linkGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    linkGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    this.link = new THREE.Line(linkGeom, this.linkMat, THREE.LineStrip);


    var sg = window.main.loader.get("assets/models/boss_spikes.js");
    var sm = new THREE.MeshPhongMaterial( { color: 0x04bf9d, shading: THREE.FlatShading  } );
    this.spikes = new THREE.Mesh(sg, sm);

    var rg1 = window.main.loader.get("assets/models/boss_thinRing.js");
    var rm1 = new THREE.MeshPhongMaterial( { color: 0x2e6fac, shading: THREE.FlatShading  } );
    this.ring1 = new THREE.Mesh(rg1, rm1);

    var rg2 = window.main.loader.get("assets/models/boss_fatRing.js");
    var rm2 = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading  } );
    this.ring2 = new THREE.Mesh(rg2, rm2);

    this.holder.add(this.spikes);
    this.holder.add(this.ring1);
    this.holder.add(this.ring2);

    this.pos = new THREE.Vector3();

    this.hp = this.startHP = 8;

    this.speed = 150;

    this.update(0);

    this.active = false;
}

SauceBoss.prototype = new GameObject();
SauceBoss.prototype.constructor = Baddie;

SauceBoss.prototype.appear = function (pos) {
    this.pos = pos;
    this.target = pos.clone();
    this.update(0);
};

SauceBoss.prototype.move = function (pos) {
    this.target = pos;
};

SauceBoss.prototype.disable = function () {
    // kinda shit
    // going to be called by
    // linked bullet when it 'links' to the boss.
};

SauceBoss.prototype.enable = function () {

};

SauceBoss.prototype.update = function (dt) {

    this.seekTarget(dt);

    this.rotation.x += 0.025;
    this.rotation.y += 0.025;

    this.ring1.rotation.y += 0.02;
    this.ring1.rotation.z -= 0.02;

    this.ring2.rotation.x -= 0.05;
    this.ring2.rotation.y -= 0.05;

    this.spikes.rotation.x += 0.025;
    this.spikes.rotation.z -= 0.025;

    GameObject.prototype.update.call(this, dt);
};

SauceBoss.prototype.hit = function (damage) {
    //something?

    // buh? this might never get called
    GameObject.prototype.hit.call(this, damage);
};

SauceBoss.prototype.seekTarget = function (dt) {
    if(this.target == null )return;

    var dv = new THREE.Vector3();
    dv.subVectors(this.target, this.pos);

    var l = this.speed;

    if( dv.length() < this.speed * dt){
        this.pos = this.target.clone();
        this.vel.setLength(0);
    }else{
        dv.setLength(this.speed);
        this.vel = dv;
    }

};

