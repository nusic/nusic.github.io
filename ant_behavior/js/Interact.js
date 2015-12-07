//
// Interactor
//
// Use this class to define user interaction with the canvas or ant colonies

function Interactor(world){
	this.world = world;

	document.onkeydown = function (e) {
		var enemy = world.enemies[0];
		switch(e.keyCode){
			case 37: return MoveLogic.turnLeft(enemy);
			case 38: return MoveLogic.walk(enemy);
			case 39: return MoveLogic.turnRight(enemy);
		}
	}

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	var isPainting = false;
	document.onmousemove = function(e){
		var canvas = document.getElementsByTagName('canvas')[0];
		if(e.target === canvas && isPainting){
			paint(canvas, e);
		}
	};

	function paint(canvas, e){
		var mousePos = getMousePos(canvas, e);
		var x = Math.floor(mousePos.x / canvas.width * world.width);
		var y = Math.floor(mousePos.y / canvas.height * world.height);

		for (var i = -1; i <= 1; i++) {
			for (var j = -1; j <= 1; j++) {
				if (document.getElementById("radio_food").checked){
					world.food[x+i][y+j] += 2;
				} else if (document.getElementById("radio_obst").checked){
					world.obstacles[x+i][y+j] = true;
				} else {
					world.food[x+i][y+j] = 0;
					world.obstacles[x+i][y+j] = false;
				}
			};
		};
	}

	document.onmousedown = function(e){
		var canvas = document.getElementsByTagName('canvas')[0];
		if(e.target === canvas && !isPainting){
			paint(canvas, e);
			isPainting = true;
		}
	};

	document.onmouseup = function(e){
		var canvas = document.getElementsByTagName('canvas')[0];
		if(e.target === canvas){
			isPainting = false;
		}
	};

}
