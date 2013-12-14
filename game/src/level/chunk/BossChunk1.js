/**
 * Created with JetBrains WebStorm.
 * User: Roushey
 * Date: 4/27/13
 * Time: 7:50 PM
 */

function BossChunk1(level){
    Chunk.call(this, level);
}

BossChunk1.prototype = new Chunk();
BossChunk1.prototype.constructor = IntroChunk;

BossChunk1.prototype.build = function() {
    this.items = [

        // make boss appear, and move to a location
        {time:1.0, action:function(game){
            game.bossAppear(new THREE.Vector3(0, -1000, 0))
            game.bossMove(new THREE.Vector3(0, -700, 0)) } },

        {time:2.0, action:function(game){ game.moveCamera(new THREE.Vector3( 0, 200, 200), new THREE.Vector3(100,-700,0), 1.0) } },

        {time:2.0, action:function(game){ game.makeBaddie( new Baddie(new THREE.Vector3(0,-700,0), 10, 0) ) } },

        // baddies linked to boss
        {time:3.0, action:function(game){ game.makeBossLinkedBaddies( [
            new Baddie(new THREE.Vector3(0,-700,0), 10, 0),
            new Baddie(new THREE.Vector3(0,-750,0), 10, 0),
            new Baddie(new THREE.Vector3(0,-800,0), 10, 0),
            new Baddie(new THREE.Vector3(0,-850,0), 10, 0),
            new Baddie(new THREE.Vector3(0,-900,0), 10, 0) ])}},


        {time:10.0, action:function(game){ game.bossMove(new THREE.Vector3(700, 0, 0)) } },
        {time:11.0, action:function(game){ game.moveCamera(new THREE.Vector3( -300, 0, 200), new THREE.Vector3(500,0,0), 2.0) } },


        // baddies linked to boss
        {time:16.0, action:function(game){ game.makeBossLinkedBaddies( [
            new Baddie(new THREE.Vector3(700,0,0), 10, 0),
            new Baddie(new THREE.Vector3(750,0,0), 10, 0),
            new Baddie(new THREE.Vector3(800,0,0), 10, 0),
            new Baddie(new THREE.Vector3(850,0,0), 10, 0),
            new Baddie(new THREE.Vector3(900,0,0), 10, 0) ])}},


        {time:20.0, action:function(game){ game.bossMove(new THREE.Vector3(700, -700, 0)) } },

        // don't render the boss
        // should probably move it out of camera first XD
        // ill probably add a 'teleport spacejump' effect thing for when this happens.
        {time:25.0, action:function(game){ game.bossHide()} },

        // reset camera to default position. (time)
        {time:23.0, action:function(game){ game.defaultCamera(1.5)} },

        // this is an easy way to add 'padding' to the end of a chunk
        {time:27.0, action:function(game){ }}
    ];
};
