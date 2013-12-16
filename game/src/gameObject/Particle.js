function Particle(pos, color, wireColor, size, life, speed) {
    GameObject.call(this, {
		geometry: this.buildMesh(size),
		color: color,
		wireColor: wireColor
	});

    this.alive = true;
    this.life = this.maxLife = life;
    this.pos = pos;
    this.rotation = new THREE.Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);

    //this.update(0);
    this.vel.x = Math.random() * speed - speed * 0.5;
    this.vel.y = Math.random() * speed - speed * 0.5;
    this.vel.z = Math.random() * speed - speed * 0.5;

    this.rotation = new THREE.Vector3();

    this.holder.rotation.x += Math.random() * 10;
    this.holder.rotation.y += Math.random() * 10;
    this.holder.rotation.z += Math.random() * 10;

    //this.solidMat.blending = THREE.AdditiveAlphaBlending;
   // this.wireMat.blending = THREE.AdditiveAlphaBlending;
}

Particle.prototype = Object.create(GameObject.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.update = function (delta) {
    GameObject.prototype.update.call(this, delta);
    var dt = delta/1000;

    this.life-=dt;
    if (this.life <= 0) {
        this.alive = false;
        return;
    }

    //this.solidMat.opacity = (this.life * 2) / this.maxLife;
    this.wireMat.opacity = (this.life * 2) / this.maxLife;

    this.vel.y -= dt * 500;

    this.rotation.x += dt;
    this.rotation.y += dt;
    this.rotation.z += dt;

   this.holder.rotation.x += dt* 5;
   this.holder.rotation.y += dt* 5;
   this.holder.rotation.z += dt* 5;

    //console.log("PARTICLE " + this.life);
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
