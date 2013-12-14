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

    this.note0 = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/note0.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );
    this.note1 = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/note1.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );
    this.note2 = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/note2.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );
    this.note3 = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/note3.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );
    this.note4 = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/note4.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );


    this.boss = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/boss.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    this.boss_hp_bar = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/boss_hp_bar.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    this.hp = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/hp.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    this.hp_bar = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/hp_bar.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    this.hp_bar_bg = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/hp_bar_bg.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    this.boss_hp_bar_bg = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: main.loader.get( "assets/hud/hp_bar_bg.png" ),
            useScreenCoordinates: true,
            alignment: THREE.SpriteAlignment.topLeft
        })
    );

    console.log( "x pos: " + (window.innerWidth / 2 - 149) );
    console.log( "y pos: " + window.innerHeight * 0.85 );

    this.note0.scale.set( 70, 70, 1 );
    this.note1.scale.set( 70, 70, 1 );
    this.note2.scale.set( 70, 70, 1 );
    this.note3.scale.set( 70, 70, 1 );
    this.note4.scale.set( 70, 70, 1 );

    this.scoreSprite.scale.set( 256, 64, 1 );

    var s = 0.5;

    this.hp.position.set( 10 * s, 10 * s, 0 );
    this.hp.scale.set( 134 * s, 42 * s, 1 );
    this.hp_bar.position.set( 160 * s, 10 * s, 0 );
    this.hp_bar.scale.set( 400 * s, 42 * s, 1 );
    this.hp_bar_bg.position.set( 160 * s, 10 * s, 0 );
    this.hp_bar_bg.scale.set( 400 * s, 42 * s, 1 );
    this.boss.position.set( 10 * s, 80 * s, 0 );
    this.boss.scale.set( 258 * s, 44 * s, 1 );
    this.boss_hp_bar.position.set( 290 * s, 80 * s, 0 );
    this.boss_hp_bar.scale.set( 400 * s, 42 * s, 1 );
    this.boss_hp_bar_bg.position.set( 290 * s, 80 * s, 0 );
    this.boss_hp_bar_bg.scale.set( 400 * s, 42 * s, 1 );


    this.hpLen = this.hp_bar.scale.x;

    this.scene.add( this.hp );
    this.scene.add( this.hp_bar );
    this.scene.add( this.hp_bar_bg );
    this.scene.add( this.boss );
    this.scene.add( this.boss_hp_bar );
    this.scene.add( this.boss_hp_bar_bg );

    this.scene.add( this.note0 );
    this.scene.add( this.note1 );
    this.scene.add( this.note2 );

    this.scene.add( this.scoreSprite );

    this.boss.material.opacity = 0;
    this.boss_hp_bar.material.opacity = 0;
    this.boss_hp_bar_bg.material.opacity = 0;

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

    this.note0.position.set( width / 2 - 35 - 80 * 2, height - 80, 0 );
    this.note1.position.set( width / 2 - 35 - 80, height - 80, 0 );
    this.note2.position.set( width / 2 - 35, height - 80, 0 );
    this.note3.position.set( width / 2 - 35 + 80, height - 80, 0 );
    this.note4.position.set( width / 2 - 35 + 80 * 2, height - 80, 0 );

    this.scoreSprite.position.set( width, 0, 0 );
}

UIController.prototype.addScore = function (val) {
    this.score += val;
    window.game_score = this.score;

    this.updateCanvas();
    this.scoreTex.needsUpdate = true;
};

UIController.prototype.update = function () {


    var avatar = this.main.state.goController.avatar;
    var boss = this.main.state.goController.boss;

    if( boss.active ){
        this.boss.material.opacity = 1;
        this.boss_hp_bar.material.opacity = 1;
        this.boss_hp_bar_bg.material.opacity = 1;
    }else{
        this.boss.material.opacity = 0;
        this.boss_hp_bar.material.opacity = 0;
        this.boss_hp_bar_bg.material.opacity = 0;
    }

    this.hp_bar.scale.x = avatar.hp / avatar.startHP * this.hpLen;
    this.boss_hp_bar.scale.x = boss.hp / boss.startHP * this.hpLen;

    var input = this.main.state.goController.input;

    if(input.x) this.note0.material.opacity = 1;
    else this.note0.material.opacity = 0.5;
    if(input.c) this.note1.material.opacity = 1;
    else this.note1.material.opacity = 0.5;
    if(input.v) this.note2.material.opacity = 1;
    else this.note2.material.opacity = 0.5;
    if(input.b) this.note3.material.opacity = 1;
    else this.note3.material.opacity = 0.5;
    if(input.n) this.note4.material.opacity = 1;
    else this.note4.material.opacity = 0.5;


    if (this.displayScore < this.score) {
        this.displayScore += (this.score - this.displayScore) * 0.05;
        if (this.score - this.displayScore <= 1) {
            this.displayScore = this.score;
        }
    }

    /*
    this.scoreTxt.nodeValue = "" + Math.round(this.displayScore);
    */
};

UIController.prototype.showKeyUI = function (val) {
    if( val == 3 ) this.scene.add( this.note3 );
    else if( val == 4 ) this.scene.add( this.note4 );
};
