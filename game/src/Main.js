/* Some dumb shim shamelessly stolen from
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

var Shaders = {
	DotShader : {
		uniforms: {
			"tDiffuse": { type: "t", value: null },
			"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
			"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
			"angle":    { type: "f", value: 1.57 },
			"scale":    { type: "f", value: 1.0 }
		},
		vertexShader: [
			"varying vec2 vUv;",
			"void main() {",
				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"
		].join("\n"),
		fragmentShader: [
			"uniform vec2 center;",
			"uniform float angle;",
			"uniform float scale;",
			"uniform vec2 tSize;",
			"uniform sampler2D tDiffuse;",
			"varying vec2 vUv;",

			"float pattern() {",
				"float s = sin( angle ), c = cos( angle );",
				"vec2 tex = vUv * tSize - center;",
				"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",
				"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",
			"}",

			"void main() {",
				"vec4 color = texture2D( tDiffuse, vUv );",
				"float average = ( color.r + color.g + color.b ) / 3.0;",
				"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",
			"}"
		].join("\n")
	}
}

function Loader() {
	this.assets = {};
};

Loader.prototype.load = function( assets ) {
	var self = this;
	loaders = {
		img: function( asset, name ) {
			var image = THREE.ImageUtils.loadTexture(
				name,
				undefined,
				function( image ) {
					self.assets[name] = image;
				},
				function( error ) {
					console.error( error );
				}
			);
		},
		audio: function( asset, name ) {
			var settings = {};
			var audio;
			if( asset.volume ) settings.volume = asset.volume;
			if( asset.buffer ) settings.buffer = asset.buffer;
			settings.urls = asset.urls;
			settings.onload = function( ) {
				self.assets[name] = this;
				if( asset.callback)
					asset.callback( this );
			}
			audio = new Howl( settings );
		},
		model: function( asset, name ) {
			var modelLoader = new THREE.JSONLoader();
			modelLoader.load( name,
				function(geo) {
					self.assets[name] = geo;
				}
			);
		}
	};

	for( var i = 0; i < assets.length; i ++ ) {
		var asset = assets[i];
		loader = loaders[asset.type];
		loader( asset, asset.name );
	}
};

Loader.prototype.done = function( assets ) {
	for( var asset in assets ) {
		if( ! this.assets[assets[asset].name] ) {
			return false;
		}
	}
	return true;
};

Loader.prototype.get = function( name ) {
	var value = this.assets[name];
	if( ! value ) {
		throw "Unknown asset " + name;
	}
	return value;
};


/** The main game object. Houses renderer, gamestate, etc. */
function Main() {
	var self = this;
	this.renderer = new THREE.WebGLRenderer({
		antialias: true
	});

	this.controllers = [];
	this.callback = this.update.bind( this );

	this.settings = {};
	window.location.href.replace(
		/[?&]+([^=&]+)=([^&]*)/gi,
		function(m,key,value) {
			self.settings[key] = value;
		}
	);

	this.container = document.createElement('div');
	this.container.setAttribute('class', 'game');
	this.container.appendChild(this.renderer.domElement);
	this.operations = [];
	document.body.appendChild(this.container);
	window.onresize = this.resize.bind( this );

	window.main = this;
	window.game_score = 0;
	window.game_win = false;

	this.setState( new Loading() );

	this.loader = new Loader();
	this.loader.load( this.getAssets() );

	// start the shit
	this.lastFrame = Date.now();
	this.resize();
	this.update();

}

