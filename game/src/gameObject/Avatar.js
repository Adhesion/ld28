function Avatar(tube) {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xff0000,
		doubleSided: true,
	});
	this.speed = 300;
	this.tube = tube;
	this.pos.z -= 100;
	this.vel.x = 0;
	this.vel.z = 0;
	this.vel.y = this.speed/10000;
	this.tubeIndex = 0;
	this.direction = new THREE.Vector3(0,0,0);
}

Avatar.prototype = Object.create(GameObject.prototype);
Avatar.prototype.constructor = Avatar;

Avatar.prototype.update = function (delta) {
	GameObject.prototype.update.call(this, delta);
	var dt = delta/1000;

	this.focus = this.tube.path[this.tubeIndex],
	this.direction.subVectors(
		this.focus,
		this.holder.position
	);

	if(this.direction.length() <= this.speed * dt ){
		this.tubeIndex++;
		if(this.tubeIndex >= this.tube.path.length){
			this.tubeIndex= 0;
			this.pos.x = this.pos.y = this.pos.z = 0;
		}
	}

	this.direction.normalize();
	this.pos.x += this.direction.x * this.speed * dt;
	this.pos.y += this.direction.y * this.speed * dt;
	this.pos.z += this.direction.z * this.speed * dt;
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

	// left side
    geometry.vertices.push(new THREE.Vector3(w, -h * .25, 0));
    geometry.vertices.push(new THREE.Vector3(0, h, 0));
    geometry.vertices.push(new THREE.Vector3(-w, -h * 0.25, d));


    geometry.faces.push(
		new THREE.Face3(0, 1, 2,
			new THREE.Vector3( 0, 0, 1 )
		),
		new THREE.Face3(3, 4, 5,
			new THREE.Vector3( 0, 0, 1 )
		),
		new THREE.Face3(6, 7, 8,
			new THREE.Vector3( 0, 0, 1 )
		)

	);

    geometry.computeBoundingSphere();


    return geometry;
};
