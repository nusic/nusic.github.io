function ProceduralGroundFactory(label){
	this.label = label;
	this.data;
	
	this.cachedGroundMesh = null;
	this.dirtyBuildGroundMesh = null;
}

ProceduralGroundFactory.prototype.getGeometry = function(controls) {
	var groundGeometry
	if(this.cachedGroundMesh && this.cachedGroundMesh.quality === controls.quality){
		groundGeometry = this.cachedGroundMesh.geometry;
	}
	else if((controls.dirtyBuild || controls.quality === 0) && this.dirtyBuildGroundMesh){
		groundGeometry = this.dirtyBuildGroundMesh.geometry;
	}
	else{
		console.log('CREATING NEW GEOMETRY - ' + controls.dim.x +'x'+controls.dim.y);
		groundGeometry = new THREE.PlaneGeometry(controls.size.x, controls.size.y, controls.dim.x, controls.dim.x);
		groundGeometry.size = controls.size;
	}
	return groundGeometry
};

ProceduralGroundFactory.prototype.create = function(controls) {
	var groundGeometry = this.getGeometry(controls);

	var sumHeight = 0;
	var noiseLevels = 8;
	var scale = controls.modelScale;
	var heightLimit = 250*controls.terrain/scale;

	var minMaxHeight = new MinMax();

	for (var i = 0; i < groundGeometry.vertices.length; i++) {
		var vertex = groundGeometry.vertices[i];
		var noiseCoords = controls.noiseCoords(vertex);

		var height = 0;
		for (var j = 0; j < noiseLevels; j++) {
			var twoPowI = Math.pow(2, j);
			height+= (0.7/(twoPowI)) * noise.simplex2(twoPowI*noiseCoords.u, twoPowI*noiseCoords.v);
		};
		height = controls.rivers ? Math.abs(height) : height;

		vertex.originalHeight = height;

		height*= heightLimit;
		vertex.z = height;

		sumHeight+= height;
		minMaxHeight.add(height);
	};

	groundGeometry.computeFaceNormals();
	groundGeometry.computeVertexNormals();

	groundGeometry.verticesNeedUpdate = true;
	groundGeometry.normalsNeedUpdate = true;

	// Material
	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0x99bb55, shininess: 0, wireframe: false} );

	var newGroundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	newGroundMesh.segments = controls.dim;
	newGroundMesh.geometry.segments = controls.dim;	
	newGroundMesh.quality = controls.quality;
	newGroundMesh.size = controls.size;
	newGroundMesh.size.heightLimit = heightLimit;
	newGroundMesh.size.avgHeight = sumHeight / groundGeometry.vertices.length;
	newGroundMesh.size.minHeight = minMaxHeight.min;
	newGroundMesh.size.maxHeight = minMaxHeight.max;

	newGroundMesh.rotation.x = -Math.PI/2;

	if(controls.quality !== 0){
		this.cachedGroundMesh = newGroundMesh;
	}
	else{
		this.dirtyBuildGroundMesh = newGroundMesh;
	}

	this.data = {
		groundMesh: newGroundMesh,
	}

	newGroundMesh.castShadow = true;
	newGroundMesh.receiveShadow = true;
	return newGroundMesh;
};

