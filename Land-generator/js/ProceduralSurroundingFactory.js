function ProceduralSurroundingFactory(label){
	this.label = label;
}

ProceduralSurroundingFactory.prototype.create = function(controls) {
	var groundMesh = controls.groundData.groundMesh;
	var width = groundMesh.size.x;
	var depth = groundMesh.size.y;
	var seaLevel = groundMesh.size.heightLimit*(controls.sea_level-0.5);
	var height = (seaLevel - groundMesh.size.minHeight);
	var segments = groundMesh.segments.x;
	
	var bottomY = Math.min(seaLevel, groundMesh.size.minHeight);

	var bottom=0, left=1, right=2, front=3, back=4;

	// Geometries
	var planeGeometries = [];
	planeGeometries[bottom] = new THREE.PlaneGeometry(width, depth, 1, 1);
	planeGeometries[left] = new THREE.PlaneGeometry(width, 200, segments, 1);
	planeGeometries[right] = new THREE.PlaneGeometry(width, 200, segments, 1);
	planeGeometries[front] = new THREE.PlaneGeometry(width, 200, segments, 1);
	planeGeometries[back] = new THREE.PlaneGeometry(width, 200, segments, 1);

	// Material
	var surroundingMaterial = new THREE.MeshBasicMaterial( {color: 0xaaaaaa, wireframe: false, side: THREE.DoubleSide } )

	// Create meshes
	surroundingMeshGroup = new THREE.Object3D()
	for (var i = 0; i < planeGeometries.length; i++) {
		var planeMesh = new THREE.Mesh(planeGeometries[i], surroundingMaterial);
		surroundingMeshGroup.add(planeMesh);
	};

	// Positioning
	surroundingMeshGroup.children[bottom].rotation.x = -Math.PI/2;
	surroundingMeshGroup.children[bottom].position.y = bottomY;

	surroundingMeshGroup.children[left].position.x = -width/2;
	surroundingMeshGroup.children[left].rotation.y = Math.PI/2;

	surroundingMeshGroup.children[right].position.x = width/2;
	surroundingMeshGroup.children[right].rotation.y = Math.PI/2;

	surroundingMeshGroup.children[front].position.z = width/2;

	surroundingMeshGroup.children[back].position.z = -width/2;


	// Setting heights of left,right,front,back planes

	var groundVerts = groundMesh.geometry.vertices;
	for (var topVertexIndex = 0; topVertexIndex <= segments; topVertexIndex++) {
		var frontHeight = groundVerts[groundVerts.length-1 - segments + topVertexIndex].z;
		var backHeight = groundVerts[topVertexIndex].z;
		var leftHeight = groundVerts[groundVerts.length-1 - (segments+1) * topVertexIndex - segments].z;
		var rightHeight = groundVerts[groundVerts.length-1 - (segments+1) * topVertexIndex].z;

		/*planeGeometries[front].vertices[topVertexIndex].y = Math.max(seaLevel, frontHeight);
		planeGeometries[back].vertices[topVertexIndex].y = Math.max(seaLevel, backHeight);
		planeGeometries[left].vertices[topVertexIndex].y = Math.max(seaLevel, leftHeight);
		planeGeometries[right].vertices[topVertexIndex].y = Math.max(seaLevel, rightHeight);*/

		planeGeometries[front].vertices[topVertexIndex].y = frontHeight;
		planeGeometries[back].vertices[topVertexIndex].y = backHeight;
		planeGeometries[left].vertices[topVertexIndex].y = leftHeight;
		planeGeometries[right].vertices[topVertexIndex].y = rightHeight;
	};


	for (var bottomVertexIndex = segments+1; bottomVertexIndex <= 2*segments+1; bottomVertexIndex++) {
		planeGeometries[front].vertices[bottomVertexIndex].y = bottomY;
		planeGeometries[back].vertices[bottomVertexIndex].y = bottomY;
		planeGeometries[left].vertices[bottomVertexIndex].y = bottomY;
		planeGeometries[right].vertices[bottomVertexIndex].y = bottomY;
	};
	
	return surroundingMeshGroup;
};