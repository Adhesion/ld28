 function BaddieBullet(pos) {
    GameObject.call(this, new THREE.CubeGeometry(5, 5, 5), 0x03ff68, 0x00ffff);
    this.wire.scale = new THREE.Vector3(1.25, 1.25, 1.25);
    this.pos = pos;
    this.vel.x = Math.random() * 4 - 2;
    this.vel.y = -5;
    this.size = 5;
    this.update();

    this.solidMat.blending = THREE.AdditiveAlphaBlending;
    this.wireMat.blending = THREE.AdditiveAlphaBlending;
}

BaddieBullet.prototype = new GameObject();
BaddieBullet.prototype.constructor = BaddieBullet;

BaddieBullet.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);
    this.wireMat.opacity = 0.5 + Math.random() * 0.5;
    if (this.pos.y < -200) this.alive = false;
    this.rotation.y += 0.1;
    this.rotation.z += 0.1;
};

BaddieBullet.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    var w = 15;
    var h = 15;

    geometry.vertices.push(new THREE.Vector3(-w * 0.5, -h / 2, 0));
    geometry.vertices.push(new THREE.Vector3(w * 0.5, -h / 2, 0));
    geometry.vertices.push(new THREE.Vector3(0, h / 2, 0));

    geometry.vertices.push(new THREE.Vector3(-w * 0.5, 0, -h / 2));
    geometry.vertices.push(new THREE.Vector3(w * 0.5, 0, -h / 2));
    geometry.vertices.push(new THREE.Vector3(0, 0, h / 2));


    geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 1, 0),
        new THREE.Face3(3, 4, 5), new THREE.Face3(5, 4, 3));

    geometry.computeBoundingSphere();

    return geometry;
};