Main.prototype.getAssets = function() {
	var hitAsset = function( base, prefix, vol ) {
		return {
			name: "sound/" + (prefix || "") + "hit" + base,
			volume: vol || 0.27,
			urls: [
				"sound/" + (prefix || "") + "hit" + base + ".mp3",
				"sound/" + (prefix || "") + "hit" + base + ".ogg"
			],
			type: 'audio',
			callback: function( audio ) {
				if( !prefix ) {
					window.hitSounds = window.hitSounds || [];
					window.hitSounds[base] = audio;
				}
			}
		};
	};

	return [
		{ name: "sound/radmarslogo", urls: ['sound/radmarslogo.mp3', 'sound/radmarslogo.ogg'], type: 'audio', volume: 0.9, buffer: true },
		{ name: "sound/ld26", urls: ['sound/ld26.mp3', 'sound/ld26.ogg'], type: 'audio', volume: 0.95, buffer: true },
		{ name: "sound/bosshit", urls: ['sound/bosshit.mp3', 'sound/bosshit.ogg'], type: 'audio', volume: 0.5, buffer: true },
		{ name: "sound/bossdeath", urls: ['sound/bossdeath.mp3', 'sound/bossdeath.ogg'], type: 'audio', volume: 0.9, buffer: true },
		{ name: "sound/miss", urls: ['sound/miss.mp3', 'sound/miss.ogg'], type: 'audio', volume: 0.4, buffer: true },
		{ name: "sound/misfire", urls: ['sound/misfire.mp3', 'sound/misfire.ogg'], type: 'audio', volume: 0.5, buffer: true },
		{ name: "sound/gameover-lose", urls: ['sound/gameover-lose.mp3', 'sound/gameover-lose.ogg'], type: 'audio', volume: 0.9, buffer: true },
		{ name: "sound/gameover-win", urls: ['sound/gameover-win.mp3', 'sound/gameover-win.ogg'], type: 'audio', volume: 0.9, buffer: true },
		{ name: "sound/intro", urls: ['sound/intro.mp3', 'sound/intro.ogg'], type: 'audio', volume: 0.9, buffer: true },

		hitAsset( 0 ),
		hitAsset( 1 ),
		hitAsset( 2 ),
		hitAsset( 3 ),
		hitAsset( 4 ),
		hitAsset( 5 ),
		hitAsset( 6 ),
		hitAsset( 7 ),
		hitAsset( 8 ),
		hitAsset( 9 ),
		hitAsset( 10 ),
		hitAsset( 11 ),
		hitAsset( 12 ),
		hitAsset( 13 ),
		hitAsset( 14 ),
		hitAsset( 0, "player", 0.35 ),
		hitAsset( 1, "player", 0.35 ),
		hitAsset( 2, "player", 0.35 ),
		hitAsset( 3, "player", 0.35 ),
		hitAsset( 4, "player", 0.35 ),
		hitAsset( 0, "chain", 0.3 ),
		hitAsset( 1, "chain", 0.3 ),
		hitAsset( 2, "chain", 0.3 ),
		hitAsset( 3, "chain", 0.3 ),
		hitAsset( 4, "chain", 0.3 ),
		{ name: 'assets/gameover/gameover.png', type: 'img', },
		{ name: 'assets/intro/intro_bg.png', type: 'img', },
		{ name: 'assets/intro/intro_glasses1.png', type: 'img' },
		{ name: 'assets/intro/intro_glasses2.png', type: 'img' },
		{ name: 'assets/intro/intro_glasses3.png', type: 'img' },
		{ name: 'assets/intro/intro_glasses4.png', type: 'img' },
		{ name: 'assets/intro/intro_radmars1.png', type: 'img' },
		{ name: 'assets/intro/intro_radmars2.png', type: 'img' },
		{ name: 'assets/intro/intro_mars.png', type: 'img' },

        { name: 'assets/skybox/back.png', type: 'img' },
        { name: 'assets/skybox/bot.png', type: 'img' },
        { name: 'assets/skybox/front.png', type: 'img' },
        { name: 'assets/skybox/left.png', type: 'img' },
        { name: 'assets/skybox/right.png', type: 'img' },
        { name: 'assets/skybox/top.png', type: 'img' },

		{ name: 'assets/hud/note0.png', type: 'img' },
		{ name: 'assets/hud/note1.png', type: 'img' },
		{ name: 'assets/hud/note2.png', type: 'img' },
		{ name: 'assets/hud/note3.png', type: 'img' },
		{ name: 'assets/hud/note4.png', type: 'img' },

        { name: 'assets/hud/boss.png', type: 'img' },
        { name: 'assets/hud/boss_hp_bar.png', type: 'img' },
        { name: 'assets/hud/hp.png', type: 'img' },
        { name: 'assets/hud/hp_bar.png', type: 'img' },
        { name: 'assets/hud/hp_bar_bg.png', type: 'img' },

		{ name: 'assets/models/pyramid.js', type: 'model' },
        { name: 'assets/models/diamond.js', type: 'model' },
        { name: 'assets/models/tessitron_logo.js', type: 'model' },
        { name: 'assets/models/tessitron_text.js', type: 'model' },
        { name: 'assets/models/tritorus.js', type: 'model' },
        { name: 'assets/models/xena.js', type: 'model' },
        { name: 'assets/models/spikePlatonic.js', type: 'model' },

        { name: 'assets/models/boss_body.js', type: 'model' },
        { name: 'assets/models/boss_spikes.js', type: 'model' },
        { name: 'assets/models/boss_thinRing.js', type: 'model' },
        { name: 'assets/models/boss_fatRing.js', type: 'model' }
	];
};

