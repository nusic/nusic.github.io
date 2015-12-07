//
// Stats Monitor
//

function UserInput (parentElement) {
	/*
	this.world = world;
	this.monitorData = [];

	// Populate monitor data
	this.monitorData.push({
		label: "num updates", 
		getValue: function(){return world.numUpdates;}
	});
	this.monitorData.push({
		label: "num ants", 
		getValue: function(){return world.ants.length;}
	});
	this.monitorData.push({
		label: "num foods",
		getValue: function(){return world.sumGridValues(world.food); }
	});
	this.monitorData.push({
		label: "total home phermones", 
		getValue: function(){return world.sumGridValues(world.antColonies[0].homePheromones).toFixed(2);}
	});
	this.monitorData.push({
		label: "total food phermones", 
		getValue: function(){return world.sumGridValues(world.antColonies[0].foodPheromones).toFixed(2);}
	});
	this.monitorData.push({
		label: "anthill food", 
		getValue: function(){return world.antColonies[0].food;}
	});
	this.monitorData.push({
		label: "anthill buildMaterial", 
		getValue: function(){return world.antColonies[0].buildMaterial;}
	});
	*/
	this.initDomElements(parentElement);
};

UserInput.prototype.initDomElements = function(parentElement){
	// Create Stats container
	var guiContainer = document.createElement('DIV');
	guiContainer.id = "control";
	//guiContainer.style.background = "white";
	//guiContainer.style.position = "absolute";
	//guiContainer.style.bottom = "0px";
	parentElement.appendChild(guiContainer);
/*
	//Num agents
	var thisMonitor = this;
	this.monitorData.forEach(function(d){
		guiContainer.appendChild(thisMonitor.createValueMonitor(d.label));	
	});
*/
	//guiContainer.appendChild();
}
