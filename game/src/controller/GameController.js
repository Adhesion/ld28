function GameController(main, skybox) {

    this.main = main;
    this.skybox = skybox;
    this.input = new Input();

    this.camera = this.main.state.camera;
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.cameraTarget = new THREE.Vector3();
    this.camera.position.y = -100;

    this.main.state.scene.add( this.camera );
    this.main.state.scene.add( new THREE.AmbientLight( 0x222222 ) );

    this.particles = [];
    this.pathObjects = [];

    this.nextChain = null;
    this.chain = [];

    this.spawnTimer = 0;

    this.main.state.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );

    this.sway = 0;
    this.shake = 0;

    this.light1= new THREE.PointLight( 0xdbd14c, 1, 3000 );
    this.light1.position.set( 0, 0, 0 );
    this.main.state.scene.add( this.light1 );


    //this.camHolder.add( this.light1 );
    //this.camHolder.add( this.skybox );

    this.tube = new Tube();
    this.main.state.scene.add( this.tube.holder );
	this.avatar = new Avatar( this.tube, this.input, this.pathObjects );
	this.main.state.scene.add( this.avatar.holder );

    window.game_win = false;

}

GameController.prototype.update = function (delta) {

    this.light1.position.copy(this.avatar.pos);

    this.avatar.update(delta);
    this.cameraMovement(delta/1000);
    this.updatePathObjects(delta);

    if(this.avatar.tubeIndex > this.tube.path.length - this.tube.lastRoom){
        //in last room
        this.main.state.scene.fog.far += delta * 5;
        this.light1.distance += delta * 4;

        if(this.main.state.scene.fog.far > 12000) this.main.state.scene.fog.far = 12000;
        if(this.light1.distance > 10000) this.light1.distance = 10000;

    }else{
        this.main.state.scene.fog.far = 2000;
        this.light1.distance = 1000;
    }


    if(!this.avatar.alive){
        this.gameOver();
    }
};

GameController.prototype.cameraMovement = function (dt) {
    this.sway += dt * 0.5;
    if( this.sway > Math.PI * 2) this.sway -= Math.PI*2;
    var x = Math.cos(this.sway) * 10;
    var z = Math.sin(this.sway) * 10;

    if(this.shake > 0){
        x += Math.random() * this.shake * 4 - this.shake * 2;
        z += Math.random() * this.shake * 4 - this.shake * 2;
    }

    this.shake -=dt;

    // TODO It would be nice to have some blending between focus transitions...


    var dir = new THREE.Vector3().copy(this.avatar.vel);
    dir.normalize();
    dir.multiplyScalar(-100);
    var target = new THREE.Vector3().addVectors(this.avatar.pos, dir);
    var toTarget = new THREE.Vector3().subVectors(target, this.camera.position);
    toTarget.multiplyScalar(  5 * dt );
    this.camera.position.add(toTarget);

    //dont get too close!
    var toAvatar = new THREE.Vector3().subVectors(this.camera.position, this.avatar.pos);
    var d = 100;

    if( toAvatar.length() < d ){
        toAvatar.normalize();
        toAvatar.multiplyScalar(d);
        this.camera.position.copy( this.avatar.pos );
        this.camera.position.add(toAvatar);
    }

    //var lookAt = new THREE.Vector3().copy(this.avatar.pos);
    //lookAt.x += this.avatar.wire.position.x * 0.2;
    //lookAt.z -= this.avatar.wire.position.y * 0.2;

    this.camera.lookAt( this.avatar.pos );

};

GameController.prototype.checkInput = function () {

};

GameController.prototype.gameOver = function () {
    this.main.operations.push(function(game) {
        game.setState( new GameOver() );
    });
};


GameController.prototype.updatePathObjects = function (delta) {
    this.spawnTimer -= delta/1000;

    if(this.spawnTimer <= 0){
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
        }else if( this.pathObjects[i].target!= null ){
            for( var j=0; j<this.pathObjects.length; j++){
                if(i!=j && this.pathObjects[j].target!= null){
                    this.pathObjects[i].avoid(this.pathObjects[j]);
                    this.pathObjects[j].avoid(this.pathObjects[i]);
                }
            }
        }
    }

    for( var i=0; i<remove.length; i++){
        this.main.state.scene.remove( remove[i].holder );
        this.pathObjects.splice( this.pathObjects.indexOf(remove[i]), 1);
    }
};
