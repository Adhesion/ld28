function GroundPlane() {
    this.size = 1000;
    this.segs = 20;
    this.pos = new THREE.Vector3(0, this.size * 0.3, 0);
    this.rotation = new THREE.Vector3(-Math.PI / 2, 0, 0);

    this.wireMat = new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true });
    this.wireMat.opacity = 0.5;

    this.wire = new THREE.Mesh(new THREE.PlaneGeometry(this.size, this.size, this.segs, this.segs), this.wireMat);
    this.wire.position.z = - 30;
    this.hitCountMax = 2;
    this.hitCount = 0;

    this.offset = 0;
    this.speed = 5;

    this.update();
}

GroundPlane.prototype.update = function () {
    this.offset += this.speed;
    if (this.offset > this.size / this.segs) {
        this.offset -= this.size / this.segs;
    }

    this.wire.rotation = this.rotation;
    this.wire.position.y = this.pos.y - this.offset;
};