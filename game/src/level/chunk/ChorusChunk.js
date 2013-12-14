/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 4/27/13
 * Time: 7:50 PM
 */

function ChorusChunk(level){
    Chunk.call(this, level);
}

ChorusChunk.prototype = new Chunk();
ChorusChunk.prototype.constructor = IntroChunk;

ChorusChunk.prototype.build = function() {
    this.items = [
       
       {time:0.0, action:function(game){
        	game.bossAppear(new THREE.Vector3(100, 500, 0))
        	game.bossMove(new THREE.Vector3(700, 0, 0)) } },
            
        {time:0.0, action:function(game){ game.enableKey(3) } },
        {time:0.0, action:function(game){ game.enableKey(4) } },
        
        {time:1.0, action:function(game){ game.moveCamera(new THREE.Vector3(-200, -75, 175), new THREE.Vector3(300,0,0), 2.5) } },

        
        {time:5.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), .5, 14) ) } },
		{time:5.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), 5, 8) ) } },
		{time:6.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), 5, 4) ) } },
        
        {time:7.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), 5, 0) ) } },
		{time:8.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), 5, 5) ) } },
		{time:8.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700,0,0), .5, 14) ) } },
        
        {time:10.0, action:function(game){ game.bossMove(new THREE.Vector3(700, -100, 50)) } },
        {time:10.5, action:function(game){ game.moveCamera(new THREE.Vector3( -200, -75, 175), new THREE.Vector3(300,-50,25), 1.5) } },
        
		{time:12.0, action:function(game){ game.makeBossLinkedBaddies( [
            new Baddie(new THREE.Vector3(700, -100, 50), 5, 7),
            new Baddie(new THREE.Vector3(750, -120, 50), .5, 10),
            new Baddie(new THREE.Vector3(800, -100, 50), .5, 11),
            new Baddie(new THREE.Vector3(850, -120, 50), .5, 14) ])}},    

		{time:15.5, action:function(game){ game.bossMove(new THREE.Vector3(600, -400, 0)) } },
        {time:10.5, action:function(game){ game.moveCamera(new THREE.Vector3( -200, -75, 175), new THREE.Vector3(300,-50,25), 1.5) } },
        
    	{time:16.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -150, 0), 5, 10) ) } },
		{time:16.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -200, 0), .5, 11) ) } },
		{time:17.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -250, 0), .5, 12) ) } },
        {time:17.5, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -300, 0), .5, 13) ) } },
		{time:18.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -350, 0), .5, 14) ) } },
    
    	{time:22.0, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(600, -400, 0), 5, 3),
            new Baddie(new THREE.Vector3(650, -420, 0), 5, 8),
            new Baddie(new THREE.Vector3(700, -440, 0), .5, 13) ])}},
    
		{time:25.0, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(600, -400, 0), 5, 7),
            new Baddie(new THREE.Vector3(650, -420, 0), .5, 10),
            new Baddie(new THREE.Vector3(700, -440, 0), .5, 13),
            new Baddie(new THREE.Vector3(750, -460, 0), .5, 14),
            new Baddie(new THREE.Vector3(800, -480, 0), .5, 12) ])}},
		
		{time:27.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -400, 0), 5, 5) ) } },
		{time:28.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -400, 0), 5, 4) ) } },
		{time:29.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -400, 0), 5, 3) ) } },
        {time:30.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -400, 0), 5, 2) ) } },
		{time:31.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(600, -400, 0), 5, 1) ) } },
		
		{time:34.0, action:function(game){ game.makeLinkedBaddies( [
            new Baddie(new THREE.Vector3(600,-400,0), 5, 2),
            new Baddie(new THREE.Vector3(650,-420,0), 5, 7),
            new Baddie(new THREE.Vector3(700,-440,0), .5, 12) ])}},
		
		{time:35.0, action:function(game){ game.bossMove(new THREE.Vector3(700, -100, 50)) } },
        {time:35.5, action:function(game){ game.moveCamera(new THREE.Vector3( -200, -75, 175), new THREE.Vector3(300,-50,25), 1.5) } },
		
		{time:37.0, action:function(game){ game.makeBossLinkedBaddies( [
            new Baddie(new THREE.Vector3(700,-100,0), .5, 9),
            new Baddie(new THREE.Vector3(750,-120,0), 5, 6),
            new Baddie(new THREE.Vector3(800,-100,0), 5, 2),
            new Baddie(new THREE.Vector3(850,-120,0), 5, 3),
            new Baddie(new THREE.Vector3(900,-100,0), 5, 0) ])}},
		
		{time:41.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700, -100, 50), 5, 7) ) } },
		{time:42.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700, -100, 50), .5, 10) ) } },
        {time:43.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700, -100, 50), .5, 11) ) } },
		{time:44.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(700, -100, 50), .5, 14) ) } },
		
        // reset camera to default position. (time)

        // this is an easy way to add 'padding' to the end of a chunk
        {time:46.0, action:function(game){ }}
    ];
};

/*
7 10 13 14 12
9 6 2 3 0
7 10 11 14
*/