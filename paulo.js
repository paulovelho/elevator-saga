{
	init: function(elevators, floors) {
		var elevator = elevators[0]; // Let's use the first elevator
		var maxFloor = 7;
		var listUp = [];
		var listDown = [];

		var callElevator = function (arr, floor) {
			if (arr.indexOf(floor) != -1) return arr;
			arr.push(floor);
			return arr;
		}
		var mergeArrays = function (arr1, arr2) {
			var rs = Array.from(new Set(arr1.concat(arr2)));
			rs.sort(function (a, b) { return a - b; });
			return rs;
		}
		var removeFromArray = function (arr, val) {
			if (!Array.isArray(arr)) console.error("is not an array: ", arr);
			console.info("removing from arr " + val, arr);
			arr.splice(arr.indexOf(val), 1);
			return arr;
		}

		var getNextDestinationUp = function (e, stopped = false) {
			e.goUp = true;
			var cFloor = e.currentFloor();
			var dests = mergeArrays(listUp, e.destinations);
			console.info("dest ups: ", dests);
			do {
				if (dests.length == 0) {
					return null;
				}
				next = dests[0];
				console.info("next: " + next, dests);
				dests = removeFromArray(dests, next);
			} while (next <= cFloor && !stopped);
			return next;
		}
		var getNextDestinationDown = function (e, stopped = false) {
			e.goUp = false;
			var cFloor = e.currentFloor();
			var dests = mergeArrays(listDown, e.destinations);
			console.info("dest downs: ", dests);
			do {
				if (dests.length == 0) {
					return null;
				}
				next = dests[0];
				dests = removeFromArray(dests, next);
			} while (next >= cFloor && !stopped);
			return next;
		}

		var go = function (e, i) {
			console.info("elevator [" + e.id + "] going to ", i);
			if (i == null) {
				var floor = e.currentFloor();
				i = e.goUp ? floor++ : floor--;
			}
			e.goUp = (e.currentFloor() < i);
			e.goToFloor(i);
			e.destinations = removeFromArray(e.destinations, i);
		}
		var goUp = function (e) {
			var currentFloor = e.currentFloor();
			if (currentFloor == maxFloor) { return goDown(e); }
			var next = getNextDestinationUp(e);
			if (!next) next = getNextDestinationDown(e, true);
			return go(e, next);
		}
		var goDown = function (e) {
			var currentFloor = e.currentFloor();
			if (currentFloor == 0) { return goUp(e); }
			var next = getNextDestinationDown(e);
			if (!next) next = getNextDestinationUp(e, true);
			return go(e, next);
		}

		var debugs = function () {
			console.info("calls Up: ", listUp);
			console.info("calls Down: ", listDown);
		}

		elevators.forEach((elevator, index) => {
			elevator.destinations = [];
			elevator.goUp = true;
			elevator.id = index;
			// Whenever the elevator is idle (has no more queued destinations) ...
			elevator.on("idle", function () {
				console.info("ELEVATOR [" + elevator.id + "] action: ");
				if (elevator.goUp) {
					goUp(elevator);
				} else {
					goDown(elevator);
				}
				console.info("elevator on [" + elevator.currentFloor() + "] = status: ", elevator.destinationDirection());
				debugs();
				console.info("==== \n");
			});
			elevator.on("floor_button_pressed", function (num) {
				//                console.info("ELEVATOR ["+elevator.id+"] pressed ", num);
				elevator.destinations.push(num);
			});
		});

		floors.forEach((floor) => {
			floor.on("up_button_pressed", function () {
				listUp = callElevator(listUp, floor.level);
				//                console.info("FLOOR ACTION: up from ", floor.level);
			});
			floor.on("down_button_pressed", function () {
				listDown = callElevator(listDown, floor.level);
				//                console.info("FLOOR ACTION: down from ", floor.level); 
			});
		});

	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}
