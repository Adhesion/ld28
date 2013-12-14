function Bullet(pos) {
    GameObject.call(this, this.buildMesh(), 0x00ffff, 0xffff00);
    this.wire.scale = new THREE.Vector3(0.75, 1, 1);
    this.wireMat.wireframe = false;
    this.wire.position.z = 1;
    this.pos = pos;
    this.vel.x = Math.random() * 2 - 1;
    this.vel.y = 10;
    this.update();

    this.solidMat.blending = THREE.AdditiveAlphaBlending;
}

Bullet.prototype = new GameObject();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);
    this.wireMat.opacity = 0.5 + Math.random() * 0.5;
    if (this.pos.y > 500) this.alive = false;
};

Bullet.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    var w = 4;
    var h = 30;

    geometry.vertices.push(new THREE.Vector3(w * 0.5, h, 0));
    geometry.vertices.push(new THREE.Vector3(-w * 0.5, h, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    geometry.computeBoundingSphere();

    return geometry;
};