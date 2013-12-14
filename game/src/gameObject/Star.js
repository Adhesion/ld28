function Star() {
    GameObject.call(this, this.buildMesh(), 0x262626, 0x262626);
    this.wire.scale = new THREE.Vector3(1, 1, 1);
    //this.wireMat.opacity = 0.25;
    //this.solidMat.opacity = 0.5;

    this.resetPos();

    this.vel.x = 0;
    this.vel.y = -2000;
    this.update();

    //this.solidMat.blending = THREE.SubtractiveBlending;
    //this.wireMat.blending = THREE.SubtractiveBlending;
}

Star.prototype = new GameObject();
Star.prototype.constructor = Star;

Star.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);


    if (this.pos.y < -2000) this.resetPos();
};


Star.prototype.resetPos = function () {
    this.pos.x = Math.random() * 500 - 250;
    this.pos.z = Math.random() * 500 - 250;
    this.pos.y = 1000 + Math.random() * 4000;
}

Star.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    var w = 1;
    var h = 200;

    geometry.vertices.push(new THREE.Vector3(0, h, 0));
    geometry.vertices.push(new THREE.Vector3(-w, h* 0.5, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));

    geometry.faces.push(new THREE.Face3(0, 1, 2, new  THREE.Vector3(0,0,1)));

    geometry.computeBoundingSphere();

    return geometry;
};