function ShockwaveParticle(pos, color, size) {
    this.color = color;
    this.pos = pos;
    this.vel = new THREE.Vector3(0,0,40); // move up?
    this.holder = new THREE.Object3D();
    this.life = this.maxLife = 0.4;
    this.pos = pos;



    this.mat = new THREE.MeshPhongMaterial({ color:color, transparent:true, shading: THREE.FlatShading  });
    this.mat.blending = THREE.AdditiveAlphaBlending;

    this.geom = new THREE.TorusGeometry(this.size * 5, 20, 4, 10);
    this.mesh = new THREE.Mesh(this.geom, this.mat);
    this.mesh.scale.z = 0.01;

    this.holder.add( this.mesh );

    this.alive = true;

    this.update(0);

    this.mesh.material.opacity = 1;
    this.mesh.scale.x =0.25;
    this.mesh.scale.y =0.25;

    this.holder.rotation.x = Math.random() * Math.PI * 2;
    this.holder.rotation.y = Math.random() * Math.PI * 2;
    this.holder.rotation.z = Math.random() * Math.PI * 2;
}


ShockwaveParticle.prototype.update = function (dt) {

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    this.holder.position = this.pos;

    this.mesh.scale.x = 0.25 + 0.75 * (1 - this.life / this.maxLife);
    this.mesh.scale.y = 0.25 + 0.75 * (1 - this.life / this.maxLife);
    this.mat.opacity = this.life / this.maxLife;

    this.life-=dt;
    if (this.life <= 0) {
        this.alive = false;
        return;
    }

};

ShockwaveParticle.prototype.dispose = function () {
};

