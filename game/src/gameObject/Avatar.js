function Avatar(tube, input, pathObjects) {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xff0000,
		doubleSided: true
	});

	this.wire.rotateOnAxis( new THREE.Vector3( 1, 1, 0), Math.PI / 2);
	this.wire.scale.set( 10, 10, 10);
	this.pathObjects = pathObjects;
	this.input = input;
	this.movementAmplitude = 100;
    this.collectRange = 50;

    // TODO Maybe have a debug mode toggle come in here?
	if( false ) {
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
	var c = new THREE.Color( 0xff0000 ).lerp( new THREE.Color(0xffffff), self.following.length / self.tubeIndex );
	this.following.forEach(function(e) {
		e.update(delta);
		e.wireMat.color = c;
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
			e.wireMat.transparent = true;
			e.wireMat.opacity = .8;
			self.speed += 20;

            // pickup sound
            window.main.loader.get("sound/pickup" + e.soundType).play();
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


    if(this.tubeIndex > this.tube.path.length - this.tube.lastRoom){
        this.movementAmplitude = 2000;
        this.wasdSpeed = 300;
    }

	var dt = delta/1000;


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

    // TODO temp shit, remove this
    if( this.input.z ) {
        window.main.fadeToSong("ld28-intro");
    }
    if( this.input.x ) {
        window.main.fadeToSong("ld28-game");
    }
    if( this.input.c ) {
        window.main.fadeToSong("ld28-open");
    }
    if( this.input.v ) {
        window.main.fadeToSong("ld28-boss");
    }
    if( this.input.b ) {
        window.main.loader.get("sound/bossdeath").play();
    }
    if( this.input.n ) {
        window.main.loader.get("sound/death").play();
    }

	if( this.controlVel.length() > this.wasdSpeed) {
		this.controlVel.normalize().multiplyScalar(this.wasdSpeed);
	}

    this.wire.position.add( this.controlVel );

    if( this.wire.position.length() > this.movementAmplitude) {
        this.wire.position.normalize().multiplyScalar(this.movementAmplitude);
    }

    this.worldPosition.copy(this.holder.position);
    this.worldPosition.x -= this.wire.position.x;
    this.worldPosition.y += this.wire.position.z;
    this.worldPosition.z += this.wire.position.y;

    //apply friction to controlVel.
    this.controlVel.multiplyScalar(0.5);

	if(this.pos.y > this.focus.y ){
		this.tubeIndex++;
		window.main.state.uiController.addScore(1* this.following.length);
		if(this.tubeIndex >= this.tube.path.length){
			//this.tubeIndex= 0;
			//this.pos.x = this.pos.y = this.pos.z = 0;
            this.tubeIndex = this.tube.path.length-1;
            this.alive = false;
		}
	}

	this.focus.copy( this.tube.path[this.tubeIndex] );
	this.direction.subVectors( this.focus, this.pos )
		.multiplyScalar( this.speed * dt * 0.01 );

    this.vel.add( this.direction );
    //this.vel.add( this.controlVel );

	if(this.vel.length() > this.speed){
		this.vel.normalize();
		this.vel.multiplyScalar(this.speed);
	}


    var lookAt = new THREE.Vector3().copy(this.pos).add(this.vel);

    this.holder.lookAt(lookAt);

    this.checkWorldCollision();
	GameObject.prototype.update.call(this, delta);
};

Avatar.prototype.checkWorldCollision = function () {
    //avatar vs pillars.
    var origin = new THREE.Vector3().copy(this.worldPosition),
        direction = new THREE.Vector3().copy(this.vel),
        ray = new THREE.Raycaster(origin, direction);

    ray.near = 1;
    ray.far = 1000;
    var collisionResults = ray.intersectObjects(this.tube.objects, true);
    if(collisionResults.length!==0){
        //console.log('Ray collides with mesh. Distance :' + collisionResults[0].distance);
        for( var i=0; i<collisionResults.length; i++){
            if( collisionResults[i].distance < 20){
                this.alive = false;
                this.speed = 0;
                return;
            }
        }
    }
}

Avatar.prototype.buildMesh = function () {
	var logo = window.main.loader.get("assets/models/player.js");

	return logo;
};
