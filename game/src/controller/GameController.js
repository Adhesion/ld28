function GameController(main) {

    this.main = main;
    this.input = new Input();

    this.combo = 0;

    this.camera = this.main.state.camera;
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.cameraTarget = new THREE.Vector3();

    this.camHolder = new THREE.Object3D();
    this.camHolder.add(this.camera);
    this.main.state.scene.add(this.camHolder);
    this.main.state.scene.add( new THREE.AmbientLight( 0x222222 ) );

    this.particles = [];
    this.baddies = [];

    this.nextChain = null;
    this.chain = [];

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

    this.main.state.scene.add( this.light1 );
    this.main.state.scene.add( this.light2 );
    this.main.state.scene.add( this.light3 );
    this.main.state.scene.add( this.light4 );

    window.game_win = false;
}

GameController.prototype.update = function (delta) {

    this.checkInput();
    var dt = delta/1000;

    this.ambientCameraMovement(dt);

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
    this.camHolder.position.x = x;
    this.camHolder.position.z = z;
    this.camera.lookAt(this.cameraTarget);
    this.shake -=dt;
};

GameController.prototype.checkInput = function () {
    // check if keys are released.
    if (this.input.x == false) this.x = false;

    // only attack if key has been pressed this update.
    if(this.input.x == true && this.x == false ){
        this.x = true;
    }
};

GameController.prototype.gameOver = function () {
    this.main.operations.push(function(game) {
        game.setState( new GameOver() );
    });
};