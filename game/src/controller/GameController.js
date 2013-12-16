function GameController(main, skybox) {

    //Howler.mute();

    this.main = main;
    this.skybox = skybox;
    this.input = new Input();

    this.camera = this.main.state.camera;
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.cameraTarget = new THREE.Vector3();
    this.camera.position.y = -100;

    this.camTarget = new THREE.Vector3();
    this.main.state.scene.add( this.camera );
    this.main.state.scene.add( new THREE.AmbientLight( 0x222222 ) );

    this.particles = [];
    this.pathObjects = [];

    this.nextChain = null;
    this.chain = [];

    this.spawnTimer = 0;

    this.isLastRoom = false;
    this.isGameOver = false;
    this.gameOverTimer = 1;

    this.main.state.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );

    this.sway = 0;
    this.shake = 0;

    this.light1= new THREE.PointLight( 0xdbd14c, 1, 3000 );
    this.light1.position.set( 0, 0, 0 );
    this.main.state.scene.add( this.light1 );

    this.tube = new Tube();
    this.main.state.scene.add( this.tube.holder );
	this.avatar = new Avatar( this.tube, this.input, this.pathObjects );
	this.main.state.scene.add( this.avatar.holder );

    window.game_win = false;

    this.main.fadeToSong("ld28-game");

}

GameController.prototype.onBeat = function() {
    // BEAT IT, JUST BEAT IT
    //console.log("BEAT IT BABY");

    this.avatar.onBeat();

    for( var i=0; i<this.pathObjects.length; i++){
        this.pathObjects[i].onBeat();
        //this.pathObjects[i].holder.scale.set(1.8,1.8,1.8);
        //new TWEEN.Tween(this.pathObjects[i].holder.scale).easing(TWEEN.Easing.Quadratic.Out).to({x: 1, y: 1, z:1}, 0.5*1000).start();
    }

}

GameController.prototype.update = function (delta) {

    this.light1.position.copy(this.avatar.pos);
    this.avatar.update(delta);
    this.updatePathObjects(delta);
    this.updateParticles(delta);


    if(this.avatar.lastRoom){
        //in last room
        if(!this.isLastRoom){
            this.isLastRoom = true;
            this.main.fadeToSong("ld28-open");
        }

        this.main.state.scene.fog.far += delta * 5;
        this.light1.distance += delta * 4;

        if(this.main.state.scene.fog.far > 8000) this.main.state.scene.fog.far = 8000;
        if(this.light1.distance > 7000) this.light1.distance = 7000;

        if(this.avatar.alive) this.cameraMovement(delta/1000, this.avatar.worldPosition);
        else this.checkFollowersVsEndRoomObjects();

        this.updateEndRoomObjects(delta);

    }else{
        this.main.state.scene.fog.far = 2000;
        this.light1.distance = 1000;

        this.cameraMovement(delta/1000, this.avatar.pos);
    }

    if(!this.avatar.alive){
        if(!this.isGameOver){
            for( var i=0; i<30; i++){
                //pos, color, wireColor, size, life, speed
                var p =new THREE.Vector3().copy(this.avatar.worldPosition);
                var particle = new Particle(p, 0xff0000, 0xff0000, 5 + Math.random() * 10, 2.0,400);
                this.particles.push(particle);
                this.main.state.scene.add( particle.holder );

            }
            this.shake += 1.0;
            this.main.state.scene.remove( this.avatar.holder );
            if(this.avatar.lastRoom){
                this.shotgunAvatarFollowers();
                this.gameOverTimer = 3.0;
                this.main.fadeToSong("ld28-boss");

                new TWEEN.Tween(this.camera.position).easing(TWEEN.Easing.Quadratic.InOut).to(
                    {y:this.camera.position.y - 1000}, 2.0*1000).start();
            }else{
                new TWEEN.Tween(this.camera.position).easing(TWEEN.Easing.Quadratic.InOut).to(
                    {y:this.camera.position.y - 300}, 2.0*1000).start();
            }

            this.isGameOver = true;


        }
        this.gameOverTimer-=delta/1000;
        if(this.gameOverTimer < 0){
            this.gameOver();
        }
    }

    this.camera.lookAt( this.camTarget );
};

GameController.prototype.checkFollowersVsEndRoomObjects = function () {
    var objects = this.tube.endRoom.objects;
    var toObject = new THREE.Vector3();

    for( var i=0; i<this.avatar.following.length; i++){
        if(this.avatar.following[i].alive){
            for( var j=0; j<objects.length; j++){
                toObject.copy(objects[j].pos).add(this.tube.endRoom.holder.position);
                toObject.sub(this.avatar.following[i].pos);
                if(toObject.length() < objects[j].size){
                    objects[j].hitByAvatar( this.avatar.following[i] );
                    this.avatar.following[i].alive = false;
                }
            }
        }
    }
}

GameController.prototype.shotgunAvatarFollowers = function () {
    var objects = this.tube.endRoom.objects;
    for( var i=0; i<this.avatar.following.length; i++){

        var o = objects[ Math.round( Math.random() * (objects.length-1) ) ].pos;

        this.avatar.following[i].shootAtTarget( new THREE.Vector3().copy(o).add(this.tube.endRoom.holder.position) );
    }
}

