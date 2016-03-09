function ProceduralBuildingFactory (label) {
	this.label = label;

	// Create a cube geometry with 12 vertices (i.e 4 extra vertices)
	// constructor arguments: size in xyz is 1, 1, 1
	//                        number of segments along xyz axis is 1, 1, 2 
	this.houseBaseGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 2);

	// side 1   side 2   top     
	// +-+-+    +---+   +---+
	// |   |    |   |   +   +
	// +-+-+    +---+   +---+  
	//    
	// ^ X      ^ Y     ^ Z  
	// |        |       |    
	// +-->Z    +-->X   +-->X


	// And displace two vertices so that we get a simple house base geometry
	this.houseBaseGeometry.vertices[1].y += 0.25;
	this.houseBaseGeometry.vertices[7].y += 0.25;

	// side 1   side 2   top
	//   +      +---+ 
	//  / \     |   |
	// +   +    +---+   +---+
	// |   |    |   |   + - +
	// +-+-+    +---+   +---+  
	
	

	this.buildingMaterials = [
		new THREE.MeshPhongMaterial( { color: 0xffffbb, shininess: 0, wireframe: false} ),
		new THREE.MeshPhongMaterial( { color: 0x855E42, shininess: 0} ),
		new THREE.MeshPhongMaterial( { color: 0xb05858, shininess: 0} ),
	]
}


ProceduralBuildingFactory.prototype.createBuilding = function(controls, pos) {
	
	var buildingGroup = new THREE.Object3D();
	var coords = controls.noiseCoords(pos);
	var numMats = this.buildingMaterials.length;
	var materialIndex = Math.floor((1+noise.simplex2(5*coords.u, 5*coords.v + 43)) * numMats / 2);
	
	var material = this.buildingMaterials[materialIndex]; //this.getBuildingMaterial();
	var buildingMesh = new THREE.Mesh(this.houseBaseGeometry, material);
	

	var scale = 0.2*controls.roadsData.integrity;
	buildingMesh.scale.multiplyScalar(scale);
	buildingMesh.castShadow = true;
	buildingMesh.receiveShadow = true;

	// Scale one of the axes to get variation

	
	var axisIndex = Math.floor((1 + noise.simplex2(5*coords.u, 5*coords.v)) * 3 / 2);
	var axisToScale = "xyz".charAt(axisIndex);

	buildingMesh.scale[axisToScale] *= 1.5;
	buildingGroup.add(buildingMesh);

	return buildingGroup;
};

ProceduralBuildingFactory.prototype.create = function(controls) {
	var buildingMeshGroup = new THREE.Object3D();

	if(controls.dirtyBuild || !controls.roadsData) {
		return buildingMeshGroup;
	}

	var groundMesh = controls.groundData.groundMesh;
	var roads = controls.roadsData.roads;
	var buildingScale = 0.2*controls.roadsData.integrity;

	var worldFlatHeight = controls.shoresData.flatHeight * groundMesh.size.heightLimit;
	var worldFlatEpsilon = controls.shoresData.flatEpsilon * groundMesh.size.heightLimit;

	function norm2(a,b){
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		return dx*dx + dy*dy
	}

	var buildingTree = new kdTree([], norm2, ['x', 'y']);
	var buildingIntegrity = 4*buildingScale*buildingScale;
	for (var i = 0; i < roads.length; i++) {
		var roadSegment = roads[i];
		var v1 = roadSegment[0];
		var v2 = roadSegment[1];

		// mid position of the road segment
		var xMid = 0.5*(v1.x + v2.x);
		var yMid = 0.5*(v1.y + v2.y);

		// we want buildings rotated such that they are
		// aligned with road they are next to
		var rotation = Math.atan2(v2.x-v1.x, v2.y-v1.y);

		// We don't want buildings blocking the roads, so place it right next to it
		var x = xMid + 1.5*buildingScale*Math.cos(-rotation);
		var y = yMid + 1.5*buildingScale*Math.sin(-rotation);

		// Building cannot be too close to other buildings
		var buildingPosition = {x:x, y:y};
		if(buildingTree.nearest(buildingPosition, 1, buildingIntegrity).length){
			continue;
		}

		try{
			// If the position not is on flat ground, discard this building
			var height = groundMesh.geometry.vertexAtPosition(x, y).z;
			if(Math.abs(height - worldFlatHeight) > worldFlatEpsilon){
				continue;
			}
		}
		catch(e){ 
			// Out of bounds exception, thrown by PlaneGeometry.vertexAtPosition(x, y)
			// This can happen if the position (x, y) we generated for the building 
			// is laying outside the plane. In this case just discard this building

			//console.error(e);
			continue; 
		}

		var pos = {x: x, y: y, x: groundMesh.flatHeight };
		var buildingMesh = this.createBuilding(controls, buildingPosition);
		buildingMesh.rotation.y = -rotation - Math.PI * 0.5;
		buildingMesh.position.x = x;
		buildingMesh.position.y = groundMesh.flatHeight;
		buildingMesh.position.z = -y;
		

		buildingMeshGroup.children.push(buildingMesh);
		buildingTree.insert(buildingPosition);


		/*
		var buildingMesh = this.createBuilding(buildingScale);
		buildingMesh.position.x = xMid - 2*buildingScale*Math.cos(-rotation);
		buildingMesh.position.y = groundMesh.geometry.vertexAtPosition(xMid, yMid).z;
		buildingMesh.position.z = -(yMid - 2*buildingScale*Math.sin(-rotation));
		buildingMesh.rotation.y = -rotation - Math.PI * 0.5;
		buildingMeshGroup.children.push(buildingMesh);
		*/
	};

	this.data = {
		buildingTree: buildingTree
	};

	return buildingMeshGroup;
};