Main.prototype.setState = function( state ) {
	if( this.state ) {
		this.state.onStop( this );
	}
	this.state = state;
	this.state.onStart( this );
};

Main.prototype.resize = function (event) {
	var width = window.innerWidth;
	var height = window.innerHeight;
	if( this.state.resize ) {
		this.state.resize( width, height );
	}
	this.renderer.setSize(width, height);
};

Main.prototype.update = function () {
    TWEEN.update();
    var op;
	while( op = this.operations.pop() ) {
		op(this);
	}

	var delta = Date.now() - this.lastFrame;
    this.lastFrame = Date.now();

	//update everything then render.
	for( var controller in this.controllers ) {
		this.controllers[controller].update( delta );
	}

	this.state.render( this );

	// and then request another frame draw
	requestAnimFrame( this.callback );
};

function GameState() {

};

GameState.prototype.resize = function( width, height ) {
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();
	this.uiController.resize( width, height );
}

GameState.prototype.onStart = function( game ) {
	this.game = game;

    this.game.renderer.setClearColor( 0x2e2e2e, 1 );

	this.scene = new THREE.Scene();
	game.loader.get("sound/ld26").play();
	game.renderer.autoClear = false;

	this.camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	this.camera.position.y = -200;
	this.camera.position.z = 200;
	this.camera.lookAt(new THREE.Vector3());

	this.bgController = new BackgroundController(this.scene);
	this.goController = new GameObjectController(game);
	this.uiController = new UIController(game);

	game.controllers.push(
		this.bgController,
		this.goController,
		this.uiController
	);

	if( game.settings.composer ) {
		this.composer = new THREE.EffectComposer( game.renderer );
		this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

		var effect = new THREE.ShaderPass( Shaders.DotShader );
		effect.uniforms[ 'scale' ].value = 4;
		effect.renderToScreen = true;
		this.composer.addPass( effect );

		// more passes?
	}

    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/right.png" ), fog:false }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/left.png" ), fog:false }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/top.png" ), fog:false }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/bot.png" ), fog:false }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/front.png" ), fog:false }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: game.loader.get( "assets/skybox/back.png" ), fog:false }));

    for (var i = 0; i < 6; i++){
        materialArray[i].side = THREE.BackSide;
    }
    var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyboxGeom = new THREE.CubeGeometry( 2000, 2000, 2000, 1, 1, 1 );
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );

    this.scene.add( skybox );

}

