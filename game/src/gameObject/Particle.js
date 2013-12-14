function Particle(pos, color, wireColor, size, life, speed) {
    GameObject.call(this, this.buildMesh(size), color, wireColor);
    this.life = this.maxLife = life;
    this.pos = pos;
    this.rotation = new THREE.Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);

    this.update(0);
    this.vel.x = Math.random() * speed - speed * 0.5;
    this.vel.y = Math.random() * speed - speed * 0.5;
    this.vel.z = Math.random() * speed - speed * 0.5;

    var v = this.vel.clone();
    v.setLength(this.size)

    this.vel.addVectors(this.vel, v);

    this.solidMat.blending = THREE.AdditiveAlphaBlending;
    this.wireMat.blending = THREE.AdditiveAlphaBlending;
}

Particle.prototype = new GameObject();
Particle.prototype.constructor = Particle;

Particle.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);

    this.life-=dt;
    if (this.life <= 0) {
        this.alive = false;
        return;
    }

    this.solidMat.opacity = (this.life * 2) / this.maxLife;
    this.wireMat.opacity = (this.life * 2) / this.maxLife;

    this.vel.y -= dt * 500;

    this.rotation.x += 0.1;
    this.rotation.y += 0.1;
    this.rotation.z += 0.1;
};

Particle.prototype.buildMesh = function (size) {
    var geometry = new THREE.Geometry();

    //front
    geometry.vertices.push(new THREE.Vector3(size * 0.5, size * 0.5, 0));
    geometry.vertices.push(new THREE.Vector3(-size * 0.5, size * 0.5, 0));
    geometry.vertices.push(new THREE.Vector3(0, -size * 0.5, 0));

    geometry.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3( 0, 0, 1 )), new THREE.Face3(2, 1, 0, new THREE.Vector3( 0, 0, -1 )));

    geometry.computeBoundingSphere();

    return geometry;
};