function ProceduralRoadNetworkFactory (label) {
	this.label = label;
	this.data;

	this.lineGeometry = new THREE.Geometry();
	this.lineGeometry.vertices.push(new THREE.Vector3(0, -100, 0));
	this.lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
	this.lineMaterial = new THREE.LineBasicMaterial({color: 0x5555ff});
	this.lineMaterial2 = new THREE.LineBasicMaterial({color: 0xff0000});

	this.sphereGeometry = new THREE.SphereGeometry(10, 4, 4);
	this.sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, shininess: 0} );
	this.sphereMaterial2 = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess: 0} );

	this.roadMaterial = new THREE.MeshPhongMaterial( { color: 0x555555, shininess: 0} );
}

ProceduralRoadNetworkFactory.prototype.createSphereMesh = function() {
	var sphereMesh = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
	return sphereMesh;
};

ProceduralRoadNetworkFactory.prototype.createLineMesh = function() {
	var lineMesh = new THREE.Line(this.lineGeometry, this.lineMaterial);
	return lineMesh;
};

ProceduralRoadNetworkFactory.prototype.createLineBetween = function(v1, v2, height) {
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(new THREE.Vector3(v1.x, v1.z, -v1.y));
	lineGeometry.vertices.push(new THREE.Vector3(v2.x, v2.z, -v2.y));
	
	var lineMesh = new THREE.Line(lineGeometry, this.lineMaterial2);
	lineMesh.position.y = height;
	return lineMesh;
};

ProceduralRoadNetworkFactory.prototype.createRoadSegmentBetween = function(v1, v2, width, height, length) {

	// Road is aligned along the x axis and width along y axis in local coordinates.
	var roadSegmentGeometry = new THREE.PlaneGeometry(length + width, width, 1, 1);
	var roadSegmentMesh = new THREE.Mesh(roadSegmentGeometry, this.roadMaterial);

	roadSegmentMesh.position.x = 0.5 * (v1.x + v2.x);
	roadSegmentMesh.position.y = height;
	roadSegmentMesh.position.z = -0.5 * (v1.y + v2.y);

	roadSegmentMesh.rotation.z = -Math.atan2(v2.x-v1.x, v2.y-v1.y) + Math.PI / 2;
	roadSegmentMesh.rotation.x = -0.5 * Math.PI;

	roadSegmentMesh.receiveShadow = true;
	return roadSegmentMesh;
};

ProceduralRoadNetworkFactory.prototype.createNeedleMeshAt = function(x, y, height, scale, material) {
	var sphereMesh = this.createSphereMesh();
	sphereMesh.position.x = x;
	sphereMesh.position.y = height;
	sphereMesh.position.z = -y;
	sphereMesh.scale.divideScalar(scale);

	var lineMesh = this.createLineMesh();
	lineMesh.position.x = x;
	lineMesh.position.y = height;
	lineMesh.position.z = -y;
	lineMesh.scale.divideScalar(scale);

	var needleGroup = new THREE.Object3D();
	needleGroup.children.push(sphereMesh);
	needleGroup.children.push(lineMesh);

	if(material) {
		sphereMesh.material = material;
	}

	return needleGroup;
};

