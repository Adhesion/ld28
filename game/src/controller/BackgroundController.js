function BackgroundController(scene) {
    this.ground = new GroundPlane();

    this.stars = [];

    for( var i=0; i<100; i++){
        var star = new Star();

        this.stars.push(star);
        scene.add(star.holder);
    }
}

BackgroundController.prototype.update = function (delta) {
    var dt = delta/1000;

    for( var i=0; i<this.stars.length; i++){
        this.stars[i].update(dt);
    }
};
