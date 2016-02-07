function ProceduralWorldFactory(size){
	
	this.size = size;
	this.lastQuality;
	this.numStartChildren;

	this.initScene();

	this.factoryList = [
		new ProceduralGroundFactory('ground'),
		new ProceduralWaterFactory('water'),
		new ProceduralShoreApplier('shores'),
		new ProceduralGroundColorApplier('color'),
		new ProceduralSurroundingFactory('surrounding'),
		new ProceduralRoadNetworkFactory('roads'),
		new ProceduralBuildingFactory('buildings'),
		new ProceduralTreeFactory('trees'),
	];
}


ProceduralWorldFactory.prototype.initScene = function() {
	scene = new THREE.Scene();
	this.addLights(scene);
	this.addCamera(scene);
	this.addPersistentObjects(scene);

	this.numStartChildren = scene.children.length;
	console.log('inited scene with ' + this.numStartChildren + ' children');
};

ProceduralWorldFactory.prototype.addCamera = function(scene) {
	if(!camera){
		camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set(0, 1000, 1000);
		camera.far = 1000000;
	}
	scene.add(camera);
};

ProceduralWorldFactory.prototype.addLights = function(scene) {
	var lightGroup = new THREE.Object3D();

	// And there was light!
	var hemiLight = new THREE.HemisphereLight( 0x333333, 1 );
	lightGroup.children.push(hemiLight);

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
	directionalLight.position.set( -500, 500, 0 );

	directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1200;
    directionalLight.shadow.bias = 0.00001;
    directionalLight.shadow.mapSize.x = 2048;
    directionalLight.shadow.mapSize.y = 2048;
    directionalLight.shadowDarkness = 1;
    directionalLight.shadow.camera.updateProjectionMatrix();
    directionalLight.castShadow = true;
	lightGroup.children.push(directionalLight);

	//var camHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
	//lightGroup.add(camHelper)
	scene.add(lightGroup);
};

ProceduralWorldFactory.prototype.addPersistentObjects = function(scene, controls) {
	scene.add(persistentObjects);
};



ProceduralWorldFactory.prototype.preprocessControls = function(controls) {
	// model scale
	controls.modelScale = Math.pow(2, 6*(controls.scale-0.5)-2);

	// seed x and y for positioning
	var step = 0.1;
	controls.seed = {
		x: step * controls.x,
		y: step * controls.y,
	};

	// nubmer of segments in mesh
	var qualityLevel = 6 + 3*controls.quality;
	var segments = 2*Math.round(0.5*Math.pow(2, qualityLevel)); // ensure even number
	controls.dim = {
		x: segments, 
		y: segments
	};

	// size of world in world coordinates
	controls.size = {
		x: this.size.x,
		y: this.size.y,
	};

	controls.noiseCoords = function(vertex){
		var u = this.modelScale * vertex.x / this.size.x + this.seed.x;
		var v = this.modelScale * vertex.y / this.size.y + this.seed.y;
		return {u:u, v:v};
	}
};


ProceduralWorldFactory.prototype.clearScene = function(rebuildFrom) {
	if(!rebuildFrom){
		scene.children.splice(this.numStartChildren);
	}
	else{

		var rebuildFromIndex = scene.children.map(function(node){ 
			return node.name; 
		}).indexOf(rebuildFrom);
		if(rebuildFromIndex === -1) {
			throw new Error('name of node to rebuild from was not found');
		}
		scene.children.splice(rebuildFromIndex);
	}
};

ProceduralWorldFactory.prototype.getIndexOfFirstFactory = function(rebuildFrom) {
	if(!rebuildFrom){
		return 0
	}
	else{
		var rebuildFromIndex = this.factoryList.map(function (f){ 
			return f.label; 
		}).indexOf(rebuildFrom);
		return rebuildFromIndex;
	}
};

ProceduralWorldFactory.prototype.createAndSetScene = function(controls, rebuildFrom) {
	console.log(controls);
	var self = this;

	function executeCreationSteps(){
		self.preprocessControls(controls);

		// Remove any scene objects that we will rebuild
		self.clearScene(rebuildFrom);
		var firstFactoryIndex = self.getIndexOfFirstFactory(rebuildFrom);
		self.factoryList.forEach(function (factory, i){
			
			if(firstFactoryIndex <= i){
				tic();
				// delete any previous data for this factory
				deepDelete('data', factory);
				var product = factory.create(controls);
				if(product){
					product.name = factory.label;
					scene.add(product);
				}
				toc(factory.label);
			}
			else console.log(factory.label + ': not executed');

			controls[factory.label + 'Data'] = factory.data;
		});
	}

	if(controls.quality > 0){
		
		// Override quality and create lo fi scene
		console.log('\nDIRTY BUILD');

		var originalQuality = controls.quality;
		controls.quality = 0;
		controls.dirtyBuild = true;

		executeCreationSteps();

		controls.quality = originalQuality;
		controls.dirtyBuild = false;

		renderer.render( scene, camera );
		if(self.lastQuality !== controls.quality){
			$('#user-message').text('Initializing geometry ...');
		}
		setTimeout(function(){
			if(this.hiqCreationTimeouts === null) return;
			console.log('\nTRUE BUILD');
			executeCreationSteps();
			self.lastQuality = controls.quality;
			$('#user-message').text('');
			
		}, 30);
	}
	else{
		console.log('TRUE BUILD');
		executeCreationSteps();
		self.lastQuality = controls.quality;
	}
}