ProceduralRoadNetworkFactory.prototype.create = function(controls) {
	var roadMeshGroup = new THREE.Object3D();
	if(!controls.cityness || controls.dirtyBuild) {
		return roadMeshGroup;
	}

	var groundMesh = controls.groundData.groundMesh;
	var shoresData = controls.shoresData;
	var scale = controls.modelScale;
	var height = 100 / scale;
	var flatMid = 0.5*(shoresData.flatEnd+shoresData.flatStart);
	var flatRange = (shoresData.flatEnd-shoresData.flatStart);
	var worldFlatHeight = shoresData.flatHeight * groundMesh.size.heightLimit;
	var worldFlatEpsilon = shoresData.flatEpsilon * groundMesh.size.heightLimit;
	var qualityFactor = (1.25-controls.quality)*(1.25-controls.quality);
	var distThres = Math.pow(controls.cityness, 2) * flatRange;

	function norm2(a,b){
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		return dx*dx + dy*dy
	}

	var distance = norm2;
	var integrity = 20/controls.modelScale;///scale;
	var maxRoadLength = 5 * integrity;

	var integrity2 = integrity*integrity;
	var maxRoadLength2 = maxRoadLength*maxRoadLength;

	var roadWidth = 0.2*integrity;
	var roadHeight = worldFlatHeight + 2*worldFlatEpsilon; // Push roads up a little above ground

	// Collect points that will connect road segments.
	// Use kd tree to make sure we don't get points too 
	// Close to each other
	var roadAnchorPointTree = new kdTree([], distance, ['x', 'y']);
	var roadAnchorPoints = [];
	for (var i = 0; i < groundMesh.geometry.vertices.length; i++) {

		var v = groundMesh.geometry.vertices[i];
		if(Math.abs(v.z - worldFlatHeight) > worldFlatEpsilon) continue;

		var heightDistFromMid = Math.abs(v.originalHeight - flatMid);
		if(heightDistFromMid < distThres){
			var result = roadAnchorPointTree.nearest(v, 1, integrity2);
			if(!result.length){
				roadAnchorPoints.push(v);
				roadAnchorPointTree.insert(v);
			}
		}
	};

	var roads = [];
	var maxRoadConnections = controls.cityness < 0.7 ? 3 : 4;
	var roadSegmentsMidTree = new kdTree([], distance, ['x', 'y']);
	for (var i = 0; i < roadAnchorPoints.length; i++) {
		var anchor = roadAnchorPoints[i];
		var result = roadAnchorPointTree.nearest(anchor, maxRoadConnections, maxRoadLength2);
		for (var j = 0; j < result.length; j++) {
			var neighbor = result[j];
			var neighborAnchor = neighbor[0];
			var neighborDistanceSquared = neighbor[1];

			// Discard road segment if its distance is 0 
			// (i.e anchor and neighborAnchor are the same)
			if(neighborDistanceSquared === 0) {
				continue; 
			}

			var xMid = 0.5*(anchor.x+neighborAnchor.x);
			var yMid = 0.5*(anchor.y+neighborAnchor.y);
			var midAnchor = {x: xMid, y: yMid};

			// Discard road segment if its mid point is close to another 
			// mid point (i.e not allowing crossings)
			if(roadSegmentsMidTree.nearest(midAnchor, 1, 0.2*integrity2).length){
				continue;
			}

			// Discard road segment if its mid point is close to any
			// anchorpoint (i.e not allowing two short road segments to fulfill
			// the same purpose as one long road segment)
			if(roadAnchorPointTree.nearest(midAnchor, 1, 0.2*integrity2).length){
				continue;
			}

			// Discard road segment if the ground height at its mid point is 
			// higher that the flat height (i.e not allowing roads to crash
			// into small mountains, but allow bridges over water)
			var height = groundMesh.geometry.vertexAtPosition(xMid, yMid).z;
			if(height - worldFlatEpsilon > worldFlatHeight){
				continue;
			}



			// Add road segment
			roadSegmentsMidTree.insert(midAnchor);

			var roadLength = Math.sqrt(neighborDistanceSquared);
			roads.push([anchor, neighborAnchor, roadLength]);

			var roadSegmentMesh = this.createRoadSegmentBetween(anchor, neighborAnchor, roadWidth, roadHeight, roadLength);
			roadMeshGroup.children.push(roadSegmentMesh);
		};
	};

	this.data = {
		roads: roads,
		roadWidth: roadWidth,
		roadHeight: roadHeight,
		maxRoadLength: maxRoadLength,
		integrity: integrity,
	};

	//console.log('roadMeshGroup.children.length: ' + roadMeshGroup.children.length);
	return roadMeshGroup;
};
