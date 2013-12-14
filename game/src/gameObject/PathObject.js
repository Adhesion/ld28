function PathObject(p) {
    GameObject.call(this, new THREE.CubeGeometry(10,10,10,1,1,1), 0xff0000, 0xff0000);
    this.pos.x = p.x;
    this.pos.y = p.y;
    this.pos.z = p.z;
}

PathObject.prototype = new GameObject();
PathObject.prototype.constructor = PathObject;

PathObject.prototype.update = function (dt) {
    GameObject.prototype.update.call(this, dt);

   // this.rotation.x += dt;
    //this.rotation.y += dt;
    //this.rotation.z += dt;
};
