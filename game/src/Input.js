function Input() {
    this.up = this.left = this.down = this.right = this.space = false;

    this.a = this.s = this.d = this.f = this.g = false;
    this.z = this.x = this.c = this.v = this.b = this.n = false

    this.move = new THREE.Vector3(0, 0, 0);

    // :( javascript is so gross.
    var self = this;
    document.onkeydown = function (event) {
        self.keyDown(event);
    };
    document.onkeyup = function (event) {
        self.keyUp(event);
    };
}

Input.prototype.keyDown = function (event) {
    this.checkKeys(event.keyCode, true);
};

Input.prototype.keyUp = function (event) {
    this.checkKeys(event.keyCode, false);
};

Input.prototype.checkKeys = function (keycode, val) {
    //console.log(keycode);

    if (keycode == 32) this.space = val;
    if (keycode == 37) this.left = val;
    if (keycode == 39) this.right = val;
    if (keycode == 38) this.up = val;
    if (keycode == 40) this.down = val;

    if (keycode == 65) this.a = val;
    if (keycode == 83) this.s = val;
    if (keycode == 68) this.d = val;
    if (keycode == 70) this.f = val;
    if (keycode == 71) this.g = val;

    if (keycode == 90) this.z = val;
    if (keycode == 88) this.x = val;
    if (keycode == 67) this.c = val;
    if (keycode == 86) this.v = val;
    if (keycode == 66) this.b = val;
    if (keycode == 78) this.n = val;
};