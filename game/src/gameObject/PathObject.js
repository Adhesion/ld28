function PathObject(p) {
    GameObject.call(this, {
		geometry: new THREE.CubeGeometry(10,10,10,1,1,1),
		color: 0xff0000,
		wireColor: 0xff0000
	});
    this.pos.x = p.x;
    this.pos.y = p.y;
    this.pos.z = p.z;
}

PathObject.prototype = Object.create(GameObject.prototype);
PathObject.prototype.constructor = PathObject;

PathObject.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);

   // this.rotation.x += dt;
    //this.rotation.y += dt;
    //this.rotation.z += dt;
};
