/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 4/27/13
 * Time: 7:50 PM
 */

function SparseChunk(level){
    Chunk.call(this, level);
}

SparseChunk.prototype = new Chunk();
SparseChunk.prototype.constructor = IntroChunk;

SparseChunk.prototype.build = function() {
    this.items = [
        //camera Vector3 pos, Vector3 target default is (0,-200, 200) --> (0,0,0)

		{time:2.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 5, 0) ) } },
		{time:2.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 5, 0) ) } },
		{time:3.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 2, 0) ) } },


		{time:5.0, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(-200,800,0), 5, 5),
            new Baddie(new THREE.Vector3(-220,850,0), 5, 2),
            new Baddie(new THREE.Vector3(-200,900,0), 5, 5),
            new Baddie(new THREE.Vector3(-220,950,0), 5, 1) ])}},
		
		{time:8.0, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(200,800,0), 5, 2),
            new Baddie(new THREE.Vector3(220,850,0), 5, 6),
            new Baddie(new THREE.Vector3(200,900,0), 5, 5),
            new Baddie(new THREE.Vector3(220,950,0), 5, 1) ])}},
		
		{time:11.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 5, 11) ) } },
		{time:12.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 5, 12) ) } },
		{time:13.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,800,0), 5, 10) ) } },
		
        // reset camera to default position. (time)
        {time:14.0, action:function(game){ game.defaultCamera(1.5)} },

        // this is an easy way to add 'padding' to the end of a chunk
        {time:16.0, action:function(game){ }}
    ];
};

//7 10 5
//11 12 10
//2 6 5