GameState.prototype.onStop = function( game ) {
	game.loader.get("sound/ld26").stop();
	game.controllers = [];
	game.renderer.autoClear = true;
}

GameState.prototype.render = function( game ) {
	game.renderer.clear();
	if( game.settings.composer ) {
		this.composer.render();
	}
	else {
		game.renderer.render( this.scene, this.camera );
	}
	game.renderer.render( this.uiController.scene, this.uiController.camera );
}

function Intro() {
}

Intro.prototype.render = function( game ) {
	game.renderer.render(this.scene, this.camera);
}

Intro.prototype.onStart = function( game ) {
	this.game = game;
	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera(
		0,
		window.innerWidth,
		0,
		window.innerHeight
	);
	this.controller = new IntroController( game, this.camera, this.scene );
	game.controllers.push( this.controller );
	game.loader.get("sound/radmarslogo").play();

    this.game.renderer.setClearColor( 0x000000, 1 );
};

Intro.prototype.resize = function( width, height ) {
	this.camera.right = width;
	this.camera.bottom = height;
	this.camera.updateProjectionMatrix();

	this.controller.resize( width, height );
}

Intro.prototype.onStop = function( game) {
	game.loader.get("sound/radmarslogo").stop();
	this.controller.onStop();
	game.controllers = [];
};

function IntroController( game, camera, scene ) {

	this.game = game;
	var glassesFiles = [
		'assets/intro/intro_glasses1.png',
		'assets/intro/intro_glasses2.png',
		'assets/intro/intro_glasses3.png',
		'assets/intro/intro_glasses4.png'
	];

	var textFiles = [
		'assets/intro/intro_mars.png',
		'assets/intro/intro_radmars1.png',
		'assets/intro/intro_radmars2.png',
	];

	this.textMaterials = textFiles.map(function( file ) {
		return new THREE.SpriteMaterial({
			map: game.loader.get( file ),
			useScreenCoordinates: true,
			alignment: THREE.SpriteAlignment.topLeft
		});
	});

	this.glassesMaterials = glassesFiles.map(function( file ) {
		return new THREE.SpriteMaterial({
			map: game.loader.get( file ),
			useScreenCoordinates: true,
			alignment: THREE.SpriteAlignment.topLeft
		});
	});

	this.cx = camera.right / 2;
	this.cy = camera.bottom / 2;

	this.textSprite = new THREE.Sprite( this.textMaterials[ 0 ] );
	this.textSprite.scale.set( 108, 28, 1 );

	this.glassesSprite = new THREE.Sprite( this.glassesMaterials[ 0 ] );
	this.glassesSprite.scale.set( 144, 24, 1 );

	var bgMaterial = new THREE.SpriteMaterial({
		map: this.game.loader.get( "assets/intro/intro_bg.png" ),
		useScreenCoordinates: true,
		alignment: THREE.SpriteAlignment.topLeft
	});

	this.bgSprite = new THREE.Sprite( bgMaterial );
	this.bgSprite.scale.set( 800, 600, 1 );

	this.counter = 0;

	document.onkeypress = function( e ) {
		if( e.keyCode == 13 ) {
			game.operations.push(function() {
				game.setState( new Splash() );
			});
		}
	};

	scene.add( this.bgSprite );
	scene.add( this.textSprite );
	scene.add( this.glassesSprite );
}

IntroController.prototype.resize = function( width, height ) {
	this.cx = width / 2;
	this.cy = height / 2;
}

IntroController.prototype.onStop = function() {
	document.onkeypress = function( e ) {
	};
}

