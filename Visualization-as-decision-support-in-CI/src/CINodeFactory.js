var uniqueid = require('uniqueid');

function CINodeFactory() {
	this.time = new Date(2015, 9, 13, 13, 37, 0, 0);
	this.factoryMap = {};

	this.initFactoryMap([
		{ type: 'code_change', factory: CICodeChangeFactory },
		{ type: 'code_review', factory: CICodeReviewFactory },
		{ type: 'patch_verification', factory: CIPatchVerification },
		{ type: 'build', factory: CIBuildFactory },
		{ type: 'test_A', factory: CITestFactory },
		{ type: 'test_B', factory: CITestFactory },
		{ type: 'test_C', factory: CITestFactory },
		{ type: 'test_D', factory: CITestFactory },
		{ type: 'artifact', factory: CIArtifactFactory },
		{ type: 'confidence_level', factory: CIConfidenceLevelFactory },
	]);

};

CINodeFactory.prototype.getTime = function() {
	return this.time.setSeconds(this.time.getSeconds() + 3600 * Math.random());
};

CINodeFactory.prototype.initFactoryMap = function(typesAndFactories) {
	var thisCINodeFactory = this;
	typesAndFactories.forEach(function (typeAndFactory) {
		var type = typeAndFactory.type;
		var Factory = typeAndFactory.factory;
		thisCINodeFactory.factoryMap[type] = new Factory(thisCINodeFactory, type);
	});
}

CINodeFactory.prototype.getPerson = function() {
	var people = ['Erik Broberg', 'Ola Leifler', 'Mark Zuckerberg', 'Kalle Anka', 'Karl-Bertil Jonsson', 'Clas Ohlson', 'Beethoven', 'Gudrun Schyman', 'Zlatan Ibrahimović', 'Pelle Flöjt', 'Stånk-Tommy'];
	return people[Math.floor(Math.random()*people.length)];
};


CINodeFactory.prototype.createBaseNode = function(specificFactory) {
	return {
		id: uniqueid({prefix: specificFactory.type + '_'} ),
		data: {
			time: this.getTime(),
			type: specificFactory.type,
		}
	}
};

CINodeFactory.prototype.create = function(typeName) {
	return this.factoryMap[typeName].create();
};





//
// Specific Factories
//--------------------------------------------------------

function CIPatchVerification(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
	this.passProbability = 0.9;
}

CIPatchVerification.prototype.create = function () {
	var node = this.masterFactory.createBaseNode(this);
	node.data.status = Math.random() < this.passProbability ? 'passed' : 'failed';
	return node;
}



function CICodeChangeFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
}

CICodeChangeFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	node.data.contributor = this.masterFactory.getPerson();
	return node;
};



function CICodeReviewFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
	this.passProbability = 0.9;
}

CICodeReviewFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	node.data.reviewer = this.masterFactory.getPerson();
	node.data.status = Math.random() < this.passProbability ? 'passed' : 'failed';
	return node;
};




function CIBuildFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
	this.passProbability = 0.99;
}

CIBuildFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	node.data.status = Math.random() < this.passProbability ? 'passed' : 'failed';
	return node;
};



function CITestFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
	this.passProbability = 0.9;
}

CITestFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	node.data.status = Math.random() < this.passProbability ? 'passed' : 'failed';
	return node;
};



function CIArtifactFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
}

CIArtifactFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	return node;
}



function CIConfidenceLevelFactory(masterFactory, type) {
	this.masterFactory = masterFactory;
	this.type = type;
}

CIConfidenceLevelFactory.prototype.create = function() {
	var node = this.masterFactory.createBaseNode(this);
	node.data.value = Math.random();
	return node;
}


exports.CINodeFactory = CINodeFactory;