GameController.prototype.updateEndRoomObjects = function (delta) {
    var objects = this.tube.endRoom.objects;

    for( var i=0; i<objects.length; i++){
        objects[i].update(delta);

        if(this.avatar.alive){
            /*
            var toTarget = new THREE.Vector3().copy(objects[i].pos).add(this.tube.endRoom.holder.position).sub( this.avatar.pos );
            if(toTarget.length() < objects[i].size){
                this.avatar.speed = 0;
                this.avatar.alive = false;
                objects[i].hitByAvatar(this.avatar);
            }
            */
        }else{
            for( var j=0; j<objects.length; j++){
                if(i != j ){
                    if( objects[i].checkCollision(objects[j]) ){
                        /*
                        for( var i=0; i<5; i++){
                            //pos, color, wireColor, size, life, speed
                            var p =new THREE.Vector3().copy(objects[i].pos).add(this.tube.endRoom.holder.position);
                            var particle = new Particle(p, objects[i].color, objects[i].color, 5 + Math.random() * 10, 1.0,300 + Math.random()*100);
                            this.particles.push(particle);
                            this.main.state.scene.add( particle.holder );
                        }
                        */
                        if(!objects[i].active || !objects[j].active){
                            objects[i].active = true;
                            objects[j].active = true;
                            this.gameOverTimer += 1.0;
                            if(this.gameOverTimer > 3.0)this.gameOverTimer = 3.0;


                            var p = new THREE.Vector3().copy(objects[i].pos).add(this.tube.endRoom.holder.position);
                            new TWEEN.Tween(this.camTarget).easing(TWEEN.Easing.Quadratic.InOut).to(
                                {x:p.x , y: p.y, z:p.z},
                                1.0*1000).start();
                        }
                    }
                }
            }
        }

    }

}

GameController.prototype.cameraMovement = function (dt, camTarget) {
    this.sway += dt * 0.5;
    if( this.sway > Math.PI * 2) this.sway -= Math.PI*2;
    var x = 0;//Math.cos(this.sway) * 10;
    var z = 0;//Math.sin(this.sway) * 10;

    if(this.shake > 0){
        x += Math.random() * this.shake * 6 - this.shake * 3;
        z += Math.random() * this.shake * 6 - this.shake * 3;
    }

    this.shake -=dt;
    if(this.shake < 0)this.shake =0;
    if(this.shake > 2)this.shake =2;

    // TODO It would be nice to have some blending between focus transitions...


    var dir = new THREE.Vector3().copy(this.avatar.vel);
    //if(this.avatar.lastRoom) dir.add(this.avatar.worldControlVel);
    dir.normalize();
    dir.multiplyScalar(-100);
    var target = new THREE.Vector3().addVectors(camTarget, dir);
    target.z += 1;
    if(this.avatar.lastRoom){
        target = new THREE.Vector3().copy(camTarget);
        target.y -= 100;
    }

    var toTarget = new THREE.Vector3().subVectors(target, this.camera.position);

    var m = this.avatar.lastRoom ? 10 : 5;
    toTarget.multiplyScalar(  m * dt );
    this.camera.position.add(toTarget);

    //dont get too close!
    var toAvatar = new THREE.Vector3().subVectors(this.camera.position, camTarget);
    var d = this.avatar.lastRoom ? 100 : 100;

    if( toAvatar.length() < d ){
        toAvatar.normalize();
        toAvatar.multiplyScalar(d);
        this.camera.position.copy( camTarget );
        this.camera.position.add(toAvatar);
    }

    this.camera.position.x += x;
    this.camera.position.z += z;

    //var lookAt = new THREE.Vector3().copy(this.avatar.pos);
    //lookAt.x += this.avatar.wire.position.x * 0.2;
    //lookAt.z -= this.avatar.wire.position.y * 0.2;

    this.camTarget.copy(camTarget);


};

GameController.prototype.checkInput = function () {

};

GameController.prototype.gameOver = function () {
    this.main.operations.push(function(game) {
        game.setState( new GameOver() );
    });
};

GameController.prototype.updateParticles = function (delta) {

    var remove = [];
    for( var i=0; i<this.particles.length; i++){
        this.particles[i].update(delta);
        if(!this.particles[i].alive){
            remove.push(this.particles[i]);
        }
    }

    for( var i=0; i<remove.length; i++){
        this.main.state.scene.remove( remove[i].holder );
        this.particles.splice( this.particles.indexOf(remove[i]), 1);
    }
}

GameController.prototype.updatePathObjects = function (delta) {
    this.spawnTimer -= delta/1000;

    if(!this.avatar.lastRoom && this.spawnTimer <= 0 && this.avatar.following.length < 30){
       this.spawnTimer = 0.25 + Math.random();
       if( this.avatar.tubeIndex + 3 < this.tube.path.length ){
           var pathObject = new PathObject( this.tube.path[this.avatar.tubeIndex + 3].clone(), this.tube);
           pathObject.pos.x += Math.random() * 100 - 50;
           pathObject.pos.z += Math.random() * 100 - 50;
           this.main.state.scene.add( pathObject.holder );
           this.pathObjects.push( pathObject );
       }
    }

    var remove = [];
    for( var i=0; i<this.pathObjects.length; i++){
        this.pathObjects[i].update(delta);
        if(!this.pathObjects[i].alive){
            remove.push(this.pathObjects[i]);
        }
    }

    for( var i=0; i<remove.length; i++){
        this.main.state.scene.remove( remove[i].holder );
        this.pathObjects.splice( this.pathObjects.indexOf(remove[i]), 1);
    }
};
