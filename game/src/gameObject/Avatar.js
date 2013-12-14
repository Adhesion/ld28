function Avatar(tube, input) {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xff0000,
		doubleSided: true
	});

	this.input = input;
	this.movementAmplitude = 75;

	// TODO Maybe have a debug mode toggle come in here?
	if( true ) {
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial({
			color: 0xFFFFFF,
			opacity: 1.0
		});
		var resolution = 100;
		var size = 360 / resolution;
		for(var i = 0; i <= resolution; i++) {
			var segment = ( i * size ) * Math.PI / 180;
			geometry.vertices.push(
				new THREE.Vector3(
					Math.cos( segment ) * this.movementAmplitude,
					0,
					Math.sin( segment ) * this.movementAmplitude
				)
			);
		}

		this.holder.add( new THREE.Line( geometry, material ) )
	}

	this.speed = 800;
	this.tube = tube;
	this.pos.z -= 100;
	this.vel.x = 0;
	this.vel.z = 0;
	this.vel.y = 0;
	this.tubeIndex = 1;
	this.direction = new THREE.Vector3(0,0,0);
	this.controlOffset = new THREE.Vector3();
	this.focus = new THREE.Vector3();
}

Avatar.prototype = Object.create(GameObject.prototype);
Avatar.prototype.constructor = Avatar;

Avatar.prototype.update = function (delta) {
	GameObject.prototype.update.call(this, delta);
	var dt = delta/1000;

	if( this.input.w || this.input.up ) {
		this.controlOffset.z += this.movementAmplitude* dt;
	}
	if( this.input.s || this.input.down ) {
		this.controlOffset.z -= this.movementAmplitude * dt;
	}
	if( this.input.d || this.input.right ) {
		this.controlOffset.x += this.movementAmplitude * dt;
	}
	if( this.input.a || this.input.left ) {
		this.controlOffset.x -= this.movementAmplitude * dt;
	}

	var cl = this.controlOffset.length();
	if( cl > this.movementAmplitude) {
		this.controlOffset.normalize().multiplyScalar(this.movementAmplitude);
	}

	this.wire.position.copy( this.controlOffset );

	if(this.pos.y > this.focus.y ){
		this.tubeIndex++;
		if(this.tubeIndex >= this.tube.path.length){
			this.tubeIndex= 0;
			this.pos.x = this.pos.y = this.pos.z = 0;
		}
	}

	this.focus.copy( this.tube.path[this.tubeIndex] );
	this.focus.add( this.controlOffset );
	this.direction.subVectors( this.focus, this.pos )
		.multiplyScalar( this.speed * dt * 2 );
	this.vel.add( this.direction );

	if(this.vel.length() > this.speed){
		this.vel.normalize();
		this.vel.multiplyScalar(this.speed);
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
