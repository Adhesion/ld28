/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 12/15/13
 * Time: 8:08 PM
 */

EndRoom = function () {
    this.holder = new THREE.Object3D();

    this.objects = [];

    var scale = 100;
    var x = 9;
    var y = 3;
    var z = 4;
    var spacing = 3;
    
    for(var i = 0; i < x; i++) {
    	
   	 	for(var j = 0; j < z; j++) {
    		
    		for( var k = 0; k < y; k++) {
    				
    				//randomly replace (groupSize * 2) bricks with bombs 
    				//randomly replace (groupSize * 4) bricks with gems
    				
    				//something is wonky with positioning, it seems slightly random each time
    					//if you can, see if you can center the group in the room


                    var obj = new EndRoomObject( "brick",
                                                        new THREE.Vector3( i * scale * spacing - (scale * x * .5 * spacing),
                                                        5000 + k * scale * spacing * 2,
                                                        j * scale * spacing - (scale * z * .5 * spacing) )) ;
    				this.holder.add(obj.mesh);
                    this.objects.push(obj);
            }
    	}
    }

    var materials = [
        new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:false, shading: THREE.FlatShading }),
        new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    var endWall = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry(4000,200,2000,1,1,1), materials );
    endWall.position.x = 0;
    endWall.position.y = 8000;
    endWall.position.z = 0;
    this.holder.add(endWall);

};

EndRoom.prototype = {
    init:function () {
        //TODO: init
    },
    update:function (delta) {
        //TODO: init
    }
};