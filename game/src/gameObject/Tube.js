function Tube() {
	GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xdbd14c,
		doubleSided: false
	});
	this.pos.y = -70;

    this.objects = [];
    this.makeObjects();

}

Tube.prototype = Object.create(GameObject.prototype);
Tube.prototype.constructor = Tube;

Tube.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);
};

Tube.prototype.makeObjects = function () {

    var mat = new THREE.MeshBasicMaterial({
        color:0xf2e85c,
        wireframe:false,
        shading: THREE.FlatShading
    });

    for( var i=0; i<this.path.length; i++ ){
       if(Math.random() > 0.8){
           var h = 30 + Math.random() * 30;
           var obj = new THREE.Mesh( new THREE.CubeGeometry(500,50,h,1,1,1) , mat);
           obj.position.x = this.path[i].x + Math.random()* 200 - 100;
           obj.position.y = this.path[i].y;
           obj.position.z = this.path[i].z + Math.random()* 200 - 100;
           obj.rotation.y = Math.random() * Math.PI * 2;
           this.holder.add(obj);
           this.objects.push(obj);
       }
    }


}

Tube.prototype.makePath = function () {
    var path = [];

    var x = 0;
    var y = 0;
    var z = 0;

    var d = 400;
    var v = new THREE.Vector3( 0, d ,0 );

    for( var i=0; i< 1000; i++){

        path.push( new THREE.Vector3( x, y, z ) );

        if(Math.random() > 0.9){
            //turn.
            if(Math.random() > 0.5) d = 200 + Math.round( Math.random() * 3 ) * 100;
            v.x = Math.random() * d - d*0.5;
            v.y = d;
            v.z = Math.random() * d - d*0.5;
        }

        x += v.x;
        y += v.y;
        z += v.z;
    }

    return path;
};

Tube.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    this.path = this.makePath();

    var v = 0;

    for( var i=0; i<this.path.length; i++ ){

        var w = 100 + Math.random() * 50;
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
            m.makeRotationY( Math.random() * Math.PI * 0.25 );

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
