function GameController(main, skybox) {

    this.main = main;
    this.skybox = skybox;
    this.input = new Input();

    this.camera = this.main.state.camera;
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.cameraTarget = new THREE.Vector3();
    this.camera.position.y = -100;

    this.camHolder = new THREE.Object3D();
    this.camHolder.add(this.camera);
    this.camHolder.position.y = -200;
    this.main.state.scene.add( this.camHolder );
    this.main.state.scene.add( new THREE.AmbientLight( 0x222222 ) );

    this.particles = [];
    this.pathObjects = [];

    this.nextChain = null;
    this.chain = [];

    this.spawnTimer = 0;

    this.main.state.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );

    this.sway = 0;
    this.shake = 0;

    this.light1= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light1.position.set( 1000, 0, 0 );
    this.light2= new THREE.PointLight( 0xffffff, 2, 3000 );
    this.light2.position.set( 0, 1000, 0 );
    this.light3= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light3.position.set( 0, 0, 1000 );
    this.light4= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light4.position.set( 0, -1000, 0 );

    this.camHolder.add( this.light1 );
    this.camHolder.add( this.light2 );
    this.camHolder.add( this.light3 );
    this.camHolder.add( this.light4 );
    this.camHolder.add( this.skybox );

    this.tube = new Tube();
    this.main.state.scene.add( this.tube.holder );
	this.avatar = new Avatar( this.tube );
	this.main.state.scene.add( this.avatar.holder );

    window.game_win = false;

}

GameController.prototype.update = function (delta) {
	this.avatar.update(delta);
	// TODO It would be nice to have some blending between focus transitions...
	var shift = new THREE.Vector3(0, -100, 0);
	this.camHolder.position.copy(this.avatar.holder.position);
	this.camHolder.position.add( shift );

    this.ambientCameraMovement(delta/1000);
    this.updatePathObjects(delta);
};

GameController.prototype.ambientCameraMovement = function (dt) {
    this.sway += dt * 0.5;
    if( this.sway > Math.PI * 2) this.sway -= Math.PI*2;
    var x = Math.cos(this.sway) * 10;
    var z = Math.sin(this.sway) * 10;

    if(this.shake > 0){
        x += Math.random() * this.shake * 4 - this.shake * 2;
        z += Math.random() * this.shake * 4 - this.shake * 2;
    }

    this.camera.position.x = x;
    this.camera.position.z = z;
    this.camera.lookAt(this.cameraTarget);
    this.shake -=dt;
};

GameController.prototype.checkInput = function () {
    // check if keys are released.
    if (this.input.w == false) this.up = false;

    if(this.input.w == true && this.up == false ){
        this.up = true;
    }
};

GameController.prototype.gameOver = function () {
    this.main.operations.push(function(game) {
        game.setState( new GameOver() );
    });
};


GameController.prototype.updatePathObjects = function (delta) {
    this.spawnTimer -= delta/1000;

    if(this.spawnTimer <= 0){
       this.spawnTimer = 1.0;
       if( this.avatar.tubeIndex + 3 < this.tube.path.length ){
           var pathObject = new PathObject( this.tube.path[this.avatar.tubeIndex + 3].clone() );
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
