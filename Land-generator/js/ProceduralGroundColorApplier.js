function ProceduralGroundColorApplier(label, colorScheme){
	this.label = label;
	this.colorControlPoints = [
		{height: -10, hexcolor: 0xc2b280},
		{height: 10, hexcolor: 0x76bb56},
		{height: 30, hexcolor: 0xc2b280},
		{height: 90, hexcolor: 0x777777},
		{height: 110, hexcolor: 0xffffff},
	];
}

ProceduralGroundColorApplier.prototype.getColor = function(height) {
	var next = this.colorControlPoints[0];
	if(height <= next.height) {
		return new THREE.Color(next.hexcolor);
	}

	var prev = next;
	for(var i=1; i<this.colorControlPoints.length; ++i){
		next = this.colorControlPoints[i];
		if(prev.height <= height && height < next.height){
			var alpha = (height - prev.height) / (next.height - prev.height);
			var c0 = new THREE.Color(prev.hexcolor);
			var c1 = new THREE.Color(next.hexcolor);
			return c0.lerp(c1, alpha);
		}
		prev = next;
	}

	return new THREE.Color(next.hexcolor);
};

ProceduralGroundColorApplier.prototype.create = function(controls) {

	var groundMesh = controls.groundData.groundMesh;
	groundMesh.material = new THREE.MeshPhongMaterial( { 
	    color: 0xffffff, specular: 0,
	    shading: THREE.FlatShading,
	    //shading: THREE.SmoothShading,
	    vertexColors: THREE.FaceColors
	});

	// Clear any previous vertex colors
	for (var faceIndex = 0; faceIndex < groundMesh.geometry.faces.length; faceIndex++) {
		var vc = groundMesh.geometry.faces[faceIndex].vertexColors = [];
	}
	
	// Set a color to each faces' vertices
	for (var faceIndex = 0; faceIndex < groundMesh.geometry.faces.length; faceIndex++) {
		var face = groundMesh.geometry.faces[faceIndex];
		var faceVertex = groundMesh.geometry.vertices[face.a];
		var height = (faceVertex.z - ((controls.sea_level-0.5)*groundMesh.size.heightLimit)) * controls.modelScale
		
		var noiseCoords = controls.noiseCoords(faceVertex);
		var heightNoise = 20 * noise.simplex2(2*noiseCoords.u, 2*noiseCoords.v);
		face.color.copy(this.getColor(height + heightNoise));
	};

	groundMesh.geometry.colorsNeedUpdate = true;
};