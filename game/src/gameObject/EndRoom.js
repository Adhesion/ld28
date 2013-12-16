/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 12/15/13
 * Time: 8:08 PM
 */

EndRoom = function () {
    this.holder = new THREE.Object3D();


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
    }
};