function GameObjectController(main) {


    //Howler.mute();

    this.missfireCounter = 0;
    this.missfireCounterMax = 2.0;
    this.missfireActive = false;

    this.main = main;
    this.input = new Input();

    this.combo = 0;

    this.camera = this.main.state.camera;
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.cameraTarget = new THREE.Vector3();
    this.level = new Level(this);

    this.camHolder = new THREE.Object3D();
    this.camHolder.add(this.camera);
    this.main.state.scene.add(this.camHolder);
    this.main.state.scene.add( new THREE.AmbientLight( 0x222222 ) );

    this.avatar = new Avatar();

    this.particles = [];
    this.baddies = [];

    this.nextChain = null;
    this.chain = [];

    this.main.state.scene.add(this.avatar.holder);
    this.main.state.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );

    this.boss = new SauceBoss();

    // have any of these keys been pressed this update cycle?
    this.x = this.c = this.v = this.b = this.n = false;

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


    this.enabledKeys = []
    for( var i = 0; i < 5; i++ ) {
        if( i < 3 ) this.enabledKeys.push( true );
        else this.enabledKeys.push( false );  // 4th & 5th keys disabled at first
    }

    window.game_win = false;
}

GameObjectController.prototype.update = function (delta) {

    this.checkInput();
    var dt = delta/1000;

    this.level.update(dt);

    this.updateObjects(this.baddies, dt);
    this.updateObjects(this.particles, dt);
    this.avatar.update(dt);
    this.boss.update(dt);

    this.ambientCameraMovement(dt);
    //this.spawnBaddie(dt);
    this.checkHits();

    this.avatar.hp += dt * 0.3;
    if(this.avatar.hp > this.avatar.startHP) this.avatar.hp = this.avatar.startHP;

    this.manageMissfire(dt);
};


GameObjectController.prototype.manageMissfire = function (dt) {
    this.missfireCounter -= dt;

    if(this.missfireActive){
        if(this.missfireCounter <=0){
            this.missfireActive = false;
            this.avatar.missfire(false);
        }
    }else{

    }

    if(this.missfireCounter < 0)this.missfireCounter = 0;
};

