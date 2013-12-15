function Avatar(tube, input, pathObjects) {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xff0000,
		doubleSided: true
	});

	this.pathObjects = pathObjects;
	this.input = input;
	this.movementAmplitude = 75;
    this.collectRange = 50;

    // TODO Maybe have a debug mode toggle come in here?
	if( true ) {
		this.wire.add( circle( 0x0fffff, this.collectRange ) )
		this.holder.add( circle( 0xffffff, this.movementAmplitude ) )
	}

    this.alive = true;

    this.wasdSpeed = 100;
	this.speed = 500;
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
                Math.sin( segment ) * amplitude,
				0
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
		if( dist < self.collectRange ) {
			// move the path object to this avatar
			self.following.push( e );
			remove.push( e );
			e.activate(self);
            self.speed += 20;
		}
	});

	for( var i=0; i<remove.length; i++){
		this.pathObjects.splice( this.pathObjects.indexOf(remove[i]), 1);
	}
}

Avatar.prototype.update = function (delta) {
	// Update positions, etc, should prolly go at the end, but it isn't a big
	// deal.
    if(!this.alive)return;

	GameObject.prototype.update.call(this, delta);
	var dt = delta/1000;

	this.worldPosition.copy(this.holder.position);
    this.worldPosition.x -= this.wire.position.x;
    this.worldPosition.y += this.wire.position.z;
    this.worldPosition.z += this.wire.position.y;

    this.checkPathObjects(delta);

	// Update inputs
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

    this.checkWorldCollision();
};

Avatar.prototype.checkWorldCollision = function () {
    //avatar vs pillars.
    var origin = new THREE.Vector3().copy(this.worldPosition),
        direction = new THREE.Vector3().copy(this.vel),
        ray = new THREE.Raycaster(origin, direction);

    ray.near = 1;
    ray.far = 300;
    var collisionResults = ray.intersectObjects(this.tube.objects);
    if(collisionResults.length!==0){
        //alert('Ray collides with mesh. Distance :' + collisionResults[0].distance)
        console.log('Ray collides with mesh. Distance :' + collisionResults[0].distance);
        for( var i=0; i<collisionResults.length; i++){
            if( collisionResults[i].distance < 10){
                this.alive = false;
                this.speed = 0;
                return;
            }
        }
    }
}

/*
 //Add Ray
 var origin = new THREE.Vector3(50, 0, 0),
 direction = new THREE.Vector3(-1,0,0),
 ray = new THREE.Raycaster(origin, direction),
 collisionResults = ray.intersectObjects([mesh]);
 if(collisionResults.length!==0){
 alert('Ray collides with mesh. Distance :' + collisionResults[0].distance)
 }

 */

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
