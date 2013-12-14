function ScorePopup(pos, color, score) {
    this.score = score;
    this.color = color;
    this.pos = pos;
    this.vel = new THREE.Vector3(0,0,40); // move up?
    this.holder = new THREE.Object3D();
    this.life = this.maxLife = 0.5;
    this.pos = pos;

    this.canvas = document.createElement("canvas");
    this.updateCanvas();

    this.tex = new THREE.Texture(this.canvas);
    this.tex.needsUpdate = true;

    this.mat = new THREE.MeshBasicMaterial({map: this.tex, transparent:true});
    var s = 0.4;
    this.geom = new THREE.PlaneGeometry( this.canvas.width* s,  this.canvas.height* s, 1, 1);
    this.plane = new THREE.Mesh(this.geom, this.mat);
    this.plane.up = new THREE.Vector3(0,0,1);
    this.plane.position.x = this.canvas.width /2 * s;

    this.holder.add( this.plane );

    this.alive = true;

    this.update(0);
}

ScorePopup.prototype.updateCanvas = function(){
    this.canvas.width = 128;
    this.canvas.height = 32;
    var context = this.canvas.getContext('2d');
    context.font = '20pt Arial';
    context.fontWeight = "bold";
    context.fillStyle = 'white';
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("+" + Math.floor(this.score), 0, 0);
}

ScorePopup.prototype.update = function (dt) {

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    this.holder.position = this.pos;

    this.life-=dt;
    if (this.life <= 0) {
        this.alive = false;
        return;
    }

    this.plane.lookAt(window.main.state.camera.position);
    this.mat.opacity = (this.life * 2) / this.maxLife;
};

ScorePopup.prototype.dispose = function () {
};

