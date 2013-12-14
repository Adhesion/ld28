function UIController(main) {
    this.main = main;

    this.displayScore = 0;
    this.score = 0;
    window.game_score = 0;

    this.canvas = document.createElement("canvas");

    this.updateCanvas();

    this.scoreTex = new THREE.Texture(this.canvas);
    this.scoreTex.needsUpdate = true;

    this.scoreSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: this.scoreTex,
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topRight
        })
    );

    /*
    this.scoreTxt = document.createTextNode("0");

    this.scoreDiv = document.createElement('div');
    this.scoreDiv.setAttribute('class', 'score');
    this.scoreDiv.appendChild(this.scoreTxt);
    document.body.appendChild(this.scoreDiv);
    */

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
        0,
        window.innerWidth,
        0,
        window.innerHeight
    );
    this.camera.position.z = 100;

    /*(
    this.boss_hp_bar_bg = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/hp_bar_bg.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );
    */


    this.scoreSprite.scale.set( 256, 64, 1 );

    //this.boss_hp_bar_bg.position.set( 290 * s, 80 * s, 0 );
    //this.boss_hp_bar_bg.scale.set( 400 * s, 42 * s, 1 );

    //this.scene.add( this.boss_hp_bar_bg );

    this.scene.add( this.scoreSprite );

    this.resize(window.innerWidth, window.innerHeight);
}

UIController.prototype.updateCanvas = function(){
    this.canvas.width = 256;
    this.canvas.height = 64;
    var context = this.canvas.getContext('2d');
    context.font = '30pt Arial';
    context.fillStyle = 'white';
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText("" + Math.floor(this.score), this.canvas.width-5, 0);
}


UIController.prototype.resize = function( width, height ) {
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    //this.notes.position.set( width - 320, 20 );

    //this.note0.position.set( width / 2 - 35 - 80 * 2, height - 80, 0 );

    this.scoreSprite.position.set( width, 0, 0 );
}

UIController.prototype.addScore = function (val) {
    this.score += val;
    window.game_score = this.score;

    this.updateCanvas();
    this.scoreTex.needsUpdate = true;
};

UIController.prototype.update = function () {

    if (this.displayScore < this.score) {
        this.displayScore += (this.score - this.displayScore) * 0.05;
        if (this.score - this.displayScore <= 1) {
            this.displayScore = this.score;
        }
    }
};
