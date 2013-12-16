function PathObject(p, tube) {
    var geometry = this.buildMesh();

    this.pos = new THREE.Vector3().copy(p);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);


    var materials = [
        new THREE.MeshBasicMaterial({ color:0xff0000, wireframe:false, shading: THREE.FlatShading }),
        new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    this.wireMat = materials[0];
    this.colorMat = materials[1];

    this.wire = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    this.wire.scale.set( 10, 10, 10);

    this.sway = 0;

    this.holder = new THREE.Object3D();
    this.holder.add(this.wire);

    this.timeMult = 1;
    this.alive = true;

    this.life = 5.0;
    this.alive = true;
    this.speed = 500;
    this.speedMultiplier = 2.5 + Math.random()*2.5;

    this.beatTick = 0
}

PathObject.prototype = Object.create(GameObject.prototype);
PathObject.prototype.constructor = PathObject;

PathObject.prototype.activate = function(target) {
	this.target = target;
    this.vel.copy(this.target.vel);
}

PathObject.prototype.update = function (delta) {
    GameObject.prototype.update.call(this, delta);
    var dt = delta/1000;
	if( this.target == null ) {
		this.life -= dt;
		if(this.life < 0 && this.alive){
			this.alive = false;
		}
	}
	else if( this.target.alive ) {
        var toTarget = new THREE.Vector3().subVectors(this.target.worldPosition, this.pos);

        toTarget.normalize();
        toTarget.multiplyScalar(  this.speed *  this.speedMultiplier  * dt );
        this.vel.add(toTarget);

        this.speed = this.target.speed + 4 * this.speedMultiplier;

        if(this.vel.length() > this.speed){
            this.vel.normalize();
            this.vel.multiplyScalar(this.speed);
        }

	}

   this.rotation.x += dt*5;
   this.rotation.y += dt*5;
   this.rotation.z += dt*5;

   this.wire.rotation.copy(this.rotation);

};


PathObject.prototype.onBeat = function () {

    if(this.beatTick == 0){

        this.wire.children[1].scale.set(1.2,1.2,1.2);
        new TWEEN.Tween(this.wire.children[1].scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();

        this.wire.children[0].scale.set(1.2,1.2,1.2);
        new TWEEN.Tween(this.wire.children[0].scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();

        this.beatTick = 1;
    }else{

        this.wire.children[1].scale.set(1.8,1.8,1.8);
        new TWEEN.Tween(this.wire.children[1].scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();

        this.beatTick = 0;
    }
}


PathObject.prototype.shootAtTarget = function (target) {
    var toTarget = new THREE.Vector3().subVectors(target, this.pos);
    toTarget.normalize();
    toTarget.multiplyScalar( this.vel.length() );
    this.vel.copy(toTarget);
}

PathObject.prototype.buildMesh = function () {
	var ps = [
		"gem",
		"brick",
		"bomb"
	];
    // Small hack to map to 5 sounds
    var j = Math.floor(Math.random()* 5);
	var i = j % ps.length;
	this[ps[i]] = true
    this.soundType= j + 1; // 0-4 -> 1-5
	return window.main.loader.get("assets/models/" + ps[i] + ".js");
}