IntroController.prototype.update = function( dt ) {
	this.counter += dt;

//	if( this.counter > 4000)
//		game.operations.push(function() {
//				game.setState( new GameState() );
//			});

	if( this.counter < 2000)
		this.textSprite.material = this.textMaterials[ 0 ];
	else if( this.counter < 2050) {
		this.textSprite.scale.set( 192, 28, 1 );
		this.textSprite.material = this.textMaterials[ 1 ];
	}
	else if( this.counter < 2600)
		this.textSprite.material = this.textMaterials[ 2 ];
	else if( this.counter < 2650)
		this.textSprite.material = this.textMaterials[ 1 ];
	else if( this.counter < 2700)
		this.textSprite.material = this.textMaterials[ 2 ];
	else if( this.counter < 2750)
		this.textSprite.material = this.textMaterials[ 1 ];
	else if( this.counter < 2800)
		this.textSprite.material = this.textMaterials[ 2 ];
	else if( this.counter < 2850)
		this.textSprite.material = this.textMaterials[ 1 ];
	else
		this.textSprite.material = this.textMaterials[ 2 ];

	if( this.counter < 2000)
		this.glassesSprite.position.y = ( this.cy - this.glassesSprite.scale.y / 2 ) * (this.counter/2000.0);
	else if( this.counter < 2150 )
		this.glassesSprite.material = this.glassesMaterials[ 1 ];
	else if( this.counter < 2300 )
		this.glassesSprite.material = this.glassesMaterials[ 2 ];
	else if( this.counter < 2550 )
		this.glassesSprite.material = this.glassesMaterials[ 3 ];
	else
		this.glassesSprite.material = this.glassesMaterials[ 0 ];

	this.bgSprite.position.set( this.cx - 800/2, this.cy - 600/2, 0 );
	this.textSprite.position.set( this.cx - 108/2 , 377, 0 );
	this.glassesSprite.position.x = this.cx - 144/2;

	this.textSprite.position.set(
		this.cx - this.textSprite.scale.x/2 ,
		this.cy - 28 / 2 + 80, 0
	);

    var game = this.game;
    if(this.counter > 5000){
        game.operations.push(function() {
            game.setState( new Splash() );
        });
    }
}

function GameOver() {
}

GameOver.prototype.render = function( game ) {
	game.renderer.render(this.scene, this.camera);
}

GameOver.prototype.onStart = function( game ) {
	this.game = game;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );
    this.scene.add( new THREE.AmbientLight( 0x222222 ) );
    this.game.renderer.setClearColor( 0x2e2e2e, 1 );

    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    this.camera.position.z = 100;
    this.camera.lookAt( new THREE.Vector3() );

    this.controller = new SplashController( game, this.camera, this.scene, true );
    game.controllers.push( this.controller );

    if(window.game_win == true){
        game.loader.get("sound/gameover-win").play();
    }else{
        game.loader.get("sound/gameover-lose").play();
    }

};

GameOver.prototype.resize = function( width, height ) {
	this.camera.right = width;
	this.camera.bottom = height;
	this.camera.updateProjectionMatrix();

	this.controller.resize( width, height );
}

GameOver.prototype.onStop = function( game) {
    game.loader.get("sound/gameover-win").stop();
    game.loader.get("sound/gameover-lose").stop();

	this.controller.onStop();
	game.controllers = [];
};



function Splash() {
}

Splash.prototype.render = function( game ) {
    game.renderer.render(this.scene, this.camera);
}

Splash.prototype.onStart = function( game ) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0x2e2e2e, 1, 2000 );
    this.scene.add( new THREE.AmbientLight( 0x222222 ) );
    this.game.renderer.setClearColor( 0x2e2e2e, 1 );

    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    this.camera.position.z = 100;
    this.camera.lookAt( new THREE.Vector3() );

    this.controller = new SplashController( game, this.camera, this.scene, false);
    game.controllers.push( this.controller );

    game.loader.get("sound/intro").loop(true);
    game.loader.get("sound/intro").play();

};

Splash.prototype.resize = function( width, height ) {
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    this.controller.resize( width, height );
}

Splash.prototype.onStop = function( game) {
    game.loader.get("sound/intro").stop();

    this.controller.onStop();
    game.controllers = [];
};