GameObjectController.prototype.ambientCameraMovement = function (dt) {
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

GameObjectController.prototype.checkHits = function () {
    var d = new THREE.Vector3();

    for (var i = 0; i < this.baddies.length; i++) {
        d.subVectors(this.baddies[i].pos, this.avatar.pos);

        if(d.length() <= this.avatar.range + this.baddies[i].size ){
            this.baddies[i].slowed = true;
        }

        if(d.length() <= this.baddies[i].size ){
            this.spawnDieParticles(this.baddies[i]);

            //this is kinda hacks, need to disconnect it from its child when it dies.
            if(this.nextChain == this.baddies[i]){
                this.breakChain();
                this.nextChain = null;
            }
            if(this.baddies[i].child != null ) this.baddies[i].child = null;

            this.baddies[i].hit(1);

            //TODO: avatar take a hit.
            this.shake = 0.5;
            this.main.loader.get( "sound/playerhit" + this.baddies[i].type).play();

            this.avatar.hp--;
            if( this.avatar.hp <= 0 ) {
                this.main.operations.push(function(game) {
                    game.setState( new GameOver() );
                });
            }
        }
    }
};

GameObjectController.prototype.addScore = function (val) {
    this.main.state.uiController.addScore(val);
};

GameObjectController.prototype.spawnDieParticles = function (baddie) {
    var i;
    var particle;

    this.shake += 0.2;

    for (i = 0; i < 10; i++) {
        particle = new Particle(baddie.pos.clone(), baddie.color, baddie.wireColor, baddie.size, 1.0, 200);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

};

GameObjectController.prototype.spawnScoreParticle = function (baddie, score, offset) {
   //skip this
    /*
    var p = baddie.pos.clone();
    p.z += offset;
    var particle = new ScorePopup(p, baddie.color, score);
    this.particles.push(particle);
    this.main.state.scene.add(particle.holder);
    */
};

GameObjectController.prototype.spawnBossHitParticles = function () {
    var i;
    var particle;

    for (i = 0; i < 50; i++) {
        particle = new Particle(this.boss.pos.clone(), this.boss.color, this.boss.wireColor, this.boss.size, 3.0, 1000);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }
};

GameObjectController.prototype.spawnBossDieParticles = function () {
    var i;
    var particle;

    for (i = 0; i < 10; i++) {
        particle = new Particle(this.boss.pos.clone(), 0xf53d54, this.boss.wireColor, 50, 5.0, 600);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

    for (i = 0; i < 10; i++) {
        particle = new Particle(this.boss.pos.clone(), 0x04bf9d, this.boss.wireColor, 70, 5.0, 800);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

    for (i = 0; i < 10; i++) {
        particle = new Particle(this.boss.pos.clone(), 0x2e6fac, this.boss.wireColor, 50, 5.0, 800);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

    for (i = 0; i < 10; i++) {
        particle = new Particle(this.boss.pos.clone(), 0xf2e85c, this.boss.wireColor, 70, 5.0, 800);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

    for (i = 0; i < 10; i++) {
        particle = new Particle(this.boss.pos.clone(), 0x9572c0, this.boss.wireColor, 100, 5.0, 400);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }

    var shockwave = new ShockwaveParticle(this.boss.pos.clone(), 0x04bf9d, 500);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);

    shockwave = new ShockwaveParticle(this.boss.pos.clone(), 0x04bf9d, 600);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);

    shockwave = new ShockwaveParticle(this.boss.pos.clone(), 0x04bf9d, 700);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);

    shockwave = new ShockwaveParticle(this.boss.pos.clone(), 0x04bf9d, 800);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);

    shockwave = new ShockwaveParticle(this.boss.pos.clone(), 0x04bf9d, 900);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);

};

GameObjectController.prototype.spawnChainParticles = function (baddie) {
    var i;
    var particle;

    for (i = 0; i < 5; i++) {
        particle = new Particle(baddie.pos.clone(), 0x000000, 0x000000, baddie.size, 1.0, 200);
        this.particles.push(particle);
        this.main.state.scene.add(particle.holder);
    }
};

GameObjectController.prototype.makeBaddie = function (baddie) {
    baddie.target = this.avatar;
    this.baddies.push(baddie);
    this.main.state.scene.add(baddie.holder);
}

GameObjectController.prototype.makeLinkedBaddies = function (baddies) {
    for(var i=0; i<baddies.length; i++){
        if(i > 0){
            baddies[i-1].linkChild(baddies[i]);
        }

        baddies[i].target = this.avatar;
        this.baddies.push(baddies[i]);
        this.main.state.scene.add(baddies[i].holder);
    }
};

GameObjectController.prototype.makeBossLinkedBaddies = function (baddies) {
    this.makeLinkedBaddies(baddies);
    baddies[baddies.length-1].linkChild(this.boss);
}


GameObjectController.prototype.updateObjects = function (objects, dt) {
    for (var i = 0; i < objects.length; i++) {
        objects[i].update(dt);

        if (!objects[i].alive) {
            this.main.state.scene.remove(objects[i].holder);
            objects[i].dispose();
            objects.splice(i, 1);
        }
    }
};

GameObjectController.prototype.checkInput = function () {
    // check if keys are released.
    if (this.input.x == false) this.x = false;
    if (this.input.c == false) this.c = false;
    if (this.input.v == false) this.v = false;
    if (this.input.b == false) this.b = false;
    if (this.input.n == false) this.n = false;


    // only attack if key has been pressed this update.
    if(this.input.x == true && this.x == false ){
        this.x = true;
        this.attack(0);
        this.avatar.showRing(0);
    }
    if(this.input.c == true && this.c == false ){
        this.c = true;
        this.attack(1);
        this.avatar.showRing(1);
    }
    if(this.input.v == true && this.v == false ){
        this.v = true;
        this.attack(2);
        this.avatar.showRing(2);
    }
    if(this.input.b == true && this.b == false ){
        this.b = true;
        this.attack(3);
        this.avatar.showRing(3);
    }
    if(this.input.n == true && this.n == false ){
        this.n = true;
        this.attack(4);
        this.avatar.showRing(4);
    }
};

GameObjectController.prototype.attack = function (type) {
    if(this.missfireActive == true)return;

    if( this.enabledKeys[type] == false ) return;

    if(this.nextChain != null){
        //already in a chain, attack next one.
        if( type == this.nextChain.type ){
            this.hitBaddie(this.nextChain, true);
            return;
        }else{
            this.breakChain();
            // TODO: didn't hit anything.. penalize player.
            this.combo = 0;
            this.main.loader.get( "sound/miss").play();
        }
    }else{
        // not in a chain, check if any bullets are in range.
        for (var i = 0; i < this.baddies.length; i++) {
            if(this.baddies[i].type == type && this.baddies[i].alive && this.baddies[i].active){
                var d = new THREE.Vector3();
                d.subVectors(this.baddies[i].pos, this.avatar.pos);

                if(d.length() < this.avatar.range + this.baddies[i].size){
                   this.hitBaddie(this.baddies[i]);
                   return;
                }
            }
        }

        this.missfireCounter ++;

        if(this.missfireCounter >= 3){
            this.missfireCounter = this.missfireCounterMax;
            this.missfireActive = true;
            this.avatar.missfire(true);
            this.main.loader.get( "sound/misfire").play();
        }else{
            this.main.loader.get( "sound/miss").play();
        }
        this.combo = 0;
    }
};

GameObjectController.prototype.hitBaddie = function (baddie, chain) {
    baddie.hit(1, chain);
    this.spawnDieParticles(baddie);

    // enemy in chain, has child
    if(baddie.child != null) {
        // ... but we have to preemptively break chain if it's the boss
        if(baddie.child == this.boss){
            baddie.child = null;
            this.nextChain = null;
            this.chain.push(baddie);
            this.breakChain();
            //TODO: attack boss, spawn particles n shit.

            this.spawnBossHitParticles();
            this.main.loader.get( "sound/chainhit" + baddie.type ).play();
            // TODO boss hit sound?
            // probably should just call boss.hit()?
            console.log("boss has been hit");
            this.boss.hit(1);

            if(this.boss.alive){
                this.main.loader.get( "sound/bosshit" ).play(); // temp
                this.shake = 2.0;
            }else{
                this.main.loader.get( "sound/bossdeath" ).play(); // temp
                this.shake = 5.0;
                this.main.state.scene.remove(this.boss.holder);
                this.boss.active = false;
                this.spawnBossDieParticles();
                window.game_win = true;
            }
        }
        // regular enemy in chain
        else {
            this.nextChain = baddie.child;
            this.chain.push(baddie);
            this.main.loader.get( "sound/chainhit" + baddie.type ).play();
        }
    // last enemy in the chain
    } else if (chain) {

         //TODO: add score popup particle
        var s = 100 * this.chain.length * this.combo;
        this.spawnScoreParticle(baddie, s, 40);
        this.main.state.uiController.addScore(s);

        this.nextChain = null;
        this.chain.push(baddie);
        this.breakChain();
        this.main.loader.get( "sound/chainhit" + baddie.type ).play();

    }
    // single enemy, no chain
    else {
        this.main.loader.get( "sound/hit" + baddie.note ).play();
    }

    //TODO: add score popup particle
    var s = 50+ 55* this.combo;
    this.spawnScoreParticle(baddie, s, 0);
    this.main.state.uiController.addScore(50+ 55* this.combo);
    this.combo++;
    //TODO: add some score

    var shockwave = new ShockwaveParticle(baddie.pos.clone(), baddie.color, baddie.size);
    this.particles.push(shockwave);
    this.main.state.scene.add(shockwave.holder);
};

GameObjectController.prototype.breakChain = function () {
    for( var i=0; i<this.chain.length; i++){
        this.chain[i].deathTimer = 18 + i*8;
    }
    this.chain = [];
};

GameObjectController.prototype.moveCamera = function (pos, target, time) {
    new TWEEN.Tween(this.camera.position).easing(TWEEN.Easing.Quadratic.InOut).to({x: pos.x, y: pos.y, z:pos.z}, time*1000).start();
    new TWEEN.Tween(this.cameraTarget).easing(TWEEN.Easing.Quadratic.InOut).to({x: target.x, y: target.y, z:target.z}, time*1000).start();
};

GameObjectController.prototype.defaultCamera = function (time) {
    new TWEEN.Tween(this.camera.position).to({x: 0, y: -200, z:200}, time*1000).start();
    new TWEEN.Tween(this.cameraTarget).to({x: 0, y:0, z:0}, time*1000).start();
};

GameObjectController.prototype.bossAppear = function (pos) {
    this.boss.appear(pos);
    this.main.state.scene.add(this.boss.holder);
    this.boss.active = true;
};

GameObjectController.prototype.bossMove = function (pos) {
    this.boss.move(pos);
};

GameObjectController.prototype.bossHide = function () {
    //TODO: spawn some particles n shit because that mofo' 'spacejumped'
    this.main.state.scene.remove(this.boss.holder);
};

GameObjectController.prototype.enableKey = function (key) {
    this.enabledKeys[key] = true;
    // fuck with UI controller here (to add to HUD)
    this.main.state.uiController.showKeyUI( key );
};

GameObjectController.prototype.gameOver = function () {
    this.main.operations.push(function(game) {
        game.setState( new GameOver() );
    });
};