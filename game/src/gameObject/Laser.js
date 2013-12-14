/**
 * Created with JetBrains WebStorm.
 * User: Mike.Roushey
 * Date: 7/16/12
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */
function Laser() {
    this.width = 0;
    this.maxWidth = 5;
    this.height = 400;
    this.segments = 30;
    this.waveAngle = 0;

    this.points = [];
    GameObject.call(this, this.buildMesh(this.width, this.height, this.segments, this.points), 0x0000ff, 0x00ffff);
    this.wire.geometry = this.buildMesh(this.width, this.height, this.segments, []);

    this.wire.scale = new THREE.Vector3(1, 1, 1);
    this.wire.material.wireframe = false;
    this.wire.position.z = 1;

    this.pos = new THREE.Vector3(0, 3, -3);
    this.update();

    this.fire = false;
}

Laser.prototype = new GameObject();
Laser.prototype.constructor = Laser;

Laser.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);

    this.waveAngle += 0.5;
    this.wireMat.opacity = 0.5 + Math.random() * 0.5;

    if (this.fire) {
        this.width += 0.5;
        if (this.width > this.maxWidth) this.width = this.maxWidth;

    } else {
        this.width -= 1;
        if (this.width < 0)this.width = 0;
    }
    this.fire = false;
};

Laser.prototype.setPos = function (pos) {
    var x = 0;
    var dx = 0;
    var len = this.points.length;
    var w = 0;

    for (var i = 0; i < len; i++) {
        x = this.points[i].x;
        dx = ( pos.x - x );
        this.points[i].x += dx * (0.04 + 0.96 * Math.pow((len - i) / len, 2));
    }

    this.animateGeometry(this.solid.geometry, this.width, pos);
    this.animateGeometry(this.wire.geometry, this.width * 0.6, pos);
};

Laser.prototype.animateGeometry = function (geometry, width, pos) {
    for (var i = 0; i < this.points.length; i++) {
        if (i % 2 == 0) w = width * 0.6 + (width * 0.4 * (Math.sin(this.waveAngle - i)));
        if (i == 0) w = width * 0.25;

        geometry.vertices[i * 2].x = this.points[i].x - w;
        geometry.vertices[i * 2].y = pos.y + this.points[i].y;

        geometry.vertices[i * 2 + 1].x = this.points[i].x + w;
        geometry.vertices[i * 2 + 1].y = pos.y + this.points[i].y;
    }
    geometry.verticesNeedUpdate = true;
};

Laser.prototype.buildMesh = function (width, height, segments, points) {
    var geometry = new THREE.Geometry();
    geometry.dynamic = true;

    var h = height / segments;

    geometry.vertices.push(new THREE.Vector3(-width, 0, 0));
    geometry.vertices.push(new THREE.Vector3(width, 0, 0));
    points.push(new THREE.Vector3(0, 0, 0));

    for (var i = 0; i < this.segments * 2; i += 2) {
        geometry.vertices.push(new THREE.Vector3(-width, (i + 1) * h, 0));
        geometry.vertices.push(new THREE.Vector3(width, (i + 1) * h, 0));

        geometry.faces.push(new THREE.Face4(i + 0, i + 1, i + 3, i + 2));

        points.push(new THREE.Vector3(0, (i + 1) * h, 0));
    }

    geometry.computeBoundingSphere();

    return geometry;
};