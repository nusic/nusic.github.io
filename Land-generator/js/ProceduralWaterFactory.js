function ProceduralWaterFactory(label){
	this.label = label;
	this.data;
}

ProceduralWaterFactory.prototype.create = function(controls) {
	var size = controls.groundData.groundMesh.size;
	var waterGeometry = new THREE.PlaneGeometry(size.x, size.y, 1, 1);

	var waterMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaff, specular: 0xffffff, shininess: 16, shading: THREE.FlatShading, transparent: true, opacity: 0.5 } );

	var waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
	waterMesh.rotation.x = -Math.PI/2;
	waterMesh.position.y = controls.groundData.groundMesh.size.heightLimit*(controls.sea_level-0.5);

	this.data = {
		waterMesh: waterMesh,
	};

	return waterMesh;
};