function SplashController( game, camera, scene, isGameover ) {
    this.game = game;

    this.camera = camera;

    this.sway = 0;

    this.cx = camera.right / 2;
    this.cy = camera.bottom / 2;

    var bgMaterial = new THREE.SpriteMaterial({
        map: this.game.loader.get( "assets/gameover/gameover.png" )
    });

    this.bgSprite = new THREE.Sprite( bgMaterial );
    this.bgSprite.scale.set( 545*0.5, 42*0.5, 1 );

    this.counter = 0;

    var text = window.main.loader.get("assets/models/tessitron_text.js");
    var logo = window.main.loader.get("assets/models/tessitron_logo.js");
    var tmat = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading  } );
    var lmat = new THREE.MeshPhongMaterial( { color: 0xf2e85c, shading: THREE.FlatShading  } );

    this.lm = new THREE.Mesh(logo, lmat);
    this.lm.rotation. x = Math.PI / 2;

    this.tm = new THREE.Mesh(text, tmat);
    this.tm.position.x = -65;
    this.tm.scale = new THREE.Vector3(2,2,2);

    this.textMesh = new THREE.Object3D();
    this.textMesh.add(this.tm);
    this.textMesh.position.y = -30;
    this.textMesh.position.z = 120;

    this.logoMesh = new THREE.Object3D();
    this.logoMesh.add(this.lm);
    this.logoMesh.position.y = 50;
    this.logoMesh.position.z = 120;


    new TWEEN.Tween(this.logoMesh.position).easing(TWEEN.Easing.Quadratic.Out).to({x: 0, y: 20, z:0}, 1.0*1000).start();
    new TWEEN.Tween(this.textMesh.position).easing(TWEEN.Easing.Quadratic.Out).to({x: 0, y: -5, z:0}, 1.5*1000).start();

    this.stars = [];

    this.starHolder = new THREE.Object3D();
    this.starHolder.rotation.x = Math.PI/2;

    for( var i=0; i<100; i++){
        var star = new Star();
        this.stars.push(star);
        this.starHolder.add(star.holder);
    }

    var scoreText = "" + window.game_score;
    var textGeom = new THREE.TextGeometry( scoreText,
        {
            size: 20, height: 4, curveSegments: 4,
            font: "helvetiker", style: "normal"
        });

    this.scoreMesh = new THREE.Mesh(textGeom, tmat );
    textGeom.computeBoundingBox();
    var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
    this.scoreMesh.position.set( -0.5 * textWidth, -40, 120 );


    new TWEEN.Tween(this.scoreMesh.position).easing(TWEEN.Easing.Quadratic.Out).to({x: -0.5 * textWidth, y: -15, z:0}, 1.5*1000).start();

    if(isGameover) scene.add(this.scoreMesh);
    else scene.add( this.textMesh );


    scene.add( this.bgSprite );
    scene.add( this.logoMesh );
    scene.add( this.starHolder );

    this.light1= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light1.position.set( 1000, 0, 0 );

    this.light2= new THREE.PointLight( 0xffffff, 2, 3000 );
    this.light2.position.set( 0, 1000, 0 );

    this.light3= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light3.position.set( 0, 0, 1000 );

    this.light4= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light4.position.set( 0, -1000, 0 );

    scene.add( this.light1 );
    scene.add( this.light2 );
    scene.add( this.light3 );
    scene.add( this.light4 );

    document.onkeypress = function( e ) {
        if( e.keyCode == 13 ) {
            game.operations.push(function() {
                game.setState( new GameState() );
            });
        }
    };

    this.blink = 0;

    this.resize( window.innerWidth, window.innerHeight );
}

SplashController.prototype.resize = function( width, height ) {
    this.cx = width / 2;
    this.cy = height / 2;


    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
}

SplashController.prototype.onStop = function() {

    document.onkeypress = function( e ) {
    };
}

