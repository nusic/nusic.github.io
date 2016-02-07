function ProceduralTreeFactory(label){
	this.label = label;

	this.sphereGeometry = new THREE.SphereGeometry(3, 4, 4);
	this.sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xaaffaa, shininess: 0} );

	this.boxGeometry = new THREE.BoxGeometry(1,1,1);
	this.boxMaterial = new THREE.MeshPhongMaterial( { color: 0x734A12, shininess: 0} );
}

ProceduralTreeFactory.prototype.getTreeMesh = function(controls, pos) {
	var noiseFactor = 1 + 0.5*noise.simplex2(pos.x, pos.z);
	var invScale = noiseFactor / controls.modelScale;



	var treeGroup = new THREE.Object3D();

	
	var boxMesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
	boxMesh.position.x = pos.x;
	boxMesh.position.y = pos.z + 2*invScale;
	boxMesh.position.z = -pos.y;
	boxMesh.scale.multiplyScalar(invScale);
	boxMesh.scale.y *= 5;

	boxMesh.castShadow = true;
	boxMesh.receiveShadow = true;

	var sphereMesh = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
	sphereMesh.position.x = pos.x;
	sphereMesh.position.y = pos.z + 5*invScale;
	sphereMesh.position.z = -pos.y;
	sphereMesh.scale.multiplyScalar(invScale);
	sphereMesh.scale.y *= 1.3;

	sphereMesh.castShadow = true;
	//sphereMesh.receiveShadow = true;

	treeGroup.children.push(sphereMesh);
	treeGroup.children.push(boxMesh);
	
	return treeGroup;
};

ProceduralTreeFactory.prototype.create = function(controls) {
	var treeMeshGroup = new THREE.Object3D();
	if(controls.dirtyBuild) {
		return treeMeshGroup;
	}

	var groundMesh = controls.groundData.groundMesh;
	var worldFlatHeight = controls.shoresData.flatHeight * groundMesh.size.heightLimit;
	var worldFlatEpsilon = controls.shoresData.flatEpsilon * groundMesh.size.heightLimit;

	function norm2(a,b){
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		return dx*dx + dy*dy
	}
	var distance = norm2;

	var treeTree = new kdTree([], distance, ['x', 'y']);
	var integrity = 10/controls.modelScale;
	var integrity2 = 2*integrity*integrity;

	//for (var i = 0; i < groundMesh.geometry.vertices.length; i++) {
	for (var i = 0; i < groundMesh.geometry.faces.length; i++) {
		var face = groundMesh.geometry.faces[i];
		var v = groundMesh.geometry.vertices[face.a];

		if(v.z - worldFlatHeight < 0) continue;
		
		var closeTrees = treeTree.nearest(v, 1, integrity2);
		if(closeTrees.length) continue;

		if(controls.buildingsData){
			var closeBuilding = controls.buildingsData.buildingTree.nearest(v, 1, 4*integrity2);
			if(closeBuilding.length) continue;
		}
			
		var greenRedDiff = face.color.g - face.color.r;
		if(greenRedDiff < 0.1) continue;


		treeTree.insert(v);
		var treeMesh = this.getTreeMesh(controls, v);
		treeMeshGroup.children.push(treeMesh);
	};

	

	return treeMeshGroup;
};