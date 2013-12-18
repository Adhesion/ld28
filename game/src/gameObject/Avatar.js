function Avatar(tube, input, pathObjects) {

    var geometry = this.buildMesh();

    this.pos = new THREE.Vector3(0, 0, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);


    var materials = [
        new THREE.MeshBasicMaterial({ color:0xdbd14c, wireframe:false, shading: THREE.FlatShading }),
        new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    this.mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    this.mesh.scale.set( 30, 30, 30);
    this.mesh.rotation.x = Math.PI * 0.45;
    this.mesh.rotation.y = Math.PI * 0.5;

    this.meshHolder = new THREE.Object3D();
    this.meshHolder.add(this.mesh);

    this.sway = 0;

    this.holder = new THREE.Object3D();
    this.holder.add(this.meshHolder);

    this.timeMult = 1;
    this.alive = true;

	this.pathObjects = pathObjects;
	this.input = input;
	this.movementAmplitude = 110;
    this.collectRange = 50;
    this.lastRoom=false;

    // TODO Maybe have a debug mode toggle come in here?
	if( true ) {
        //this.meshHolder.add( circle( 0x0fffff, this.collectRange ) );

	}

    this.ring = circle( 0xffffff, this.movementAmplitude );
    //this.holder.add( this.ring );


    this.wasdSpeed = 220;
	this.speed = 500;
	this.tube = tube;
	this.pos.z -= 100;
	this.vel.x = 0;
	this.vel.z = 0;
	this.vel.y = 0;
	this.tubeIndex = 1;
	this.direction = new THREE.Vector3(0,0,0);
	this.controlVel = new THREE.Vector3();
    this.worldControlVel = new THREE.Vector3(0,0,0);
	this.focus = new THREE.Vector3();
	this.holder.up = new THREE.Vector3(0,0,1);
	this.worldPosition = new THREE.Vector3();
	this.following = [];

    this.scoreTick =0;
    this.beatTick = 0;
}


function circle( color, amplitude ) {
	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial({
		color: color,
		opacity: 0.5
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
			e.colorMat.transparent = true;
			e.colorMat.opacity = .8;
			self.speed += 20;

            // pickup sound - find position of pickup in cam coords for THREE D SOUNDS WOW
            var camPos= new THREE.Vector3;
            camPos.copy( e.pos );
            camPos.applyProjection( window.main.state.camera.matrixWorldInverse );
            // div by 100 because cam coords are roughly that range, pan should be -1 to 1ish or else it'll get too quiet i think?
            window.main.loader.get("sound/pickup" + e.soundType).pos3d(camPos.x/100.0, camPos.y/100.0, -0.5).play();
		}
	});

	for( var i=0; i<remove.length; i++){
		this.pathObjects.splice( this.pathObjects.indexOf(remove[i]), 1);
	}
}

Avatar.prototype.onBeat = function () {

    if(this.beatTick == 0){

        this.mesh.children[0].scale.set(1.05,1.05,1.05);
        new TWEEN.Tween(this.mesh.children[0].scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();

        this.beatTick = 1;
    }else{

        this.mesh.children[1].scale.set(1.5,1.5,1.5);
        new TWEEN.Tween(this.mesh.children[1].scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();

        this.beatTick = 0;
    }

    for( var i=0; i<this.following.length; i++){
        this.following[i].onBeat();
    }
}

Avatar.prototype.update = function (delta) {
	// Update positions, etc, should prolly go at the end, but it isn't a big
	// deal.
	this.checkPathObjects(delta);
    if(!this.alive) {
		return;
	}

    if(this.tubeIndex > this.tube.path.length - this.tube.lastRoom && !this.lastRoom){
        this.movementAmplitude = 1000;
        this.lastRoom = true;
        //this.holder.remove( this.ring );
    }

    if(this.lastRoom){
        //this.speed += dt;
        //if(this.speed > 1000) this.speed = 1000;
    }

	var dt = delta/1000;

    this.scoreTick -= dt;
    if(this.scoreTick < 0){
        this.scoreTick = 0.05;
        window.main.state.uiController.addScore(1 + this.following.length);
    }

    var m = 1;
    var moved = false;
	// Update inputs
	if( this.input.w || this.input.up ) {
		this.controlVel.y += this.wasdSpeed * dt * m;
        moved = true;
	}
	if( this.input.s || this.input.down ) {
		this.controlVel.y -= this.wasdSpeed  * dt * m;
        moved = true;
    }
	if( this.input.d || this.input.right ) {
		this.controlVel.x -= this.wasdSpeed  * dt * m;
        moved = true;
    }
	if( this.input.a || this.input.left ) {
		this.controlVel.x += this.wasdSpeed  * dt * m;
        moved = true;
    }

    //apply friction to controlVel.
    //if(!moved)
    this.controlVel.multiplyScalar(0.5);

	if( this.controlVel.length() > this.wasdSpeed) {
		this.controlVel.normalize().multiplyScalar(this.wasdSpeed);
	}

    this.meshHolder.position.add( this.controlVel );
    this.worldControlVel.x = this.controlVel.x;
    this.worldControlVel.y = this.controlVel.z;
    this.worldControlVel.z = this.controlVel.y;


    if( this.meshHolder.position.length() > this.movementAmplitude) {
        this.meshHolder.position.normalize().multiplyScalar(this.movementAmplitude);
    }

    this.worldPosition.copy(this.holder.position);
    this.worldPosition.x -= this.meshHolder.position.x;
    this.worldPosition.y += this.meshHolder.position.z;
    this.worldPosition.z += this.meshHolder.position.y;


	if(this.pos.y > this.focus.y ){
		this.tubeIndex++;

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

    this.sway += dt* 3;
    if(this.sway > Math.PI*2) this.sway -= Math.PI*2;

    this.mesh.position.y = Math.sin(this.sway) * 4;
    this.mesh.rotation.z = Math.cos(this.sway) * 0.1;

    this.meshHolder.rotation.x = this.controlVel.y * -0.1;
    this.meshHolder.rotation.z = this.controlVel.x * -0.1;
    //this.wire.rotation.y = this.controlVel.x * 0.1;

    this.checkWorldCollision();
	GameObject.prototype.update.call(this, delta);
};

Avatar.prototype.checkWorldCollision = function () {
    if(!this.alive) return;

    //avatar vs pillars.
    var origin = new THREE.Vector3().copy(this.worldPosition),
        direction = new THREE.Vector3().copy(this.vel).add(this.worldControlVel),
        ray = new THREE.Raycaster(origin, direction);

    ray.near = 1;
    ray.far = 1000;
    var collisionResults = ray.intersectObjects(this.tube.objects, true);
    if(collisionResults.length!==0){
        //console.log('Ray collides with mesh. Distance :' + collisionResults[0].distance);
        for( var i=0; i<collisionResults.length; i++){
            if( collisionResults[i].distance < 20){
                var bossHit = false;
                var objects = this.tube.endRoom.objects;
                for( var j=0; j<objects.length; j++){

                    if( collisionResults[i].object == objects[j].mesh.children[0] ){
                        objects[j].hitByAvatar(this);
                        window.main.loader.get("sound/bossdeath").play();
                        break;
                    }
                }

                if(!bossHit)window.main.loader.get("sound/death").play();
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
