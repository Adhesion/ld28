function Tube() {
    GameObject.call(this, this.buildMesh(), 0xf2e85c, 0xdbd14c);
    this.pos.y = -70;
}

Avatar.prototype = new GameObject();
Avatar.prototype.constructor = Tube;

Tube.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);
};

Tube.prototype.makePath = function () {
    var path = [];

    var x = 0;
    var y = 0;
    var z = 0;

    for( var i=0; i< 100; i++){
        path.push( new THREE.Vector3( x, y, z) );
        x += Math.random() * 50 - 25;
        y += 100;
        z += Math.random() * 50 - 25;
    }

    return path;
};

Tube.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    this.path = this.makePath();

    var w = 100;
    var v = 0;

    for( var i=0; i<this.path.length; i++ ){

        var v0 = new THREE.Vector3( -w, 0, -w);
        var v1 = new THREE.Vector3( w, 0, -w);
        var v2 = new THREE.Vector3( -w, 0, w);
        var v3 = new THREE.Vector3( w, 0, w);

        if( i > 0 ){
            // rotate segment.
            var a = this.path[i-1];
            var b = this.path[i];

            var m = new THREE.Matrix4();
            m.makeRotationZ( Math.atan2(b.y - a.y,b.x - a.x) - Math.PI * 0.5);
            m.makeRotationX( Math.atan2(b.y - a.y,b.z - a.z) - Math.PI * 0.5);

            v0.applyMatrix4(m);
            v1.applyMatrix4(m);
            v2.applyMatrix4(m);
            v3.applyMatrix4(m);
        }

        geometry.vertices.push( v0.addVectors(v0, this.path[i]) );
        geometry.vertices.push( v1.addVectors(v1, this.path[i]) );
        geometry.vertices.push( v2.addVectors(v2, this.path[i]) );
        geometry.vertices.push( v3.addVectors(v3, this.path[i]) );

        if( i > 0 ){
            // make triangles.
            v = geometry.vertices.length - 8;

            //bottom
            geometry.faces.push( new THREE.Face3(v+0, v+5, v+4, new THREE.Vector3( 0, 0, 1 )) );
            geometry.faces.push( new THREE.Face3(v+0, v+1, v+5, new THREE.Vector3( 0, 0, 1 )) );

            //right
            geometry.faces.push( new THREE.Face3(v+1, v+7, v+5, new THREE.Vector3( 0, 0, 1 )) );
            geometry.faces.push( new THREE.Face3(v+1, v+3, v+7, new THREE.Vector3( 0, 0, 1 )) );

            //top
            geometry.faces.push( new THREE.Face3(v+3, v+2, v+7, new THREE.Vector3( 0, 0, 1 )) );
            geometry.faces.push( new THREE.Face3(v+2, v+6, v+7, new THREE.Vector3( 0, 0, 1 )) );

            //left
            geometry.faces.push( new THREE.Face3(v+0, v+4, v+6, new THREE.Vector3( 0, 0, 1 )) );
            geometry.faces.push( new THREE.Face3(v+0, v+6, v+2, new THREE.Vector3( 0, 0, 1 )) );
        }
    }

    geometry.computeBoundingSphere();

    return geometry;
};
