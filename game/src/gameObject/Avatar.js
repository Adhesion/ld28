function Avatar(tube, input, pathObjects ) {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xff0000,
		doubleSided: true
	});

	this.input = input;
	this.movementAmplitude = 75;
	this.pathObjects = pathObjects;

	// TODO Maybe have a debug mode toggle come in here?
	if( true ) {
		this.wire.add( circle( 0x0fffff, 25 ) )
		this.holder.add( circle( 0xffffff, this.movementAmplitude ) )
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
	this.worldPosition = new THREE.Vector3();
	this.following = [];
}

function circle( color, amplitude ) {
	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial({
		color: color,
		opacity: 1.0
	});
	var resolution = 100;
	var size = 360 / resolution;
	for(var i = 0; i <= resolution; i++) {
		var segment = ( i * size ) * Math.PI / 180;
		geometry.vertices.push(
			new THREE.Vector3(
				Math.cos( segment ) * amplitude,
				0,
				Math.sin( segment ) * amplitude
			)
		);
	}
	return new THREE.Line( geometry, material );
}

Avatar.prototype = Object.create(GameObject.prototype);
Avatar.prototype.constructor = Avatar;

Avatar.prototype.checkPathObjects = function(delta) {
	var self = this;

	// Update the known followers
	this.following.forEach(function(e) {
		e.update(delta);
	});

	// Find any new followers and remove them from the global list.
	var remove = [];
	this.pathObjects.forEach(function(e) {
		var dist = e.holder.position.distanceTo( self.worldPosition );
		if( dist < 25 ) {
			// move the path object to this avatar
			self.following.push( e );
			remove.push( e );
			e.activate(self);
		}
	});

	for( var i=0; i<remove.length; i++){
		this.pathObjects.splice( this.pathObjects.indexOf(remove[i]), 1);
	}
}

Avatar.prototype.update = function (delta) {
	GameObject.prototype.update.call(this, delta);
	var dt = delta/1000;

	this.worldPosition.copy(this.holder.position).add(this.wire.position);

	this.checkPathObjects(delta);

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
