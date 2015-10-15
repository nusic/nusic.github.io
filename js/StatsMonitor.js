//
// Stats Monitor
//

function StatsMonitor (world, parentElement, leftAdjust) {
	this.world = world;
	this.monitorData = [];

	// Populate monitor data
	this.monitorData.push({
		label: "Time steps", 
		getValue: function(){return world.numUpdates;}
	});
	this.monitorData.push({
		label: "Colony size", 
		getValue: function(){return world.ants.length;}
	});
	this.monitorData.push({
		label: "Food in world",
		getValue: function(){return world.sumGridValues(world.food); }
	});
	this.monitorData.push({
		label: "Home pheromones", 
		getValue: function(){return world.sumGridValues(world.antColonies[0].homePheromones).toFixed(2);}
	});
	this.monitorData.push({
		label: "Food phermones", 
		getValue: function(){return world.sumGridValues(world.antColonies[0].foodPheromones).toFixed(2);}
	});
	this.monitorData.push({
		label: "Food in nest", 
		getValue: function(){return world.antColonies[0].food;}
	});/*
	this.monitorData.push({
		label: "Build material", 
		getValue: function(){return world.antColonies[0].buildMaterial;}
	});
	this.monitorData.push({
		label: "ants[0].age", 
		getValue: function(){
			if (world.ants[0]){
				return world.ants[0].age;
			}
			return '?';
		}
	});
	this.monitorData.push({
		label: "ants[0].hunger", 
		getValue: function(){
			if (world.ants[0]){
				return world.ants[0].hunger;
			}
			return '?';
		}
	});*/
	
	this.initDomElements(parentElement, leftAdjust);
};

StatsMonitor.prototype.initDomElements = function(parentElement, leftAdjust){
	// Create Stats container
	var statsContainer = document.createElement('DIV');
	statsContainer.style.left = leftAdjust + "px";
	parentElement.appendChild(statsContainer);

	//Num agents
	var thisMonitor = this;
	this.monitorData.forEach(function(d){
		statsContainer.appendChild(thisMonitor.createValueMonitor(d.label));	
	});
}

StatsMonitor.prototype.createValueMonitor = function (label) {
	var p = document.createElement('P');
	p.style.margin= "0px";

	var labelSpan = document.createElement('SPAN');
	labelSpan.textContent = label + ": ";

	var valSpan = document.createElement('SPAN');
	valSpan.setAttribute("id", label);

	p.appendChild(labelSpan);
	p.appendChild(valSpan);

	return p;
}


StatsMonitor.prototype.start = function(monitorParams) {
	var thisMonitor = this;
	this.loop = setInterval(function() {
		thisMonitor.monitorData.forEach(function (d) {
			document.getElementById(d.label).textContent = d.getValue();
		});
		
	}, monitorParams.waitTime);
};

StatsMonitor.prototype.stop = function() {
	clearInterval(this.loop)
};