SplashController.prototype.update = function( dt ) {
    this.counter += dt;


    this.sway += dt * 0.5 / 1000;
    if( this.sway > Math.PI * 2) this.sway -= Math.PI*2;


    this.logoMesh.rotation.x = this.sway;
    this.logoMesh.rotation.y = this.sway;
    this.logoMesh.rotation.z = this.sway;

    this.camera.position.x = Math.cos(this.sway) * 10;
    this.camera.position.y = Math.sin(this.sway) * 10;
    this.camera.lookAt(new THREE.Vector3());

    this.bgSprite.position.set( this.cx, this.cy + 200, 0 );
    this.bgSprite.material.opacity = Math.round( this.blink );

    for( var i=0; i<this.stars.length; i++){
        this.stars[i].update(dt/1000);
    }


    this.blink += dt/1000;
    if(this.blink > 1 ) this.blink = 0;

}




function Loading() {
}

Loading.prototype.render = function( game ) {
    game.renderer.render(this.scene, this.camera);
}

Loading.prototype.onStart = function( game ) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.add( new THREE.AmbientLight( 0x222222 ) );
    this.game.renderer.setClearColor( 0x000000, 1 );

    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    this.camera.position.z = 100;
    this.camera.lookAt( new THREE.Vector3() );

    this.controller = new LoadingController( game, this.camera, this.scene );
    game.controllers.push( this.controller );

};

Loading.prototype.resize = function( width, height ) {
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    this.controller.resize( width, height );
}

Loading.prototype.onStop = function( game) {
    this.controller.onStop();
    game.controllers = [];
};

function LoadingController( game, camera, scene ) {
    this.game = game;

    this.camera = camera;

    this.sway = 0;

    this.cx = camera.right / 2;
    this.cy = camera.bottom / 2;

    this.counter = 0;

    var tmat = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading  } );

    var scoreText = "LOADING";
    var textGeom = new THREE.TextGeometry( scoreText,
        {
            size: 20, height: 4, curveSegments: 4,
            font: "helvetiker", style: "normal"
        });

    this.scoreMesh = new THREE.Mesh(textGeom, tmat );
    textGeom.computeBoundingBox();
    var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
    this.scoreMesh.position.set( -0.5 * textWidth, -40, 120 );


    new TWEEN.Tween(this.scoreMesh.position).easing(TWEEN.Easing.Quadratic.Out).to({x: -0.5 * textWidth, y: -15, z:0}, 1.5*1000).start();

    scene.add(this.scoreMesh);


    this.light1= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light1.position.set( 1000, 0, 0 );

    this.light2= new THREE.PointLight( 0xffffff, 2, 3000 );
    this.light2.position.set( 0, 1000, 0 );

    this.light3= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light3.position.set( 0, 0, 1000 );

    this.light4= new THREE.PointLight( 0xffffff, 1, 3000 );
    this.light4.position.set( 0, -1000, 0 );

    scene.add( this.light1 );
    scene.add( this.light2 );
    scene.add( this.light3 );
    scene.add( this.light4 );


    this.resize( window.innerWidth, window.innerHeight );
}

LoadingController.prototype.resize = function( width, height ) {
    this.cx = width / 2;
    this.cy = height / 2;


    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
}

LoadingController.prototype.onStop = function() {

}

LoadingController.prototype.update = function( dt ) {
    var assets = this.game.getAssets();
    if( this.game.loader.done( assets ) ) {
        this.game.setState( new Intro() );
    }

    this.counter += dt;

    this.sway += dt * 0.5 / 1000;
    if( this.sway > Math.PI * 2) this.sway -= Math.PI*2;

    this.camera.position.x = Math.cos(this.sway) * 10;
    this.camera.position.y = Math.sin(this.sway) * 10;
    this.camera.lookAt(new THREE.Vector3());

    this.blink += dt/1000 * 2;
    if(this.blink > 1 ) this.blink = 0;

}

