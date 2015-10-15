//
// WorldVisualizer
//

function WorldVisualizer (world, width, height) {
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'canvas-id', { preload: preload, create: create, update: update });
	var bmd;
	var bitmapSprite;

	var groundColor = rgb(219, 184, 77);
	var underGroundColor = rgb(80,50,0);
	var foodColor = rgb(0,255,100);
	var dirtColor = rgb(150,100,50);
	var nestColor = rgb(200,150,75);

	var antColor = {
		head : '#550000',
		center : '#FF9900',
		butt : '#772222',
		legs : '#222222'
	};
	
	function preload() {
		
	}
	
	function create() {
        bmd = game.add.bitmapData(game.width, game.height);
        bitmapSprite = game.add.sprite(0, 0, bmd);

        var canvasElement = document.getElementsByTagName('canvas')[0];
        canvasElement.style.float = "left";
	}

	function resize(w, h) {
		game.width = w;
		game.height = h;
		game.stage.bounds.width = w;
		game.stage.bounds.height = h;
		bmd.clear(0,0,game.width, game.height);
	}

	function rgb(r,g,b){
		return'rgb(' + r + ',' + g + ',' + b + ')';
	}

	function rgba(r,g,b,a){
		return'rgb(' + r + ',' + g + ',' + b + ',' + a + ')';
	}
	
	function update() {
		bmd.clear(0,0,width, height);
		
		// To decide what to draw
		var aboveGround = document.getElementById('aboveGroundCheckBox').checked;
		var drawPheromones = document.getElementById('drawPheromonesCheckBox').checked;
		var drawAnts = document.getElementById('drawAntsCheckBox').checked;
		var detailedGraphics = document.getElementById('drawDetailedCheckBox').checked;

		bmd.ctx.fillStyle = aboveGround ? groundColor : underGroundColor;
		bmd.ctx.beginPath();
		bmd.ctx.fillRect(0, 0, game.width, game.height);
		bmd.ctx.closePath();
		bmd.ctx.fill();

		var dw = game.width / world.width;
		var dh = game.height / world.height;

		for (var i = 0; i < world.width; i++) {
			for (var j = 0; j < world.height; j++) {
				var xPos = dw * i - 0.5 * dw;
				var yPos = dh * j - 0.5 * dh;

				if (aboveGround) {
					if (world.food[i][j] > 0) {
						bmd.ctx.fillStyle = foodColor;
						bmd.ctx.beginPath();
						bmd.ctx.fillRect(xPos, yPos, dw, dh);
						bmd.ctx.closePath();
						bmd.ctx.fill();
					};
				}
				for (var k = 0; k < world.antColonies.length; k++) {
					if (aboveGround) {
						if(world.antColonies[k].antHill[i][j] > 0){
							bmd.ctx.fillStyle = dirtColor;
							bmd.ctx.beginPath();
							bmd.ctx.fillRect(xPos, yPos, dw, dh);
							bmd.ctx.closePath();
							bmd.ctx.fill();
						};
					} 
					else {
						if(world.antColonies[k].nest[i][j] > 0){
							bmd.ctx.fillStyle = nestColor;
							bmd.ctx.beginPath();
							bmd.ctx.fillRect(xPos, yPos, dw, dh);
							bmd.ctx.closePath();
							bmd.ctx.fill();
						}
						if (!aboveGround && world.antColonies[k].eggs[i][j] > 0) {
							// Draw eggs
							var eggRadius = game.width / world.width * 0.5;
							bmd.ctx.fillStyle = '#FFFFFF';
							bmd.ctx.beginPath();
							bmd.ctx.arc(xPos + 0.5 * dw, yPos + 0.5 * dh, eggRadius, 0, Math.PI*2, true); 
							bmd.ctx.closePath();
							bmd.ctx.fill();
						}
					}

					// PHEROMONES
					if (drawPheromones){
						if (aboveGround){
							if (world.antColonies[k].homePheromones[i][j] > 0) {
								var intensity = world.antColonies[k].homePheromones[i][j].toFixed(5);
								bmd.ctx.fillStyle = "rgba(250,250,0," + intensity + ")";
								bmd.ctx.beginPath();
								bmd.ctx.fillRect(xPos, yPos, dw, dh);
								bmd.ctx.closePath();
								bmd.ctx.fill();
							};

							if (world.antColonies[k].foodPheromones[i][j] > 0) {
								var intensity = world.antColonies[k].foodPheromones[i][j].toFixed(5);
								bmd.ctx.fillStyle = "rgba(0,250,255," + intensity + ")";
								bmd.ctx.beginPath();
								bmd.ctx.fillRect(xPos, yPos, dw, dh);
								bmd.ctx.closePath();
								bmd.ctx.fill();
							};
						}
						else{
							if (world.antColonies[k].exitPheromones[i][j] > 0) {
								var intensity = world.antColonies[k].exitPheromones[i][j].toFixed(5);
								bmd.ctx.fillStyle = "rgba(250,0,0," + intensity + ")";
								bmd.ctx.beginPath();
								bmd.ctx.fillRect(xPos, yPos, dw, dh);
								bmd.ctx.closePath();
								bmd.ctx.fill();
							};
						}
					}
				};
			};
		};

		for (var i = 0; i < world.antColonies.length; i++) {
			// Entrances
			var entrances = world.antColonies[i].entrances;
			for (var j = 0; j < entrances.length; j++) {
				bmd.ctx.fillStyle = rgb(0,0,0);
				bmd.ctx.beginPath();
				bmd.ctx.fillRect((entrances[j].x-0.5)*dw, (entrances[j].y-0.5)*dh, dw, dh);
				bmd.ctx.closePath();
				bmd.ctx.fill();
			};
		};

		// Draw ants
		if (drawAnts){
			for (var i = 0; i < world.ants.length; i++) {
				var ant = world.ants[i];

				var antRadius = (ant instanceof AntQueen) ? 1.3 : 0.7;
				antRadius *= game.width / world.width;

				var xPos = dw * ant.x;
				var yPos = dh * ant.y;

				if (aboveGround == !ant.insideNest) {
					var directionVector = {
						x: Math.cos(ant.angle / 8 * 2*Math.PI),
						y: Math.sin(ant.angle / 8 * 2*Math.PI)
					};
					if (detailedGraphics){
						bmd.ctx.strokeStyle = antColor.legs;
							
						rSqrt2 = antRadius*1.2 / (Math.sqrt(2));

						bmd.ctx.lineWidth = antRadius * 0.2;
						bmd.ctx.beginPath();
						bmd.ctx.moveTo(xPos - rSqrt2, yPos - rSqrt2);
						bmd.ctx.lineTo(xPos + rSqrt2, yPos + rSqrt2);
						bmd.ctx.stroke();

						bmd.ctx.lineWidth = antRadius * 0.2;
						bmd.ctx.beginPath();
						bmd.ctx.moveTo(xPos, yPos - antRadius * 1.2);
						bmd.ctx.lineTo(xPos, yPos + antRadius * 1.2);
						bmd.ctx.stroke();

						bmd.ctx.lineWidth = antRadius * 0.2;
						bmd.ctx.beginPath();
						bmd.ctx.moveTo(xPos - antRadius * 1.2, yPos);
						bmd.ctx.lineTo(xPos + antRadius * 1.2, yPos);
						bmd.ctx.stroke();

						bmd.ctx.lineWidth = antRadius * 0.2;
						bmd.ctx.beginPath();
						bmd.ctx.moveTo(xPos + rSqrt2, yPos - rSqrt2);
						bmd.ctx.lineTo(xPos - rSqrt2, yPos + rSqrt2);
						bmd.ctx.stroke();


						if(ant.carryingFood){
							bmd.ctx.strokeStyle = foodColor;

							bmd.ctx.lineWidth = antRadius;
							bmd.ctx.beginPath();
							bmd.ctx.moveTo(xPos, yPos);
							bmd.ctx.lineTo(xPos + directionVector.x * antRadius * 2.5, yPos + directionVector.y * antRadius * 2.5);
							bmd.ctx.stroke();
						}
						if(ant.carryingDirt){
							bmd.ctx.strokeStyle = dirtColor;

							bmd.ctx.lineWidth = antRadius;
							bmd.ctx.beginPath();
							bmd.ctx.moveTo(xPos, yPos);
							bmd.ctx.lineTo(xPos + directionVector.x * antRadius * 2.5, yPos + directionVector.y * antRadius * 2.5);
							bmd.ctx.stroke();
						}

						// Center piece
						bmd.ctx.fillStyle = antColor.center;
						bmd.ctx.beginPath();
						bmd.ctx.arc(xPos, yPos, antRadius * 0.4, 0, Math.PI*2, true); 
						bmd.ctx.closePath();
						bmd.ctx.fill();
						// Back piece
						bmd.ctx.fillStyle = antColor.butt;
						bmd.ctx.beginPath();
						bmd.ctx.arc(xPos - directionVector.x*antRadius, yPos - directionVector.y*antRadius, antRadius * 0.7, 0, Math.PI*2, true); 
						bmd.ctx.closePath();
						bmd.ctx.fill();
						// Head piece
						bmd.ctx.fillStyle = antColor.head;
						bmd.ctx.beginPath();
						bmd.ctx.arc(xPos + directionVector.x*antRadius * 0.6, yPos + directionVector.y*antRadius*0.6, antRadius * 0.6, 0, Math.PI*2, true); 
						bmd.ctx.closePath();
						bmd.ctx.fill();
					} else {
						// Center piece
						bmd.ctx.fillStyle = antColor.head;
						bmd.ctx.beginPath();
						bmd.ctx.arc(xPos, yPos, antRadius, 0, Math.PI*2, true); 
						bmd.ctx.closePath();
						bmd.ctx.fill();

						if (ant.carryingFood)
							bmd.ctx.strokeStyle = foodColor;
						else if(ant.carryingDirt)
							bmd.ctx.strokeStyle = dirtColor;
						else
							bmd.ctx.strokeStyle = antColor.center;

						bmd.ctx.lineWidth = antRadius;
						bmd.ctx.beginPath();
						bmd.ctx.moveTo(xPos, yPos);
						bmd.ctx.lineTo(xPos + directionVector.x * antRadius, yPos + directionVector.y * antRadius);
						bmd.ctx.stroke();
					}
				}
			}
		}

		for (var i = 0; i < world.enemies.length; i++) {
			var enemy = world.enemies[i];

			var xPos = dw * enemy.x;
			var yPos = dw * enemy.y;

			bmd.ctx.fillStyle = '#FF0000';
			bmd.ctx.beginPath();
			bmd.ctx.arc(xPos, yPos, enemy.radius, 0, Math.PI*2, true); 
			bmd.ctx.closePath();
			bmd.ctx.fill();
		};
	}
}