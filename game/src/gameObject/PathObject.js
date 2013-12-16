function PathObject(p, tube) {
    GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xff0000,
		wireColor: 0xff0000
	});
	this.wire.scale.set( 10, 10, 10);
    //this.tube = tube;
    this.pos.x = p.x;
    this.pos.y = p.y;
    this.pos.z = p.z;

    this.avoid = null;
    this.life = 5.0;
    this.alive = true;
    this.speed = 500;
    this.speedMultiplier = 2.5 + Math.random()*2.5;
}

PathObject.prototype = Object.create(GameObject.prototype);
PathObject.prototype.constructor = PathObject;

PathObject.prototype.activate = function(target) {
	this.target = target;
    this.vel.copy(this.target.vel);
}

PathObject.prototype.avoid = function(target) {
    //todo: do this
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

        this.speed = this.target.speed + 70;

        if(this.vel.length() > this.speed){
            this.vel.normalize();
            this.vel.multiplyScalar(this.speed);
        }

        this.checkWallCollision();
	}

   this.rotation.x += dt*1;
   this.rotation.y += dt*1;
   this.rotation.z += dt*1;

   this.wire.rotation = this.rotation;

};

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

PathObject.prototype.checkWallCollision = function () {



}


