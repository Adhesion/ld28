/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 4/27/13
 * Time: 7:50 PM
 */

function Chunk(level){
    this.level = level;
    this.time = 0;
    this.complete = false;
    this.items = [];

    this.build();
    this.resetItems();
}

Chunk.prototype.start = function(t) {
    this.time = t;
    this.resetItems();
};

Chunk.prototype.update = function(dt) {
    this.time += dt;

    var complete = true;

    for( var i=0; i<this.items.length; i++){
        if( this.time >= this.items[i].time && this.items[i].complete != true ){
            this.level.doItem(this.items[i]);
            this.items[i].complete = true;
        }
        if(this.items[i].complete != true ) complete = false;
    }

    if( complete ){
        this.level.chunkComplete(0);
    }
};

Chunk.prototype.build = function() {
    // super class implement
};

Chunk.prototype.resetItems = function() {
    for( var i=0; i<this.items.length; i++){
        this.items[i].complete = false;
    }
};