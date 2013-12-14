function PathObject(p) {
    GameObject.call(this, {
		geometry: new THREE.CubeGeometry(10,10,10,1,1,1),
		color: 0xff0000,
		wireColor: 0xff0000
	});
    this.pos.x = p.x;
    this.pos.y = p.y;
    this.pos.z = p.z;

    this.life = 5.0;
    this.alive = true;
}

PathObject.prototype = Object.create(GameObject.prototype);
PathObject.prototype.constructor = PathObject;

PathObject.prototype.update = function (delta) {
    GameObject.prototype.update.call(this, delta);
    var dt = delta/1000;
    this.life -= dt;
    if(this.life < 0 && this.alive){
        //console.log(this.life);
        this.alive = false;
    }

   this.rotation.x += dt;
   this.rotation.y += dt;
   this.rotation.z += dt;
};
