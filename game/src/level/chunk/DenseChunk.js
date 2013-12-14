/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 4/27/13
 * Time: 7:50 PM
 */

function DenseChunk(level){
    Chunk.call(this, level);
}

DenseChunk.prototype = new Chunk();
DenseChunk.prototype.constructor = IntroChunk;

DenseChunk.prototype.build = function() {
    this.items = [
        {time:0.0, action:function(game){ game.enableKey(3) } },
        // camera Vector3 pos, Vector3 target default is (0,-200, 200) --> (0,0,0)
				
		{time:0.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(200,800,0), 5, 0) ) } },
        {time:0.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(200,800,0), 5, 0) ) } },
        {time:1.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(200,800,0), 5, 5) ) } },

        {time:1.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(-200,800,0), 5, 1) ) } },
        {time:2.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(-200,800,0), 5, 1) ) } },
		{time:2.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(-200,800,0), 5, 6) ) } },

        {time:3.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(100,800,0), 5, 2) ) } },
        {time:3.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(100,800,0), 5, 2) ) } },
        {time:4.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(100,800,0), 5, 7) ) } },
       
        {time:4.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(250,800,0), 5, 3) ) } },
        {time:5.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(250,800,0), 5, 3) ) } },
		{time:5.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(250,800,0), 5, 8) ) } },

		{time:8, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(-10,800,0), 5, 2),
            new Baddie(new THREE.Vector3(10,850,0), 5, 5),
            new Baddie(new THREE.Vector3(-10,900,0), 5, 8) ])}},
            
        {time:11, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(-210,800,0), 5, 11),
            new Baddie(new THREE.Vector3(-200,850,0), 5, 10),
            new Baddie(new THREE.Vector3(-210,900,0), 5, 7) ])}},
            
        {time:14, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(210,800,0), 5, 0),
            new Baddie(new THREE.Vector3(200,850,0), 5, 3),
            new Baddie(new THREE.Vector3(210,900,0), 5, 2) ])}},

        // pass game object controller, game.
        // basic baddies: pos, size, note(0-14)	
		
        // reset camera to default position. (time)
        {time:16.0, action:function(game){ game.defaultCamera(1.5)} },

        // this is an easy way to add 'padding' to the end of a chunk
        {time:18.0, action:function(game){ }}
    ];
};

//7 10 5
//11 12 10
//2 6 5

