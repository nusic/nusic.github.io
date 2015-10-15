var MoveLogic = {

	getRelativeCenterSensorPosition: function(movable){
		var center = {};

		switch(movable.angle) {
		    case 0:
		        center.x = 1;
		        center.y = 0;
		        break;
		    case 1:
		        center.x = 1;
		        center.y = 1;
		        break;
		    case 2:
		        center.x = 0;
		        center.y = 1;
		        break;
		    case 3:
		        center.x = -1;
		        center.y = 1;
		        break;
		    case 4:
		        center.x = -1;
		        center.y = 0;
		        break;
		    case 5:
		        center.x = -1;
		        center.y = -1;
		        break;
		    case 6:
		        center.x = 0;
		        center.y = -1;
		        break;
		    case 7:
		        center.x = 1;
		        center.y = -1;
		        break;
		}
		return center;
	},

	getRelativeSensorPosition: function(movable){
		var sensorPoints = {};
		sensorPoints.left = {};
		sensorPoints.center = {};
		sensorPoints.right = {};

		switch(movable.angle) {
		    case 0:
		        sensorPoints.left.x = 1;
		        sensorPoints.left.y = -1;
		        sensorPoints.center.x = 1;
		        sensorPoints.center.y = 0;
		        sensorPoints.right.x = 1;
		        sensorPoints.right.y = 1;
		        break;
		    case 1:
		        sensorPoints.left.x = 1;
		        sensorPoints.left.y = 0;
		        sensorPoints.center.x = 1;
		        sensorPoints.center.y = 1;
		        sensorPoints.right.x = 0;
		        sensorPoints.right.y = 1;
		        break;
		    case 2:
		        sensorPoints.left.x = 1;
		        sensorPoints.left.y = 1;
		        sensorPoints.center.x = 0;
		        sensorPoints.center.y = 1;
		        sensorPoints.right.x = -1;
		        sensorPoints.right.y = 1;
		        break;
		    case 3:
		        sensorPoints.left.x = 1;
		        sensorPoints.left.y = 0;
		        sensorPoints.center.x = -1;
		        sensorPoints.center.y = 1;
		        sensorPoints.right.x = -1;
		        sensorPoints.right.y = 0;
		        break;
		    case 4:
		        sensorPoints.left.x = -1;
		        sensorPoints.left.y = 1;
		        sensorPoints.center.x = -1;
		        sensorPoints.center.y = 0;
		        sensorPoints.right.x = -1;
		        sensorPoints.right.y = -1;
		        break;
		    case 5:
		        sensorPoints.left.x = -1;
		        sensorPoints.left.y = 0;
		        sensorPoints.center.x = -1;
		        sensorPoints.center.y = -1;
		        sensorPoints.right.x = 0;
		        sensorPoints.right.y = -1;
		        break;
		    case 6:
		        sensorPoints.left.x = -1;
		        sensorPoints.left.y = -1;
		        sensorPoints.center.x = 0;
		        sensorPoints.center.y = -1;
		        sensorPoints.right.x = 1;
		        sensorPoints.right.y = -1;
		        break;
		    case 7:
		        sensorPoints.left.x = 0;
		        sensorPoints.left.y = -1;
		        sensorPoints.center.x = 1;
		        sensorPoints.center.y = -1;
		        sensorPoints.right.x = 1;
		        sensorPoints.right.y = 0;
		        break;
		    default:
		        break;
		}
		return sensorPoints;
	},

	walk: function(movable) {
		if(!movable.canWalk()) {
			return;
		}

		switch(movable.angle) {
		    case 0:
		        movable.x++;
		        break;
		    case 1:
		        movable.x++;
		        movable.y++;
		        break;
		    case 2:
		        movable.y++;
		        break;
		    case 3:
		        movable.x--;
		        movable.y++;
		        break;
		    case 4:
		        movable.x--;
		        break;
		    case 5:
		        movable.x--;
		        movable.y--;
		        break;
		    case 6:
		        movable.y--;
		        break;
		    case 7:
		        movable.x++;
		        movable.y--;
		        break;
		    default:
		        break;
		}
		
		// The borders are set like movable because the ants can sample points on sensors in front of them
		if(movable.x < 3){
			movable.x = 3;
		}
		if(movable.x > movable.world.width - 3){
			movable.x = movable.world.width - 3;
		}
		if(movable.y < 3){
			movable.y = 3;
		}
		if(movable.y > movable.world.height - 3){
			movable.y = movable.world.height - 3;		
		}
	},

	turnLeft: function(movable) {
		movable.angle--;
		if (movable.angle < 0)
			movable.angle = 7;
		return;
	},

	turnRight: function(movable) {
		movable.angle++;
		if (movable.angle > 7)
			movable.angle = 0;
		return;
	},

	wander: function(movable) {
		var r = Math.random();
		if (r < 0.33) {
			MoveLogic.turnLeft(movable);
		}
		else if (0.67 > r) {
			MoveLogic.turnRight(movable);
		}
		MoveLogic.walk(movable);
	},
}


