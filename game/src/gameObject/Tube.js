function Tube() {
	/*
    GameObject.call(this, {
		geometry: this.buildMesh(),
		color: 0xf2e85c,
		wireColor: 0xdbd14c,
		doubleSided: false
	});
*/

    this.lastRoom = 50;

    var materials = [
        new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, transparent: true } ),
        new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    this.wire = THREE.SceneUtils.createMultiMaterialObject( this.buildMesh(), materials );

    this.pos = new THREE.Vector3(0, 0, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);

    this.holder = new THREE.Object3D();
    this.holder.add(this.wire);
    this.timeMult = 1;
    this.alive = true;



    var pathGeo = new THREE.Geometry();
    var pathMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1.0  });
    for(var i = 0; i < this.path.length; i++) {
        pathGeo.vertices.push( new THREE.Vector3().copy(this.path[i]) );
    }
    this.pathLine = new THREE.Line( pathGeo, pathMat );
    this.holder.add(this.pathLine);


    this.objects = [];
    this.makeObjects();
}

Tube.prototype = Object.create(GameObject.prototype);
Tube.prototype.constructor = Tube;

Tube.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);
};

Tube.prototype.makeObjects = function () {

    for( var i=0; i<this.path.length; i++ ){

        if( i >= this.path.length -  this.lastRoom){

            x=z=0;
        }else{
            if(Math.random() > 0.6){

                var progress = i/this.path.length;
                var c = new THREE.Color( 0xf2e85c );
                c.setHSL((1-progress)*0.2 + 0.0,1,0.4);
                var materials = [
                    new THREE.MeshBasicMaterial({ color:c.getHex(), wireframe:false, shading: THREE.FlatShading }),
                    new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
                ];

                var h = 40 + Math.random() * 40;
                var obj = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry(700,60,h,1,1,1), materials );
                obj.position.x = this.path[i].x + Math.random()* 200 - 100;
                obj.position.y = this.path[i].y;
                obj.position.z = this.path[i].z + Math.random()* 200 - 100;
                obj.rotation.y = Math.random() * Math.PI * 2;
                this.holder.add(obj);
                this.objects.push(obj);
            }
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
    this.tubeLength = new THREE.Vector3();

    var segments = 200 + this.lastRoom;

    for( var i=0; i< segments; i++){

        path.push( new THREE.Vector3( x, y, z ) );

        if( i < segments -  this.lastRoom){
            //dont try to turn!
            if(Math.random() > 0.9){
                //turn.
                if(Math.random() > 0.5) d = 200 + Math.round( Math.random() * 3 ) * 100;
                v.x = Math.random() * d - d*0.5;
                v.y = d;
                v.z = Math.random() * d - d*0.5;
            }
        }

        x += v.x;
        y += v.y;
        z += v.z;

        this.tubeLength.add(v);
    }

    return path;
};

Tube.prototype.buildMesh = function () {
    var geometry = new THREE.Geometry();

    this.path = this.makePath();

    var v = 0;

    for( var i=0; i<this.path.length; i++ ){

        var w = 150 + Math.random() * 50;

        if( i >= this.path.length -  this.lastRoom){
            var roomi = i+ this.lastRoom - this.path.length;
            //boss area, make it really big!
            w = 150 + Math.sin(Math.PI * (roomi/( this.lastRoom-1))) * 4000;
        }
        if( i == this.path.length-1) w = 0;

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

            var progress = i/this.path.length;
            var c = new THREE.Color( 0xf2e85c );
            c.setHSL((1-progress)*0.2 + 0.0,1,0.3);


            //bottom
            geometry.faces.push( new THREE.Face3(v+0, v+5, v+4, new THREE.Vector3( 0, 0, 1 ), c) );
            geometry.faces.push( new THREE.Face3(v+0, v+1, v+5, new THREE.Vector3( 0, 0, 1 ), c) );

            //right
            geometry.faces.push( new THREE.Face3(v+1, v+7, v+5, new THREE.Vector3( 0, 0, 1 ), c) );
            geometry.faces.push( new THREE.Face3(v+1, v+3, v+7, new THREE.Vector3( 0, 0, 1 ), c) );

            //top
            geometry.faces.push( new THREE.Face3(v+3, v+2, v+7, new THREE.Vector3( 0, 0, 1 ), c) );
            geometry.faces.push( new THREE.Face3(v+2, v+6, v+7, new THREE.Vector3( 0, 0, 1 ), c) );

            //left
            geometry.faces.push( new THREE.Face3(v+0, v+4, v+6, new THREE.Vector3( 0, 0, 1 ), c) );
            geometry.faces.push( new THREE.Face3(v+0, v+6, v+2, new THREE.Vector3( 0, 0, 1 ), c) );
        }
    }

    geometry.computeFaceNormals();
    geometry.computeBoundingSphere();

    return geometry;
};
