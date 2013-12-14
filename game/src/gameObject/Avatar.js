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
                    Math.sin( segment ) * this.movementAmplitude,
					0
				)
			);
		}

		this.holder.add( new THREE.Line( geometry, material ) )
	}

    this.wasdSpeed = 100;
	this.speed = 800;
	this.tube = tube;
	this.pos.z -= 100;
	this.vel.x = 0;
	this.vel.z = 0;
	this.vel.y = 0;
	this.tubeIndex = 1;
	this.direction = new THREE.Vector3(0,0,0);
	this.controlVel = new THREE.Vector3();
	this.focus = new THREE.Vector3();
    this.holder.up = new THREE.Vector3(0,0,1);
}

Avatar.prototype = Object.create(GameObject.prototype);
Avatar.prototype.constructor = Avatar;

Avatar.prototype.update = function (delta) {
	GameObject.prototype.update.call(this, delta);
	var dt = delta/1000;

	if( this.input.w || this.input.up ) {
		this.controlVel.y += this.wasdSpeed * dt;
	}
	if( this.input.s || this.input.down ) {
		this.controlVel.y -= this.wasdSpeed  * dt;
	}
	if( this.input.d || this.input.right ) {
		this.controlVel.x -= this.wasdSpeed  * dt;
	}
	if( this.input.a || this.input.left ) {
		this.controlVel.x += this.wasdSpeed  * dt;
	}

	if( this.controlVel.length() > this.wasdSpeed) {
		this.controlVel.normalize().multiplyScalar(this.wasdSpeed);
	}

    this.wire.position.add( this.controlVel );

    if( this.wire.position.length() > this.movementAmplitude) {
        this.wire.position.normalize().multiplyScalar(this.movementAmplitude);
    }


    //apply friction to controlVel.
    this.controlVel.multiplyScalar(0.5);

	if(this.pos.y > this.focus.y ){
		this.tubeIndex++;
		if(this.tubeIndex >= this.tube.path.length){
			this.tubeIndex= 0;
			this.pos.x = this.pos.y = this.pos.z = 0;
		}
	}

	this.focus.copy( this.tube.path[this.tubeIndex] );
	this.direction.subVectors( this.focus, this.pos )
		.multiplyScalar( this.speed * dt * 0.01 );

    this.vel.add( this.direction );
    this.vel.add( this.controlVel );

	if(this.vel.length() > this.speed){
		this.vel.normalize();
		this.vel.multiplyScalar(this.speed);
	}


    var lookAt = new THREE.Vector3().copy(this.pos).add(this.vel);

    this.holder.lookAt(lookAt);
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
