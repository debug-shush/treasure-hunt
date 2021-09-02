var groupsArray;
var guessCount = 0;
var guessSolveCount = 0;
var solveCount = 0;
var difficulty;
var genPuzzleState;
var invalidNumber = false;
var invalidGuess = false;
var invalidX;
var invalidY;
onmessage = function(e) {
	var params = e.data.split("_");
	if(params[0] == "generate"){
		generator = new generateObject(params[1], params[2], params[3], params[4]);
		genPuzzle = generator.generate();
		while(genPuzzle == "none"){
			generator = new generateObject(params[1], params[2], params[3], params[4]);
			genPuzzle = generator.generate();
		}
		postMessage("done_" + genPuzzle);
	}else{
		solver = new solveObject(params[1], params[2]);
		solver.solve();
		postMessage("done_" + solver.getSolution());
	}
}
function generateGrid(genPuzzleState, diff, width, height){
	var maxLength = (((width * 1) + (height * 1)) / 2) - 1;
	if(maxLength > 9){
		maxLength = 9;
	}
	if(maxLength < 3){
		maxLength = 3;
	}
	var currentGroup = new Array();
	var allVisitedCells = new Array();
	var genGroups = new Array();
	var candidates = new Array(this.height);
	for(var i=0;i<=(this.height) - 1;i++){
		candidates[i] = new Array(this.width);
	}
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			candidates[x][y] = new Array();
		}
	}
	var genCells = new Array();
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			genCells.push(x + "-" + y);
		}
	}
	//genCells = shuffle(genCells);
	for (q = 0; q < genCells.length; q++) {
		var temp = genCells[q].split("-");
		var x = temp[0] * 1;
		var y = temp[1] * 1;
		
			if(allVisitedCells.indexOf(x + "-" + y) == -1){
				var count = 0;
				var groupInvalid = false;
				currentGroup = generateGenGroup(genPuzzleState, width, height, x, y, allVisitedCells, maxLength, candidates);
				for (i = 0; i < currentGroup.length; i++) {
					var cell = currentGroup[i].split("-");
					var x2 = cell[0] * 1;
					var y2 = cell[1] * 1;
					
					if (candidates[x2][y2].indexOf(currentGroup.length) != -1){
						//console.log(currentGroup);
						groupInvalid = true;
					}
				}

				if(groupInvalid == false){

					for (i = 0; i < currentGroup.length; i++) {
						
						var cell = currentGroup[i].split("-");
						var x2 = cell[0] * 1;
						var y2 = cell[1] * 1;
						//genPuzzleState[x2][y2] = currentGroup.length;
						
						if(x2 != height - 1 && candidates[x2 + 1][y2].indexOf(currentGroup.length) == -1){
							candidates[x2 + 1][y2].push(currentGroup.length);
						}
						if(x2 != 0 && candidates[x2 - 1][y2].indexOf(currentGroup.length) == -1){
							candidates[x2 - 1][y2].push(currentGroup.length);
						}
						if(y2 != width - 1 && candidates[x2][y2 + 1].indexOf(currentGroup.length) == -1){
							candidates[x2][y2 + 1].push(currentGroup.length);
						}
						if(y2 != 0 && candidates[x2][y2 - 1].indexOf(currentGroup.length) == -1){
							candidates[x2][y2 - 1].push(currentGroup.length);
						}
					}
					allVisitedCells.push.apply(allVisitedCells, currentGroup);
					genGroups.push(currentGroup);
				}else{
					var returnArray = new Array();
					returnArray.push(false);
					returnArray.push(genPuzzleState);
					return returnArray;
				}
			}
		
	}
	//console.log(candidates);
	//console.log(allVisitedCells);
	//console.log(genGroups);
	
	for (h = 0; h < genGroups.length; h++) {
		var currentGroup = genGroups[h];
		for (i = 0; i < currentGroup.length; i++) {
			var cell = currentGroup[i].split("-");
			var x = cell[0] * 1;
			var y = cell[1] * 1;
			//console.log(cell);
			genPuzzleState[x][y] = currentGroup.length;
		}
	}
	//currentGroup = generateGenGroup(genPuzzleState, width, height, 0, 0, visitedCells);
	//console.log(currentGroup);

	//validates grid
	var validGrid = true;
	for (h = 0; h < genGroups.length; h++) {
		if(validGrid == true){
			var currentGroup = genGroups[h];
			for (i = 0; i < currentGroup.length; i++) {
				var cell = currentGroup[i].split("-");
				var x = cell[0] * 1;
				var y = cell[1] * 1;
				//console.log(cell);
				if(x != height - 1 && genPuzzleState[x][y] == genPuzzleState[x + 1][y] && currentGroup.indexOf((x + 1) + "-" + y) == -1){
					validGrid = false;
				}
				if(x != 0 && genPuzzleState[x][y] == genPuzzleState[x - 1][y] && currentGroup.indexOf((x - 1) + "-" + y) == -1){
					validGrid = false;
				}
				if(y != width - 1 && genPuzzleState[x][y] == genPuzzleState[x][y + 1] && currentGroup.indexOf(x + "-" + (y + 1)) == -1){
					validGrid = false;
				}
				if(y != 0 && genPuzzleState[x][y] == genPuzzleState[x][y - 1] && currentGroup.indexOf(x + "-" + (y - 1)) == -1 ){
					validGrid = false;
				}
				genPuzzleState[x][y] = currentGroup.length;
			}
		}
	}
	//console.log(validGrid);

	var returnArray = new Array();
	returnArray.push(validGrid);
	returnArray.push(genPuzzleState);

	return returnArray;
}
function generateGenGroup(genPuzzleState, width, height, x, y, visitedCells, maxLength, candidates){
	var chosenMaxLength = Math.floor((Math.random()*maxLength)) + 1;
	//chosenMaxLength++;
	if(chosenMaxLength == 1){
		//console.log("what");
		//chosenMaxLength = Math.floor((Math.random()*maxLength)) + 1;
	}
	var groupCells = new Array();
	var continueCells = new Array();
	var continueTraveling = true;
	var lastDirection = "none";
	var genCount = 0;
	while(continueTraveling == true){
		if(genCount > height * width * 2){
			continueTraveling = false;
		}
		if (groupCells.indexOf(x + "-" + y) == -1){
			groupCells.push(x + "-" + y);
			continueCells.push(x + "-" + y);
			//visitedCells.push(x + "-" + y);
		}

		//checks validity of current group
		var currentGroupValid = true;
		for (k = 0; k < groupCells.length; k++) {
			var cell = groupCells[k].split("-");
			var x3 = cell[0] * 1;
			var y3 = cell[1] * 1;
			
			if (candidates[x3][y3].indexOf(groupCells.length) != -1){
				currentGroupValid = false;
			}
		}

		//console.log(groupCells.length);
		if(groupCells.length == maxLength){
			
			//console.log("STOP");
			
			continueTraveling = false;
		}
		if(groupCells.length > chosenMaxLength){
			if(currentGroupValid == true){
				continueTraveling = false;
			}
		}
		//10x10:aaaaaa2aa299aaaaaa3aaa1a97a441aaa6627aa2a7a6aaa8a2a3a6a1aaa5614aa231aaaa2a9a3a52aa29a92a3a1a9a9a9aa3
		var chanceOfRandomize = Math.floor((Math.random()*10));
		if (chanceOfRandomize == 1000) {
			continueCells = shuffle(continueCells);
			var newSeedCell = continueCells[0].split("-");
			x = parseInt(newSeedCell[0]) * 1;
			y = parseInt(newSeedCell[1]) * 1;
			lastDirection = "none";
		}
		//var chanceToEnd = Math.floor((Math.random() * (15 - groupCells.length)));
		
		var chanceToEnd = Math.floor((Math.random() * 5));
		//console.log(chanceToEnd + "WhT");
		if(chanceToEnd == 1){
			if(currentGroupValid == true){
				continueTraveling = false;
			}
		}
		
		var directions = new Array();

		if(x != height - 1 && visitedCells.indexOf((x + 1) + "-" + y) == -1){
			directions.push("down");
		}
		if(x != 0 && visitedCells.indexOf((x - 1) + "-" + y) == -1){
			directions.push("up");
		}
		if(y != width - 1  && visitedCells.indexOf(x + "-" + (y + 1)) == -1){
			directions.push("right");
		}
		if(y != 0 && visitedCells.indexOf(x + "-" + (y - 1)) == -1 ){
			directions.push("left");
		}
		if(directions.indexOf(lastDirection) != -1){
			//increases likelihood of continuing in same direction
			directions.push(lastDirection);
		}

		var rand = Math.floor((Math.random()*directions.length));
		//postMessage(rand + "-" + directions.length);
		var direction = directions[rand];
		if(directions.length > 1 && continueCells.indexOf(x + "-" + y) == -1){
			continueCells.push(x + "-" + y);
		}
		if(direction == ("up")) {
			lastDirection = "up";
			x--;
		}else if(direction == ("down")) {
			lastDirection = "down";
			x++;
		}else if(direction == ("left")) {
			lastDirection = "left";
			y--;
		}else if(direction == ("right")) {
			lastDirection = "right";
			y++;
		}else{
			continueCells.splice(continueCells.indexOf(x + "-" + y), 1);
			continueCells = shuffle(continueCells);
			if(continueCells.length != 0){
				lastDirection = "none";
				var newSeedCell = continueCells[0].split("-");
				x = parseInt(newSeedCell[0]) * 1;
				y = parseInt(newSeedCell[1]) * 1;

			}else{
				//console.log("no continues");
				continueTraveling = false;
			}
		}
		genCount++;
		//console.log(x + "-" + y);
	}
	return groupCells;
}

function removeNumbers(genPuzzleState, diff, width, height){
	var removeCount = 0;
	var puzzleCells = new Array();
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			puzzleCells.push(x + "-" + y + "-" + genPuzzleState[x][y]);
		}
	}
	
	puzzleCells = shuffle(puzzleCells);
	
	puzzleCells.sort(function(a, b) {
    	var temp = a.split("-");
    	a = temp[2] * 1;
    	temp = b.split("-");
    	b = temp[2] * 1;
    	var randomOrder = Math.floor((Math.random() * 3));
    	if(randomOrder == 1){
    		//console.log("wat");
    		//return b - a;
    		return a - b;
    	}else{
			return b - a;
		}

	});
	//console.log(puzzleCells);
	for (q = 0; q < puzzleCells.length; q++) {
		var temp = puzzleCells[q].split("-");
		var candsx = temp[0] * 1;
		var candsy = temp[1] * 1;
		var oldValue = genPuzzleState[candsx][candsy];
		if(genPuzzleState[candsx][candsy] != "-"){
			postMessage("testing");
			genPuzzleState[candsx][candsy] = "-"
			var puzzleString = width + "x" + height + ":"
			for (var x=0;x < (height);x++) {
				for (var y=0; y < (width);y++) {
					puzzleString += genPuzzleState[x][y] + "";
				}
			}
			var solver = new solveObject(puzzleString, diff);
			solver.solve();
			var temp = solver.getSolution().split(":");
			var isSolved = temp[0];
			if(isSolved == "true"){
				removeCount++;
				//console.log(temp[1]);
				//console.log(puzzleString);
			}else{
				//console.log(temp[2]);
				genPuzzleState[candsx][candsy] = oldValue;
			}

		}else{
			
		}
	}

	//console.log("FIRST " + removeCount);
	/*
	removeCount = 0;
	for (q = 0; q < puzzleCells.length; q++) {
		var temp = puzzleCells[q].split("-");
		var candsx = temp[0] * 1;
		var candsy = temp[1] * 1;
		var oldValue = genPuzzleState[candsx][candsy];
		if(genPuzzleState[candsx][candsy] != "-"){
			//postMessage("testing");
			genPuzzleState[candsx][candsy] = "-"
			var puzzleString = width + "x" + height + ":"
			for (var x=0;x < (height);x++) {
				for (var y=0; y < (width);y++) {
					puzzleString += genPuzzleState[x][y] + "";
				}
			}
			var solver = new solveObject(puzzleString, difficulty);
			solver.solve();
			var temp = solver.getSolution().split(":");
			var isSolved = temp[0];
			if(isSolved == "true"){
				removeCount++;
				console.log(puzzleString);
			}else{
				//console.log(temp[2]);
				genPuzzleState[candsx][candsy] = oldValue;
			}

		}else{
			
		}
	}
	console.log("SECOND " + removeCount);*/

	return genPuzzleState;
}
function solveObject(puzzleString, diff){
	this.difficulty = diff;
	var puzzle = new puzzleObject(puzzleString);
	this.puzzleState = puzzle.getPuzzleState();

	this.width = puzzle.getWidth();
	this.height = puzzle.getHeight();
	groupsArray = new Array();
	this.candidatesState = new Array(this.height);
	for(var i=0;i<=(this.height) - 1;i++){
		this.candidatesState[i] = new Array(this.width);
	}
	for (var x = 0; x < this.height; x++) {
		for (var y = 0; y < this.width; y++) {
			this.candidatesState[x][y] = new Array();
		}
	}
	if (this.difficulty == ("easy")){
		this.guessDepth = 0;
		this.guessLimit = 0;
		this.escapeLimit = 0;
	}else if (this.difficulty == ("medium")){
		this.guessDepth = 0;
		this.guessLimit = 0;
		this.escapeLimit = 0;
	}else if (this.difficulty == ("hard")){
		this.guessDepth = 2;
		this.guessLimit = 5;
		this.escapeLimit = 4;
	}else if (this.difficulty == ("harder")){
		this.guessDepth = 10;
		this.guessLimit = 10;
		this.escapeLimit = 100;
	}else if (this.difficulty == ("max")){
		this.guessDepth = 20;
		this.guessLimit = 20;
		this.escapeLimit = 100;
	}
	
	solveObject.prototype.solve = function(){
		solveCount = 0;
		guessCount = 0;

		createGroups(this.width, this.height, this.puzzleState);
		//console.log(groupsArray);
		solveLogic(this.width, this.height, this.puzzleState, this.candidatesState, groupsArray, solveCount, this.difficulty, this.guessDepth, this.guessLimit, this.escapeLimit, false);
		var solution = "";
		var solved = "true";
		for (var x=0;x < (this.height);x++) {
			for (var y=0; y < (this.width);y++) {
				//alert(puzzleState[x][y]);
				solution += this.puzzleState[x][y];
				if (this.puzzleState[x][y] == ("-")){
					solved = "false";
				}
			}
		}
		if(solved == "true"){
			for (h = 0; h < groupsArray.length; h++) {
				var currentGroup = groupsArray[h];
				if(currentGroup.getSize() * 1 != 1 && currentGroup.getSize() * 1 > currentGroup.getCells().length && currentGroup.isFinished == false && currentGroup.isMerged == false && currentGroup.getEscapes().length == 0){
					solved = "false";
				}
			}
		
			for (h = 0; h < groupsArray.length; h++) {
				var currentGroup = groupsArray[h];
				if(currentGroup.getCells().length > currentGroup.getSize()){
					solved = "false";
				}
			}
			for (h = 0; h < groupsArray.length; h++) {
				var currentGroup = groupsArray[h];
				var isValid = checkAdjacentGroups(currentGroup, this.puzzleState, this.width, this.height);
				if(isValid == false){
					solved = "false"
				}
			}
		}
		//console.log(groupsArray);

		this.solutionString = solved + ":" + solveCount + ":" + solution;
		
	}
	solveObject.prototype.getSolution = function(){
		return this.solutionString;
	}
}
function createGroups(width, height, puzzleState){
	//finds all empty sections
	var visitedEmptyCells = new Array();
	var visitedEmptyGroups = new Array();
	for (var x=0;x < (height);x++) {
		for (var y=0; y < (width);y++) {
			if(puzzleState[x][y] == "-" && visitedEmptyCells.indexOf(x + "-" + y) == -1){
				var visitedCells = travelCells(width, height, x, y, puzzleState, "-");
				visitedEmptyCells.push.apply(visitedEmptyCells, visitedCells);
				visitedEmptyGroups.push(visitedCells);
			}
		}
	}

	var allVisitedCells = new Array();
	for (x2=0;x2 < height;x2++) {
		for (y2=0; y2 < width;y2++) {
			if(puzzleState[x2][y2] != "-" && allVisitedCells.indexOf(x2 + "-" + y2) == -1){
				var groupNumber = puzzleState[x2][y2];

				var visitedCells = travelCells(width, height, x2, y2, puzzleState, groupNumber);
				allVisitedCells.push.apply(allVisitedCells, visitedCells);
				var isFinished = false;
				if(groupNumber == visitedCells.length){
					isFinished = true;
				}
				var allEscapes = new Array();
				if(isFinished == false){
					for (var i = 0; i < visitedCells.length; i++) {
						var coords = visitedCells[i].split("-");
						var candsx = coords[0] * 1;
						var candsy = coords[1] * 1;
						if(visitedEmptyCells.indexOf((candsx + 1) + "-" + candsy) != -1){
							if(allEscapes.indexOf((candsx + 1) + "-" + candsy) == -1){
								allEscapes.push((candsx + 1) + "-" + candsy);
							}
						}
						if(visitedEmptyCells.indexOf((candsx - 1) + "-" + candsy) != -1){
							if(allEscapes.indexOf((candsx - 1) + "-" + candsy) == -1){
								allEscapes.push((candsx - 1) + "-" + candsy);
							}
						}
						if(visitedEmptyCells.indexOf(candsx + "-" + (candsy + 1)) != -1){
							if(allEscapes.indexOf(candsx + "-" + (candsy + 1)) == -1){
								allEscapes.push(candsx + "-" + (candsy + 1));
							}
						}
						if(visitedEmptyCells.indexOf(candsx + "-" + (candsy - 1)) != -1){
							if(allEscapes.indexOf(candsx + "-" + (candsy - 1)) == -1){
								allEscapes.push(candsx + "-" + (candsy - 1));
							}
						}
					}
				}
				var group = new groupObject(groupNumber, visitedCells, allEscapes, isFinished, false, groupsArray.length);
				groupsArray.push(group);
			}
		}
	}
}
function travelCells(width, height, xCoord, yCoord, puzzleState, number){
	var visitedCells = new Array();
	var x = xCoord;
	var y = yCoord;
	var continueTraveling = true;
	while(continueTraveling == true){
		if (visitedCells.indexOf(x + "-" + y) == -1){
			visitedCells.push(x + "-" + y);
		}
		x = x * 1;
		y = y * 1;
		if(x != height - 1 && puzzleState[x + 1][y] == number && visitedCells.indexOf((x + 1) + "-" + y) == -1){
			x++;
		}else if(x != 0 && puzzleState[x - 1][y] == number && visitedCells.indexOf((x - 1) + "-" + y) == -1){
			x--;
		}else if(y != width - 1 && puzzleState[x][y + 1] == number && visitedCells.indexOf(x + "-" + (y + 1)) == -1){
			y++;
		}else if(y != 0 && puzzleState[x][y - 1] == number && visitedCells.indexOf(x + "-" + (y - 1)) == -1 ){
			y--;
		}else{
			var index = visitedCells.indexOf(x + "-" + y);
			if (index != 0){
				var lastCell = visitedCells[index - 1].split("-");
				x = lastCell[0];
				y = lastCell[1];

			}else{
				continueTraveling = false;
			}
		}
	}
	return visitedCells;
}
function solveLogic(w, h, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess){
	width = w;
	height = h;
	//puzzleState = puzzleState;
	//groupsArray = groupsArray;
	currSolveCount++;

	var oldPuzzleState = new Array(height);
	for(var i=0;i<=(height) - 1;i++){
		oldPuzzleState[i] = new Array(width);
	}
	for (var x=0;x < (height);x++) {
		for (var y=0; y < (width);y++) {
			oldPuzzleState[x][y] = puzzleState[x][y];
		}
	}
	var oldGroupsArrayString = JSON.stringify(groupsArray);

	//checks for solved
	var isSolved = true;
	for (var x=0;x < (height);x++) {
		for (var y=0; y < (width);y++) {
			if (puzzleState[x][y] == ("-")){
				isSolved = false;
			}
		}
	}
	if(doingGuess == true){
		isSolved = false;
	}
	//finds all empty sections
	var visitedEmptyCells = new Array();
	var visitedEmptyGroups = new Array();
	for (var x=0;x < (height);x++) {
		for (var y=0; y < (width);y++) {
			if(puzzleState[x][y] == "-" && visitedEmptyCells.indexOf(x + "-" + y) == -1){
				var visitedCells = travelCells(width, height, x, y, puzzleState, "-");
				visitedEmptyCells.push.apply(visitedEmptyCells, visitedCells);
				visitedEmptyGroups.push(visitedCells);
			}
		}
	}
	//creates candidates for cells in empty groups of 6 or less

	if(difficulty != "easy"){
		
		candidatesState = createCandidates(candidatesState, puzzleState, visitedEmptyGroups, width, height);

		for (var x3 = 0;x3 < (height);x3++) {
			for (var y3 = 0;y3 < (width);y3++) {
				if(candidatesState[x3][y3].length == 1){
					var added = false;
					for (h = 0; h < groupsArray.length; h++) {
						
						var currentGroup = groupsArray[h];
						if(currentGroup.size == candidatesState[x3][y3][0] && added == false){

							var currentCells = currentGroup.cells;
							var addToGroup = false;
							if(currentCells.indexOf((x3 + 1) + "-" + y3) != -1){
								addToGroup = true;
							}else if(currentCells.indexOf((x3 - 1) + "-" + y3) != -1){
								addToGroup = true;
							}else if(currentCells.indexOf(x3 + "-" + (y3 + 1)) != -1){
								addToGroup = true;
							}else if(currentCells.indexOf(x3 + "-" + (y3 - 1)) != -1){
								addToGroup = true;
							}
							if(addToGroup == true){
								//console.log(candidatesState);
								//console.log(visitedEmptyGroups);
								//console.log(groupsArray);
								//console.log(puzzleState);
								//4x4:1a3aaaa2a31aa2aa
								//3x3:a1aaaa3a1
								var puzzleString = generatePuzzleString(puzzleState, width, height);
								//console.log(puzzleString);

								//console.log("WHY" + x3 + "-" + y3 + "-" + candidatesState[x3][y3][0]);
								//puzzleState = modifyCell(puzzleState, x3, y3, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
								//puzzleState[x3][y3] = currentGroup.size + "";
								added = true;
							}
						}
					}

					if(added == false){
						var newEscapes = new Array();
						if(visitedEmptyCells.indexOf((x3 + 1) + "-" + y3) == true){
							newEscapes.push((x3 + 1) + "-" + y3);
						}
						if(visitedEmptyCells.indexOf((x3 - 1) + "-" + y3) == true){
							newEscapes.push((x3 - 1) + "-" + y3);
						}
						if(visitedEmptyCells.indexOf(x3 + "-" + (y3 + 1)) == true){
							newEscapes.push(x3 + "-" + (y3 + 1));
						}
						if(visitedEmptyCells.indexOf(x3 + "-" + (y3 - 1)) == true){
							newEscapes.push(x3 + "-" + (y3 - 1));
						}
						//var newGroup = new groupObject(candidatesState[x3][y3][0] * 1, new Array(x3 + "-" + y3), newEscapes, false, false, groupsArray.length);
						//groupsArray.push(newGroup);
						//puzzleState[x3][y3] = candidatesState[x3][y3][0] * 1;
						//console.log("WHOA");
						//console.log(x3 + "-" + y3 + " " + candidatesState[x3][y3][0]);
					}

					//console.log(x3 + "-" + y3 + " " + candidatesState[x3][y3]);
				}
			}
		}
	}
	//console.log(candidatesState);
	//console.log(visitedEmptyGroups);
	//finds small empty groups surrounded by all but one or all finished groups
	if(difficulty != "easy"){
		for (h = 0; h < visitedEmptyGroups.length; h++) {
			var currentEmptyGroup = visitedEmptyGroups[h];
			puzzleState = smallEmptyGroup(currentEmptyGroup, puzzleState, width, height, visitedEmptyCells, doingGuess);
		}
	}
	//finds unfinished groups with one escape
	for (h = 0; h < groupsArray.length; h++) {
		var currentGroup = groupsArray[h];
		if(currentGroup.isFinished == false && currentGroup.isMerged == false){
			puzzleState = oneEscape(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess);
		}
	}
	if(difficulty != "easy"){
		//finds unfinished groups that completely fill empty group
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.isFinished == false && currentGroup.isMerged == false){
				puzzleState = fillEmptyGroup(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess);
			}
		}
	}
	//finds unfinished groups where adjacent empty group is too small
	if(difficulty != "easy"){
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.isFinished == false && currentGroup.isMerged == false){
				puzzleState = tooSmallEmptyGroup(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess);
			}
		}
	}
	if(difficulty != "easy"){
		//replaces escapes with "1" to see if filling remainder is too small
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.isFinished == false && currentGroup.isMerged == false){
				puzzleState = replaceEscapes(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess);
			}
		}
	}
	//removes shared escapes where merge would result in an overlarge group
	if(difficulty != "easy"){
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.isFinished == false && currentGroup.isMerged == false){
				puzzleState = sharedEscape(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess);
			}
		}
	}
	if(difficulty != "easy"){
		//checks escapes to see if they touch finished group of same number
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.isFinished == false && currentGroup.isMerged == false){
				puzzleState = escapeFinished(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess);
			}
		}
	}

	//deletes merged groups
	for(h = groupsArray.length - 1; h > -1; h--) {
		var currentGroup = groupsArray[h];
		if(currentGroup.isMerged == true){

			groupsArray.splice(h, 1);
		}
	}

	//checks for no escapes
	if(difficulty != "easy" && difficulty != "medium"){
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.getSize() * 1 != 1 && currentGroup.getSize() * 1 > currentGroup.getCells().length && currentGroup.isFinished == false && currentGroup.isMerged == false && currentGroup.getEscapes().length == 0){
				//console.log(groupsArray);
				//console.log("ALERT");
				//console.log(currentGroup);
				invalidGuess = true;
			}
		}
	}
	//checks for too large groups
	if(difficulty != "easy" && difficulty != "medium"){
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			if(currentGroup.getCells().length > currentGroup.getSize()){
				//console.log(groupsArray);
				//console.log("ALERT");
				//console.log(currentGroup);
				invalidGuess = true;
			}
		}
	}
	//checks for adjacent groups of same number
	if(difficulty != "easy" && difficulty != "medium"){
		var foundInvalid = false;
		for (h = 0; h < groupsArray.length; h++) {
			var currentGroup = groupsArray[h];
			var isValid = checkAdjacentGroups(currentGroup, puzzleState, width, height);
			if(isValid == false){
				foundInvalid = true;
				invalidGuess = true;

			}
		}
	}

	//checks for invalid small empty groups
	/*
	if(difficulty != "easy" && difficulty != "medium"){
		for (h = 0; h < visitedEmptyGroups.length; h++) {
			var currentEmptyGroup = visitedEmptyGroups[h];
			//var isValid = checkEmptyGroup(currentEmptyGroup, puzzleState, width, height, visitedEmptyCells);
			//puzzleState = smallEmptyGroup(currentEmptyGroup, puzzleState, width, height, visitedEmptyCells);
		}
	}*/
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			candidatesState[x][y] = new Array();
		}
	}
	var groupsArrayString = JSON.stringify(groupsArray);
	if(isSolved == false){
		if (doingGuess == false){
			if (((JSON.stringify(puzzleState) != JSON.stringify(oldPuzzleState)) || (groupsArrayString != oldGroupsArrayString))  && currSolveCount < 10000) {
				solveLogic(width, height, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess);
			}else{
				if(guessCount < guessLimit){
					startGuess(width, height, puzzleState, candidatesState, groupsArray, visitedEmptyCells, currSolveCount, guessDepth, guessLimit, escapeLimit, "add");
					solveLogic(width, height, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess);
				}
			}
		}else{
			if ((JSON.stringify(puzzleState) != JSON.stringify(oldPuzzleState) || (groupsArrayString != oldGroupsArrayString)) && currSolveCount < 10000 && invalidGuess == false && guessSolveCount < guessDepth) {

				guessSolveCount++;
				solveLogic(width, height, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess);
			}else{

			}
		}
	}else{
		solveCount = currSolveCount;
	}
}
function createCandidates(candidatesState, puzzleState, visitedEmptyGroups, width, height){
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			candidatesState[x][y] = new Array();
		}
	}

	for (h = 0; h < visitedEmptyGroups.length; h++) {
		var currentEmptyGroup = visitedEmptyGroups[h];
		if(currentEmptyGroup.length <= 6 && currentEmptyGroup.length > 0){
			var accessibleGroups = new Array();
			for (i = 0; i < currentEmptyGroup.length; i++) {
				var currentCell = currentEmptyGroup[i];
				for (j = 0; j < groupsArray.length; j++) {
					var checkGroup = groupsArray[j];
					if(checkGroup.escapes.indexOf(currentCell) != -1){
						if(accessibleGroups.indexOf(checkGroup) == -1){
							accessibleGroups.push(checkGroup);
						}
					}
				}
			}
			if(accessibleGroups.length == 0){
				
				for (i = 0; i < currentEmptyGroup.length; i++) {
				
					var cell = currentEmptyGroup[i];
					var temp = cell.split("-");
					var x = temp[0] * 1;
					var y = temp[1] * 1;
					//candidatesState[x][y] = new Array();
					for (j = 1; j < currentEmptyGroup.length + 1; j++) {
						var addCandidate = true;
						if(x != 0 && puzzleState[x - 1][y] == j){
							addCandidate = false;
						}
						if(x != height - 1 && puzzleState[x + 1][y] == j){
							addCandidate = false;
						}
						if(y != 0 && puzzleState[x][y - 1] == j){
							addCandidate = false;
						}
						if(x != width - 1 && puzzleState[x][y + 1] == j){
							addCandidate = false;
						}
						if(addCandidate == true){
							candidatesState[x][y].push(j);
						}
					}
				}
			}else{
				if(currentEmptyGroup.length < 7){
					var accessibleNumbers = new Array();
					
					for (i = 0; i < accessibleGroups.length; i++) {
						if(accessibleGroups[i].isFinished == false){
							accessibleNumbers.push(accessibleGroups[i].size * 1);
						}
					}

					for (i = 0; i < accessibleGroups.length; i++) {
						var accessibleGroupCells = accessibleGroups[i].cells;
						var accessibleGroupSize = accessibleGroups[i].size;
						var maxDistance = accessibleGroupSize - accessibleGroupCells.length;
						for (j = 0; j < accessibleGroupCells.length; j++) {
							var groupCell = accessibleGroupCells[j];
							var temp = groupCell.split("-");
							var groupX = temp[0] * 1;
							var groupY = temp[1] * 1;
							for (k = 0; k < currentEmptyGroup.length; k++) {
								var cell = currentEmptyGroup[k];
								var temp = cell.split("-");
								var emptyX = temp[0] * 1;
								var emptyY = temp[1] * 1;
								var distance = Math.abs(groupX - emptyX) + Math.abs(groupY - emptyY);
								//console.log(emptyX + "-" + emptyY + "  " + groupX + "-" + groupY + "  " + distance + "-" + maxDistance + "-" + accessibleGroupSize)
								if(distance <= maxDistance){
									if(candidatesState[emptyX][emptyY].indexOf(accessibleGroupSize) == -1){

										candidatesState[emptyX][emptyY].push(accessibleGroupSize * 1);
									}
								}
							}
						}
					}

					for (i = 0; i < currentEmptyGroup.length; i++) {

						var cell = currentEmptyGroup[i];
						var temp = cell.split("-");
						var x = temp[0] * 1;
						var y = temp[1] * 1;
						//candidatesState[x][y] = new Array();
						for (k = 1; k < currentEmptyGroup.length + 1; k++) {
							//if(k == currentEmptyGroup.length && accessibleNumbers.indexOf(currentEmptyGroup.length) == -1){
								var addCandidate = true;
								if(x != 0 && puzzleState[x - 1][y] == k){
									addCandidate = false;
								}
								if(x != height - 1 && puzzleState[x + 1][y] == k){
									addCandidate = false;
								}
								if(y != 0 && puzzleState[x][y - 1] == k){
									addCandidate = false;
								}
								if(x != width - 1 && puzzleState[x][y + 1] == k){
									addCandidate = false;
								}
								if(addCandidate == true){
									if(candidatesState[x][y].indexOf(k) == -1){
										//if(k <= currentEmptyGroup.length && accessibleNumbers.indexOf(currentEmptyGroup.length) != -1){
											//number is unreachable, and placing it would fill whole empty group, making resultant group too big
										//}else{
											candidatesState[x][y].push(k);
										//}
									}
								}
							//}
						}
						/*
						for (k = 0; k < accessibleNumbers.length; k++) {
							if(candidatesState[x][y].indexOf(accessibleNumbers[k]) == -1){
								candidatesState[x][y].push(accessibleNumbers[k]);
							}
						}*/

					}
				}
			}
		}
	}
	//console.log(candidatesState);
	return candidatesState;
}
function checkAdjacentGroups(currentGroup, puzzleState, width, height){
	var currentCells = currentGroup.cells;
	var isValid = true;
	for(i = currentCells.length - 1; i > -1; i--) {
		var currentCell = currentCells[i];
		for (j = 0; j < groupsArray.length; j++) {
			var checkGroup = groupsArray[j];
			var checkCells = checkGroup.cells;
			if(checkGroup.size == currentGroup.size && checkGroup.id != currentGroup.id && isValid == true){
				for (k = 0; k < checkCells.length; k++) {
					var coords = checkCells[k].split("-");
					var x = coords[0] * 1;
					var y = coords[1] * 1;
					if((x + 1) + "-" + y == currentCell){
						isValid = false;
					}else if((x - 1) + "-" + y == currentCell){
						isValid = false;
					}else if(x + "-" + (y + 1) == currentCell){
						isValid = false;
					}else if(x + "-" + (y - 1) == currentCell){
						isValid = false;
					}
				}
				if(isValid == false){
					//console.log("ALERT");
					//console.log(currentGroup);
					//console.log(checkGroup);
				}
			}
		}
	}
	return isValid;
}
function startGuess(width, height, puzzleState, candidatesState, groupsArray, visitedEmptyCells, currSolveCount, guessDepth, guessLimit, escapeLimit, type){
	var invalidEscapes = new Array();
	guessCount++;
	
	//holds puzzle state for resetting later
	var startPuzzleState;
	startPuzzleState = new Array(height);
	for(var i = 0;i <= (height - 1); i++){
		startPuzzleState[i] = new Array(width);
	}
	for (var x = 0; x < (height); x++) {
		for (var y = 0; y < (width); y++) {
			startPuzzleState[x][y] = puzzleState[x][y];
		}
	}
	var startCandidatesState;
	startCandidatesState = new Array(height);
	for(var i = 0;i <= (height - 1); i++){
		startCandidatesState[i] = new Array(width);
	}
	for (var x = 0; x < (height); x++) {
		for (var y = 0; y < (width); y++) {
			startCandidatesState[x][y] = candidatesState[x][y].slice(0);
		}
	}
	var oldVisitedEmptyCells = new Array();
	oldVisitedEmptyCells = visitedEmptyCells.slice(0);
	var startGroupsArray = new Array();
	for(var x = 0; x < groupsArray.length; x++){
		//postMessage(seriesArray[x].getCells());
		var si = groupsArray[x].getSize();
		var ce = groupsArray[x].getCells().slice(0);
		var es = groupsArray[x].getEscapes().slice(0);
		var fi = groupsArray[x].getIsFinished();
		var me = groupsArray[x].getIsMerged();
		var id = groupsArray[x].getId();
		
		//startSeriesArray.push(seriesArray[x].createClone());
		var newGroup = new groupObject(si, ce, es, fi, me, id);
		startGroupsArray.push(newGroup);
	}


	for(i2 = startGroupsArray.length - 1; i2 > -1; i2--) {
		
		//var currentGroup = groupsArray[i];
		var guessGroupEscapes = startGroupsArray[i2].getEscapes().slice(0);
		if(guessGroupEscapes.length <= escapeLimit){
			//console.log(i2 + " " + guessGroupEscapes);
			for(var j2 = guessGroupEscapes.length - 1; j2 > -1; j2--) {
				var currentGuessGroup = groupsArray[i2];

				//var temp = currentGroup.getEscapes();
				var coords = guessGroupEscapes[j2].split("-");
				var guessx = coords[0] * 1;
				var guessy = coords[1] * 1;
				
				var value = currentGuessGroup.getSize();
				//3x3:aa22aa1a1
				//3x3:a32aaaa31
				//5x5:533aaaaaaa5a54aa3a452aa2a
				//4x4:a32a1aa4aaaa4aa4
				//3x3:aaaaa3a31

				//6x6:a1aa2a2a6aa13a4a2aaaa13a315a132aaaa2
				//4x4:aa21a34a4aaa4a1a
				//4x4:2a3aa4aaa3422aaa

				//4x4:3aa4aa1aa3aa1aa2
				doingGuess = true;
				//postMessage(seriesArray
				//console.log("testing " + value + " at " + guessx + "-" + guessy);
				if(type == "add"){
					puzzleState = modifyCell(puzzleState, guessx, guessy, currentGuessGroup.size, currentGuessGroup, visitedEmptyCells, doingGuess);
					solveLogic(width, height, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess);
				}else{
					currentGuessGroup.getEscapes().splice(j2, 1);
					solveLogic(width, height, puzzleState, candidatesState, groupsArray, currSolveCount, difficulty, guessDepth, guessLimit, escapeLimit, doingGuess);
				}
				guessSolveCount = 0;
				doingGuess = false;
				

				for (var x2=0;x2 < height; x2++) {
					for (var y2=0; y2 < width; y2++) {
						puzzleState[x2][y2] = startPuzzleState[x2][y2];
					}
				}
				
				groupsArray.length = 0;
				for(var x3 = 0; x3 < startGroupsArray.length; x3++){
					var si = startGroupsArray[x3].getSize();
					var ce = startGroupsArray[x3].getCells().slice(0);
					var es = startGroupsArray[x3].getEscapes().slice(0);
					var fi = startGroupsArray[x3].getIsFinished();
					var me = startGroupsArray[x3].getIsMerged();
					var id = startGroupsArray[x3].getId();
					
					//startSeriesArray.push(seriesArray[x].createClone());
					var newGroup = new groupObject(si, ce, es, fi, me, id);
					groupsArray.push(newGroup);
				}
				visitedEmptyCells.length = 0;
				visitedEmptyCells = oldVisitedEmptyCells.slice(0);
				//console.log(groupsArray);
				//remove escapes that cause invalid positions
				if (invalidGuess == true){
					//console.log("testing " + value + " at " + x + "-" + y);

					//console.log("HOLY");
					invalidEscapes.push(value + "-" + guessx + "-" + guessy);
					//console.log(groupsArray);
				}else{

					//var temp = currentGroup.getEscapes();
					//temp.push(x8 + "-" + y8);
				}
				invalidGuess = false;
			}
		}
	}

	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			puzzleState[x][y] = startPuzzleState[x][y];
		}
	}
	for (var x = 0; x < height; x++) {
		for (var y = 0; y < width; y++) {
			candidatesState[x][y] = startCandidatesState[x][y];
		}
	}
	groupsArray.length = 0;
	for(var x4 = 0; x4 < startGroupsArray.length; x4++){
		var si = startGroupsArray[x4].getSize();
		var ce = startGroupsArray[x4].getCells().slice(0);
		var es = startGroupsArray[x4].getEscapes().slice(0);
		var fi = startGroupsArray[x4].getIsFinished();
		var me = startGroupsArray[x4].getIsMerged();
		var id = startGroupsArray[x4].getId();
		
		//startSeriesArray.push(seriesArray[x].createClone());
		var newGroup = new groupObject(si, ce, es, fi, me, id);
		groupsArray.push(newGroup);
	}
	if(type == "add"){
		for (var i3 = 0; i3 < invalidEscapes.length; i3++) {
			var temp = invalidEscapes[i3].split("-");
			var value = temp[0];
			var removex = temp[1];
			var removey = temp[2];
			for (var j3 = 0; j3 < groupsArray.length; j3++) {
				var currentGroup = groupsArray[j3];
				if(currentGroup.getSize() == value){
					var tempEscapes = currentGroup.getEscapes();
					var index = tempEscapes.indexOf(removex + "-" + removey);
					if(index != -1){
						//console.log("removing " + removex + "-" + removey);
						tempEscapes.splice(index, 1);
					}
				}
			}
		}
	}else{
		for (var i3 = 0; i3 < invalidEscapes.length; i3++) {
			var temp = invalidEscapes[i3].split("-");
			var value = temp[0];
			var addx = temp[1];
			var addy = temp[2];
			for (var j3 = 0; j3 < groupsArray.length; j3++) {
				var currentGroup = groupsArray[j3];
				if(currentGroup.getSize() == value){
					var tempEscapes = currentGroup.getEscapes();
					var index = tempEscapes.indexOf(addx + "-" + addy);
					if(index != -1){
						console.log("adding " + addx + "-" + addy + " to " + currentGroup.size);
						puzzleState = modifyCell(puzzleState, addx, addy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
					}
				}
			}
		}
	}
}
function modifyCell(puzzleState, x, y, number, currentGroup, visitedEmptyCells, doingGuess){
	//x = x * 1;
	//y = y * 1;

	if(currentGroup.cells.indexOf((x + "-" + y) == -1)){
		//console.log("modifying");
		if(doingGuess == false){
			postMessage("solving " + x + "-" + y);
		}
		//console.log("what" + x + "-" + y);
		//console.log(currentGroup);
		puzzleState[x][y] = (number * 1);
		//console.log(currentGroup.getCells());
		currentGroup.addCell(x + "-" + y);
		//console.log(currentGroup.getCells());
		var index = visitedEmptyCells.indexOf(x + "-" + y);
		if(index != -1){
			visitedEmptyCells.splice(index, 1);
		}

		//checks for group merges

		for(i = groupsArray.length - 1; i > -1; i--) {
			
			var doMerge = false;
			var checkGroup = groupsArray[i];
			var mergedEscapes = checkGroup.getEscapes();
			if(checkGroup.size == number && checkGroup.id != currentGroup.id){
				var checkGroupCells = checkGroup.getCells();
				if(checkGroupCells.indexOf((x + 1) + "-" + y) != -1){
					doMerge = true;
				}else if(checkGroupCells.indexOf((x - 1) + "-" + y) != -1){
					doMerge = true;
				}else if(checkGroupCells.indexOf(x + "-" + (y + 1)) != -1){
					doMerge = true;
				}else if(checkGroupCells.indexOf(x + "-" + (y - 1)) != -1){
					doMerge = true;
				}
				if(doMerge == true){
					
					//console.log("merging");

					//marks group as merged
					checkGroup.isMerged = true;
					//console.log(currentGroup);
					//console.log(checkGroup);

					for (k = 0; k < checkGroupCells.length; k++) {
						if(currentGroup.cells.indexOf(checkGroupCells[k] == -1)){
							//console.log(groupCells[k] + " " + currentGroup.cells);
							currentGroup.addCell(checkGroupCells[k]);
						}
					}
					for (l = 0; l < mergedEscapes.length; l++) {
						if(currentGroup.escapes.indexOf(mergedEscapes[l]) == -1 && mergedEscapes[l] != (x + "-" + y)){
							currentGroup.addEscape(mergedEscapes[l]);
						}
					}
					//console.log("WHY");
					//console.log(currentGroup);
				}
			}
			currentGroup.cells = Array.from(new Set(currentGroup.cells));
			//removes added cell from escapes
			var index = mergedEscapes.indexOf(x + "-" + y);
			//if(index != -1 && checkGroup.id != currentGroup.id){
			if(index != -1){
				//console.log("removing escape " + x + "-" + y)
				mergedEscapes.splice(index, 1);
			}
		}

		//modify escapes for group	
		var tempEscapes = currentGroup.escapes.splice(0);

		if(visitedEmptyCells.indexOf((x + 1) + "-" + y) != -1){
			if(tempEscapes.indexOf((x + 1) + "-" + y) == -1){
				tempEscapes.push((x + 1) + "-" + y);
			}
		}
		if(visitedEmptyCells.indexOf((x - 1) + "-" + y) != -1){
			if(tempEscapes.indexOf((x - 1) + "-" + y) == -1){
				tempEscapes.push((x - 1) + "-" + y);
			}
		}
		if(visitedEmptyCells.indexOf(x + "-" + (y + 1)) != -1){
			if(tempEscapes.indexOf(x + "-" + (y + 1)) == -1){
				tempEscapes.push(x + "-" + (y + 1));
			}
		}
		if(visitedEmptyCells.indexOf(x + "-" + (y - 1)) != -1){
			if(tempEscapes.indexOf(x + "-" + (y - 1)) == -1){
				tempEscapes.push(x + "-" + (y - 1));
			}
		}

		currentGroup.escapes = tempEscapes;
		//console.log(groupsArray);
		if(currentGroup.getCells().length == number){
			currentGroup.isFinished = true;
			currentGroup.escapes = new Array();
		}
		/*
		if(x == 3 && y == 1 && number == 3){
			console.trace();
			console.log(currentGroup);
			console.log(visitedEmptyCells);
			console.log(tempEscapes);
			console.log(currentGroup.escapes);
		}*/
	}
	return puzzleState;
}
function checkEmptyGroup(currentEmptyGroup, puzzleState, width, height, visitedEmptyCells, doingGuess){
	/*
	if(currentEmptyGroup.length < 3){
		var accessibleGroups = new Array();
		for (i = 0; i < currentEmptyGroup.length; i++) {
			var currentCell = currentEmptyGroup[i];
			for (j = 0; j < groupsArray.length; j++) {
				var checkGroup = groupsArray[j];
				if(checkGroup.escapes.indexOf(currentCell) != -1){
					if(accessibleGroups.indexOf(checkGroup) == -1){
						accessibleGroups.push(checkGroup);
					}
				}
			}
		}
		//console.log(accessibleGroups + currentEmptyGroup);
		if(accessibleGroups.length == 0){
			//console.log("FOUND" + currentEmptyGroup);
			//var newGroup = new groupObject(currentEmptyGroup.length, currentEmptyGroup, new Array(), false, false, groupsArray.length);
			//groupsArray.push(newGroup);
			for (i = 0; i < currentEmptyGroup.length; i++) {
				var currentCell = currentEmptyGroup[i];
				var coords = currentEmptyGroup[i].split("-");
				var newx = coords[0] * 1;
				var newy = coords[1] * 1;
				puzzleState[newx][newy] = currentEmptyGroup.length;
				//puzzleState = modifyCell(puzzleState, newx, newy, newGroup.size, newGroup, visitedEmptyCells, doingGuess);
			}
		}

	}
	return puzzleState;*/
}
function replaceEscapes(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess){
	var escapes = currentGroup.escapes;
	var cells = currentGroup.cells;
	var invalidEscapes = new Array();
	//console.log(visitedEmptyCells);
	//console.log(escapes);
	for (i = 0; i < cells.length; i++) {

		var coords = cells[i].split("-");
		var cellx = coords[0] * 1;
		var celly = coords[1] * 1;
		if(visitedEmptyCells.indexOf((cellx + 1) + "-" + celly) != -1 && escapes.indexOf((cellx + 1) + "-" + celly) == -1){
			invalidEscapes.push((cellx + 1) + "-" + celly);
			//console.log((cellx + 1) + "-" + celly  + currentGroup);
		}
		if(visitedEmptyCells.indexOf((cellx - 1) + "-" + celly) != -1 && escapes.indexOf((cellx - 1) + "-" + celly) == -1){
			invalidEscapes.push((cellx - 1) + "-" + celly);
			//console.log((cellx - 1) + "-" + celly  + currentGroup);
		}
		if(visitedEmptyCells.indexOf(cellx + "-" + (celly + 1)) != -1 && escapes.indexOf(cellx + "-" + (celly + 1)) == -1){
			invalidEscapes.push(cellx + "-" + (celly + 1));
			//console.log(cellx + "-" + (celly + 1) + currentGroup);
		}
		if(visitedEmptyCells.indexOf(cellx + "-" + (celly - 1)) != -1 && escapes.indexOf(cellx + "-" + (celly - 1)) == -1){
			invalidEscapes.push(cellx + "-" + (celly - 1));
			//console.log(cellx + "-" + (celly - 1) + currentGroup);
		}
	}
	//console.log(invalidEscapes);
	//var invalidEscapes = new Array();
	for (i = 0; i < escapes.length; i++) {
		var escape = escapes[i];
		var coords = escape.split("-");
		var escapex = coords[0] * 1;
		var escapey = coords[1] * 1;
		var temp = currentGroup.cells[0];
		coords = temp.split("-");
		var startx = coords[0] * 1;
		var starty = coords[1] * 1;
		puzzleState[escapex][escapey] = "1";
		//something to not travel through removed escapes??????
		var isValid = validFillCells(width, height, startx, starty, puzzleState, currentGroup.size, invalidEscapes);
		if(isValid == false){
			//console.log("FOUND" + escapex + "-" + escapey);
			//puzzleState[escapex][escapey] = "-";
			puzzleState = modifyCell(puzzleState, escapex, escapey, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
		}else{
			//console.log("NOT FOUND" + escapex + "-" + escapey);
			puzzleState[escapex][escapey] = "-";
		}
	}
	return puzzleState;
}
function validFillCells(width, height, xCoord, yCoord, puzzleState, number, invalidEscapes){
	var visitedCells = new Array();
	var x = xCoord;
	var y = yCoord;
	var continueTraveling = true;
	var isValidFill = true;
	while(continueTraveling == true){
		if(visitedCells.indexOf(x + "-" + y) == -1){
			visitedCells.push(x + "-" + y);
		}
		if(visitedCells.length >= (number * 1)){
			continueTraveling = false;
			isValidFill = true;
		}
		x = x * 1;
		y = y * 1;
		if(x != height - 1 && (puzzleState[x + 1][y] == number || puzzleState[x + 1][y] == "-") && visitedCells.indexOf((x + 1) + "-" + y) == -1 && invalidEscapes.indexOf((x + 1) + "-" + y) == -1){
			x++;
		}else if(x != 0 && (puzzleState[x - 1][y] == number || puzzleState[x - 1][y] == "-") && visitedCells.indexOf((x - 1) + "-" + y) == -1 && invalidEscapes.indexOf((x - 1) + "-" + y) == -1){
			x--;
		}else if(y != width - 1 && (puzzleState[x][y + 1] == number || puzzleState[x][y + 1] == "-") && visitedCells.indexOf(x + "-" + (y + 1)) == -1 && invalidEscapes.indexOf(x + "-" + (y + 1)) == -1){
			y++;
		}else if(y != 0 && (puzzleState[x][y - 1] == number || puzzleState[x][y - 1] == "-") && visitedCells.indexOf(x + "-" + (y - 1)) == -1 && invalidEscapes.indexOf(x + "-" + (y - 1)) == -1){
			y--;
		}else{
			var index = visitedCells.indexOf(x + "-" + y);
			if (index != 0){
				var lastCell = visitedCells[index - 1].split("-");
				x = lastCell[0];
				y = lastCell[1];

			}else{
				continueTraveling = false;
			}
		}
	}
	if(visitedCells.length < (number * 1)){
		isValidFill = false;
	}
	return isValidFill;
}
function smallEmptyGroup(currentEmptyGroup, puzzleState, width, height, visitedEmptyCells, doingGuess){
	if(currentEmptyGroup.length < 3){
		var accessibleGroups = new Array();
		for (i = 0; i < currentEmptyGroup.length; i++) {
			var currentCell = currentEmptyGroup[i];
			for (j = 0; j < groupsArray.length; j++) {
				var checkGroup = groupsArray[j];
				if(checkGroup.escapes.indexOf(currentCell) != -1){
					if(accessibleGroups.indexOf(checkGroup) == -1){
						accessibleGroups.push(checkGroup);
					}
				}
			}
		}
		//console.log(accessibleGroups + currentEmptyGroup);
		if(accessibleGroups.length == 0){
			//console.log("FOUND" + currentEmptyGroup);
			var newGroup = new groupObject(currentEmptyGroup.length, currentEmptyGroup, new Array(), false, false, groupsArray.length);
			groupsArray.push(newGroup);
			for (i = 0; i < currentEmptyGroup.length; i++) {
				var currentCell = currentEmptyGroup[i];
				var coords = currentEmptyGroup[i].split("-");
				var newx = coords[0] * 1;
				var newy = coords[1] * 1;
				puzzleState[newx][newy] = currentEmptyGroup.length;
				//puzzleState = modifyCell(puzzleState, newx, newy, newGroup.size, newGroup, visitedEmptyCells, doingGuess);
			}
		}
		if(accessibleGroups.length == 1 && currentEmptyGroup.length == 1){
			//console.log("FOUND" + currentEmptyGroup);
			var currentGroup = accessibleGroups[0];
			var escape = currentEmptyGroup[0];
			var coords = escape.split("-");
			var escapex = coords[0] * 1;
			var escapey = coords[1] * 1;
			var adjacentOne = false;
			if(escapex != height - 1 && puzzleState[escapex + 1][escapey] == 1){
				adjacentOne = true;
			}
			if(escapex != 0 && puzzleState[escapex - 1][escapey] == 1){
				adjacentOne = true;
			}
			if(escapey != width - 1 && puzzleState[escapex][escapey + 1] == 1){
				adjacentOne = true;
			}
			if(escapey != 0 && puzzleState[escapex][escapey - 1] == 1){
				adjacentOne = true;
			}
			if(adjacentOne == true && currentGroup.size != 1){
				puzzleState = modifyCell(puzzleState, escapex, escapey, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
		}
	}
	if(currentEmptyGroup.length == 3){
		var accessibleGroups = new Array();
		for (i = 0; i < currentEmptyGroup.length; i++) {
			var currentCell = currentEmptyGroup[i];
			for (j = 0; j < groupsArray.length; j++) {
				var checkGroup = groupsArray[j];
				if(checkGroup.escapes.indexOf(currentCell) != -1){
					if(accessibleGroups.indexOf(checkGroup) == -1){
						accessibleGroups.push(checkGroup);
					}
				}
			}
		}
		if(accessibleGroups.length == 0){
			var adjacentOnes = new Array();
			var adjacentTwos = new Array();
			var adjacentThrees = new Array();
			for (i = 0; i < currentEmptyGroup.length; i++) {
				var coords = currentEmptyGroup[i].split("-");
				var emptyX = coords[0] * 1;
				var emptyY = coords[1] * 1;
				var adjacentOne = false;
				var adjacentTwo = false;
				var adjacentThree = false;

				if((emptyX != height - 1 && puzzleState[emptyX + 1][emptyY] == 1) || (emptyX != 0 && puzzleState[emptyX - 1][emptyY] == 1) ||
					(emptyY != width - 1 && puzzleState[emptyX][emptyY + 1] == 1) || (emptyY != 0 && puzzleState[emptyX][emptyY - 1] == 1)){
					adjacentOne = true;
				}
				adjacentOnes.push(adjacentOne);

				if((emptyX != height - 1 && puzzleState[emptyX + 1][emptyY] == 2) || (emptyX != 0 && puzzleState[emptyX - 1][emptyY] == 2) ||
					(emptyY != width - 1 && puzzleState[emptyX][emptyY + 1] == 2) || (emptyY != 0 && puzzleState[emptyX][emptyY - 1] == 2)){
					adjacentTwo = true;
				}
				adjacentTwos.push(adjacentTwo);

				if((emptyX != height - 1 && puzzleState[emptyX + 1][emptyY] == 3) || (emptyX != 0 && puzzleState[emptyX - 1][emptyY] == 3) ||
					(emptyY != width - 1 && puzzleState[emptyX][emptyY + 1] == 3) || (emptyY != 0 && puzzleState[emptyX][emptyY - 1] == 3)){
					adjacentThree = true;
				}
				adjacentThrees.push(adjacentThree);
			}
			//console.log(adjacentOnes);
			//console.log(adjacentTwos);
			//console.log(adjacentThrees);
			var foundSingleCandidate = false;
			for (i = 0; i < currentEmptyGroup.length; i++) {
				if(adjacentOnes[i] == true && adjacentTwos[i] == true){
					console.log("AAAAAAHHHH");
					foundSingleCandidate = true;
					var newGroup = new groupObject(currentEmptyGroup.length, currentEmptyGroup, new Array(), false, false, groupsArray.length);
					groupsArray.push(newGroup);
					for (i = 0; i < currentEmptyGroup.length; i++) {
						var currentCell = currentEmptyGroup[i];
						var coords = currentEmptyGroup[i].split("-");
						var newx = coords[0] * 1;
						var newy = coords[1] * 1;
						puzzleState[newx][newy] = currentEmptyGroup.length;
						//puzzleState = modifyCell(puzzleState, newx, newy, newGroup.size, newGroup, visitedEmptyCells, doingGuess);
					}
				}else if(adjacentOnes[i] == true && adjacentThrees[i] == true){
					//6x6:1aa12aa1a33aa3aaa32a2aaaaaaa5a6a6a1a

					console.log("HOOOOOOLLY")
					foundSingleCandidate = true;
					//var index = adjacentTwos.indexOf(false);
					//var newTwo = adjacentTwos[index];
					var coords = currentEmptyGroup[i].split("-");
					var newx = coords[0] * 1;
					var newy = coords[1] * 1;
					var newEscapes = new Array();
					if(currentEmptyGroup.indexOf((newx + 1) + "-" + newy) != -1){
						newEscapes.push((newx + 1) + "-" + newy);
					}
					if(currentEmptyGroup.indexOf((newx - 1) + "-" + newy) != -1){
						newEscapes.push((newx - 1) + "-" + newy);
					}
					if(currentEmptyGroup.indexOf(newx + "-" + (newy + 1)) != -1){
						newEscapes.push(newx + "-" + (newy + 1));
					}
					if(currentEmptyGroup.indexOf(newx + "-" + (newy - 1)) != -1){
						newEscapes.push(newx + "-" + (newy - 1));
					}
					console.log(newx + "-" + newy);
					console.log(currentEmptyGroup);
					console.log(newEscapes);
					var newGroup = new groupObject(2, new Array(currentEmptyGroup[i]), newEscapes, false, false, groupsArray.length);
					groupsArray.push(newGroup);
					puzzleState[newx][newy] = 2;
				}else if(adjacentTwos[i] == true && adjacentThrees[i] == true){
					foundSingleCandidate = true;
					console.log("WOOOOOW");
					//var index = adjacentOnes.indexOf(false)
					//var newOne = adjacentOnes[index];
					var newGroup = new groupObject(1, new Array(currentEmptyGroup[i]), new Array(), true, false, groupsArray.length);
					groupsArray.push(newGroup);
					var coords = currentEmptyGroup[i].split("-");
					var newx = coords[0] * 1;
					var newy = coords[1] * 1;
					puzzleState[newx][newy] = 1;
				}
			}
			var trueCount = countArray(adjacentOnes, true);
			if(trueCount == 2 && foundSingleCandidate == false){
				var cell1;
				var cell2;
				if(adjacentOnes[0] == true){
					cell1 = currentEmptyGroup[0];
					if(adjacentOnes[1] == true){
						cell2 = currentEmptyGroup[1];
					}else{
						cell2 = currentEmptyGroup[2];
					}
				}else{
					cell1 = currentEmptyGroup[1];
					cell2 = currentEmptyGroup[2];
				}
				if(checkAdjacent(cell1, cell2) == true){
					if(adjacentThrees.indexOf(true) != -1){
						//console.log("WOOOOOW");
						var index = adjacentOnes.indexOf(false)
						var newOne = adjacentOnes[index];
						var newGroup = new groupObject(1, new Array(currentEmptyGroup[index]), new Array(), false, false, groupsArray.length);
						groupsArray.push(newGroup);
						var coords = currentEmptyGroup[index].split("-");
						var newx = coords[0] * 1;
						var newy = coords[1] * 1;
						puzzleState[newx][newy] = 1;
					}
				}else{
					//console.log("AAAAAAHHHH");
					var newGroup = new groupObject(currentEmptyGroup.length, currentEmptyGroup, new Array(), false, false, groupsArray.length);
					groupsArray.push(newGroup);
					for (i = 0; i < currentEmptyGroup.length; i++) {
						var currentCell = currentEmptyGroup[i];
						var coords = currentEmptyGroup[i].split("-");
						var newx = coords[0] * 1;
						var newy = coords[1] * 1;
						puzzleState[newx][newy] = currentEmptyGroup.length;
						//puzzleState = modifyCell(puzzleState, newx, newy, newGroup.size, newGroup, visitedEmptyCells, doingGuess);
					}
				}
			}
		}
	}
	return puzzleState;
}

function oneEscape(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess){
	var escapes = currentGroup.escapes;
	//console.log(currentGroup.size + "-" + allEscapes.length);
	if(escapes.length == 1){
		var coords = escapes[0].split("-");
		var escapex = coords[0] * 1;
		var escapey = coords[1] * 1;

		//console.log(allEscapes[0]);
		puzzleState = modifyCell(puzzleState, escapex, escapey, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
	}
	
	return puzzleState;
}
function fillEmptyGroup(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess){
	var totalAccessibleCells = new Array();
	var groupEscapes = currentGroup.escapes;
	for (i = 0; i < visitedEmptyGroups.length; i++) {
		var emptyGroupCells = visitedEmptyGroups[i];
		var foundEmpty = false
		for (j = 0; j < emptyGroupCells.length; j++) {
			if(groupEscapes.indexOf(emptyGroupCells[j]) != -1 && foundEmpty == false){
				totalAccessibleCells.push.apply(totalAccessibleCells, emptyGroupCells);
				foundEmpty = true;
			}
		}
	}
	if(totalAccessibleCells.length == currentGroup.size - currentGroup.cells.length){
		//checks that no escapes of different but same size group access accessible cells
		var validFill = true;
		for (l = 0; l < groupsArray.length; l++) {
			var checkGroup = groupsArray[l];
			var checkEscapes = checkGroup.escapes;
			if(checkGroup.size == currentGroup.size && checkGroup.id != currentGroup.id && validFill == true && checkGroup.isMerged == false){
				for (z = 0; z < totalAccessibleCells.length; z++) {
					if(checkEscapes.indexOf(totalAccessibleCells[z]) != -1){
						validFill = false;
					}
				}
			}
		}
		if(validFill == true){
			for (z = 0; z < totalAccessibleCells.length; z++) {
				var coords = totalAccessibleCells[z].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
		}
	}
	//console.log(totalAccessibleCells.length);
	return puzzleState;
}

function tooSmallEmptyGroup(currentGroup, puzzleState, width, height, visitedEmptyCells, visitedEmptyGroups, doingGuess){
	var accessibleEmptyGroups = new Array();
	var accessibleEmptyGroupsEscapes = new Array();
	var accessibleEmptyGroupsCells = new Array();
	var isValidEmptyGroups = new Array();
	var groupEscapes = currentGroup.escapes;
	//if(groupEscapes.length == 2){
	for (i = 0; i < groupEscapes.length; i++) {
		for (j = 0; j < visitedEmptyGroups.length; j++) {
			var emptyGroupCells = visitedEmptyGroups[j];
			if(emptyGroupCells.indexOf(groupEscapes[i]) != -1){
				if(accessibleEmptyGroups.indexOf(visitedEmptyGroups[j]) == -1){
					accessibleEmptyGroups.push(visitedEmptyGroups[j]);
					accessibleEmptyGroupsCells.push(emptyGroupCells);
					accessibleEmptyGroupsEscapes.push(groupEscapes[i]);
					var validFill = true;
					for (l = 0; l < groupsArray.length; l++) {
						var checkGroup = groupsArray[l];
						var checkEscapes = checkGroup.escapes;
						if(checkGroup.size == currentGroup.size && checkGroup.id != currentGroup.id && validFill == true && checkGroup.isMerged == false){
							for (z = 0; z < emptyGroupCells.length; z++) {
								if(checkEscapes.indexOf(emptyGroupCells[z]) != -1){
									validFill = false;
								}
							}
						}
					}
					isValidEmptyGroups.push(validFill);
				}
				//totalAccessibleCells.push.apply(totalAccessibleCells, emptyGroupCells);
				//foundEmpty = true;
			}
		}
	}
	if(groupEscapes.length == 2){
		if(accessibleEmptyGroups.length == 2){
			if(isValidEmptyGroups[0] == true && accessibleEmptyGroups[0].length < currentGroup.size - currentGroup.cells.length){
				//console.log("FOUND" + accessibleEmptyGroupsEscapes[1]);
				var coords = accessibleEmptyGroupsEscapes[1].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
			if(isValidEmptyGroups[1] == true && accessibleEmptyGroups[1].length < currentGroup.size - currentGroup.cells.length){
				//console.log("FOUND" + accessibleEmptyGroupsEscapes[0]);
				var coords = accessibleEmptyGroupsEscapes[0].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
		}
	}else if(groupEscapes.length == 3){
		if(accessibleEmptyGroups.length == 3){
			if(isValidEmptyGroups[0] == true && isValidEmptyGroups[1] == true && (accessibleEmptyGroups[0].length + accessibleEmptyGroups[1].length) < currentGroup.size - currentGroup.cells.length){
				//console.log("FOUND" + accessibleEmptyGroupsEscapes[1]);
				var coords = accessibleEmptyGroupsEscapes[2].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
			if(isValidEmptyGroups[0] == true && isValidEmptyGroups[2] == true && (accessibleEmptyGroups[0].length + accessibleEmptyGroups[2].length) < currentGroup.size - currentGroup.cells.length){
				//console.log("FOUND" + accessibleEmptyGroupsEscapes[1]);
				var coords = accessibleEmptyGroupsEscapes[1].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
			if(isValidEmptyGroups[1] == true && isValidEmptyGroups[2] == true && (accessibleEmptyGroups[1].length + accessibleEmptyGroups[2].length) < currentGroup.size - currentGroup.cells.length){
				//console.log("FOUND" + accessibleEmptyGroupsEscapes[1]);
				var coords = accessibleEmptyGroupsEscapes[0].split("-");
				var modifyx = coords[0] * 1;
				var modifyy = coords[1] * 1;
				puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
			}
		}else if(accessibleEmptyGroups.length == 2){
			//console.log("FUCK" + currentGroup.toString());
			if(isValidEmptyGroups[0] == true && accessibleEmptyGroups[0].length < currentGroup.size - currentGroup.cells.length){
				if(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[0]) != -1 && accessibleEmptyGroupsCells[0].indexOf(groupEscapes[1]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[2].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}else if(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[1]) != -1 && accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[0].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}else if(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[0]) != -1 && accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[1].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}
			}else if(isValidEmptyGroups[1] == true && accessibleEmptyGroups[1].length < currentGroup.size - currentGroup.cells.length){
				if(accessibleEmptyGroupsCells[1].indexOf(groupEscapes[0]) != -1 && accessibleEmptyGroupsCells[1].indexOf(groupEscapes[1]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[2].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}else if(accessibleEmptyGroupsCells[1].indexOf(groupEscapes[1]) != -1 && accessibleEmptyGroupsCells[1].indexOf(groupEscapes[2]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[0].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}else if(accessibleEmptyGroupsCells[1].indexOf(groupEscapes[0]) != -1 && accessibleEmptyGroupsCells[1].indexOf(groupEscapes[2]) != -1){
					//console.log(accessibleEmptyGroupsCells[0]);
					//console.log(groupEscapes[2]);
					//console.log(accessibleEmptyGroupsCells[0].indexOf(groupEscapes[2]) );
					var coords = groupEscapes[1].split("-");
					var modifyx = coords[0] * 1;
					var modifyy = coords[1] * 1;
					//console.log("LOL" + currentGroup.size + " " + modifyx + "-" + modifyy);
					puzzleState = modifyCell(puzzleState, modifyx, modifyy, currentGroup.size, currentGroup, visitedEmptyCells, doingGuess);
				}
			}
		}
	}

		//console.log(accessibleEmptyGroups);
		//console.log(accessibleEmptyGroupsEscapes);
		//console.log(isValidEmptyGroups);
	
	return puzzleState;
}

function sharedEscape(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess){
	var groupEscapes = currentGroup.escapes;

	for(i = groupEscapes.length - 1; i > -1; i--) {
		var escapeGroups = new Array();
		var totalSize = currentGroup.cells.length + 1;
		for (j = 0; j < groupsArray.length; j++) {
			var checkGroup = groupsArray[j];
			var checkEscapes = checkGroup.escapes;
			if(checkGroup.size == currentGroup.size && checkGroup.id != currentGroup.id){
				
				var index = checkEscapes.indexOf(groupEscapes[i]);
				if(index != -1 && checkGroup.isMerged == false && currentGroup.isMerged == false){
					totalSize += checkGroup.cells.length;
					escapeGroups.push(checkGroup);
					/*
					if(checkGroup.cells.length + currentGroup.cells.length + 1 > currentGroup.size && checkGroup.isMerged == false && currentGroup.isMerged == false){
						
						groupEscapes.splice(i, 1);
						checkEscapes.splice(index, 1);
						
						//console.log(currentGroup.size);
						//if(currentGroup.size == 6){
							///console.log("WHY" + checkEscapes[index]);
							//console.log("WHY" + groupEscapes[i]);
							//console.log(currentGroup);
							//console.log(checkGroup);
						//}
					}*/
				}
			}
		}
		//console.log(totalSize + " " + currentGroup.size);
		if(totalSize > currentGroup.size){
			//console.log(escapeGroups);
			
			for (k = 0; k < escapeGroups.length; k++) {

				var checkEscapes = escapeGroups[k].escapes;
				var index = checkEscapes.indexOf(groupEscapes[i]);
				//console.log(checkEscapes);
				//console.log(groupEscapes[i]);
				if(index != -1){
					//console.log("what " + index);
					//console.log(checkEscapes);
					
					//console.log("removing escape " + checkEscapes[index]);
					checkEscapes.splice(index, 1);
				}
			}

			currentGroup.escapes.splice(i, 1);
		}
	}
	return puzzleState;
}
function escapeFinished(currentGroup, puzzleState, width, height, visitedEmptyCells, doingGuess){
	var finishedGroupCells = new Array();
	var groupEscapes = currentGroup.escapes;
	for (j = 0; j < groupsArray.length; j++) {
		var checkGroup = groupsArray[j];
		if(checkGroup.size == currentGroup.size && checkGroup.id != currentGroup.id && checkGroup.isFinished == true){
			finishedGroupCells.push.apply(finishedGroupCells, checkGroup.cells);
		}
	}
	for(i = groupEscapes.length - 1; i > -1; i--) {
		var coords = groupEscapes[i].split("-");
		var x = coords[0] * 1;
		var y = coords[1] * 1;
		var foundTouch = false;
		if(finishedGroupCells.indexOf((x + 1) + "-" + y) != -1){
			foundTouch = true;
		}
		if(finishedGroupCells.indexOf((x - 1) + "-" + y) != -1){
			foundTouch = true;
		}
		if(finishedGroupCells.indexOf(x + "-" + (y + 1)) != -1){
			foundTouch = true;
		}
		if(finishedGroupCells.indexOf(x + "-" + (y - 1)) != -1){
			foundTouch = true;
		}
		if(foundTouch == true){
			//console.log(groupEscapes[i]);
			groupEscapes.splice(i, 1);
		}
	}
	return puzzleState;
}
function groupObject(size, cells, escapes, finished, merged, id){
	this.size = size;
	this.cells = cells;
	this.escapes = escapes;
	this.isFinished = finished;
	this.isMerged = merged;
	this.id = id
	groupObject.prototype.createClone = function(){
		var newClone = new groupObject(this.size, this.cells.splice(0), this.escapes.splice(0), this.isFinished, this.isMerged, this.id);
		return newClone;
	}
	groupObject.prototype.toString = function(){
		return this.size + "-" + this.cells + "-" + this.isFinished;
	}
	groupObject.prototype.getSize = function(){
        return this.size * 1;
    }
    groupObject.prototype.getCells = function(){
        return this.cells;
    }
    groupObject.prototype.getEscapes = function(){
        return this.escapes;
    }
    groupObject.prototype.getIsFinished = function(){
        return this.isFinished;
    }
    groupObject.prototype.getIsMerged = function(){
        return this.isMerged;
    }
    groupObject.prototype.getId = function(){
        return this.id;
    }
    groupObject.prototype.addCell = function(value){
        this.cells.push(value);
    }
    groupObject.prototype.addEscape = function(value){
        this.escapes.push(value);
    }
}
function puzzleObject(puzzString){
	this.puzzleString = puzzString;
	splitPuzz = puzzString.split(":", 2);
	puzzData = splitPuzz[1];
	wxh = splitPuzz[0].split("x");
	this.width = wxh[0];
	this.height = wxh[1];
	puzzData2 = puzzData.split("");
	this.puzzleState = new Array(this.height);
	for(var i=0;i<=(this.height) - 1;i++){
		this.puzzleState[i] = new Array(this.width);
	}
    var z = 0;
	for (var x=0;x < this.height;x++) {
		for (var y=0; y < this.width;y++) {
			this.puzzleState[x][y] = puzzData2[z];
			z++;
		}
	}
	puzzleObject.prototype.getHeight = function(){
		return this.height;
	};
	puzzleObject.prototype.getWidth = function(){
		return this.width;
	};
	puzzleObject.prototype.getPuzzleState = function(){
		return this.puzzleState;
	};
}

function generateObject(w, h, difficultySetting, symmetrySetting) {
	this.height = h;
	this.width = w;
	height = h
	width = w;
	this.difficulty = difficultySetting;

	this.puzzleString = "";
	this.genPuzzleState = new Array(this.height);
	for(var i=0;i<=(this.height) - 1;i++){
		this.genPuzzleState[i] = new Array(this.width);
	}

	generateObject.prototype.generate = function(){
		var temp = generateGrid(this.genPuzzleState, this.difficulty, this.width, this.height);
		this.genPuzzleState = temp[1];
		var isValidGrid = temp[0];

		
		while(isValidGrid == false){

			this.genPuzzleState = new Array(this.height);
			for(var h=0;h<=(this.height) - 1;h++){
				this.genPuzzleState[h] = new Array(this.width);
			}
			temp = generateGrid(this.genPuzzleState, this.difficulty, this.width, this.height);
			//console.log(temp);
			this.genPuzzleState = temp[1];
			isValidGrid = temp[0];
			if(isValidGrid == false){
				postMessage("regen");
			}
			//console.log(isValidGrid);
		}
		/*
		var test = "a1a21a4a5aaa7aaa2aaa3a3aaaaaaa4a3a1a3a25418aaaaa444aaa2a35a44a53a4aaa7a553a1377a4a9aa2a47aaa999a4aaa";
		test = test.split("a").join("-");
		console.log(test);
		test = test.split("");
		var z = 0;
		for (var x=0;x < (height);x++) {
			for (var y=0; y < (width);y++) {
				this.genPuzzleState[x][y] = test[z];
				z++;
			}
		}*/
		this.genPuzzleState = removeNumbers(this.genPuzzleState, this.difficulty, this.width, this.height);
		var puzzleString = generatePuzzleString(this.genPuzzleState, this.width, this.height);
		var solver = new solveObject(puzzleString, this.difficulty);
		//solver.solve();
		//console.log(solver.getSolution());
		//console.log(this.genPuzzleState);
		/*
		console.log(puzzleString);
		var changes = new Array();
		for (var x=0;x < (height);x++) {
			for (var y=0; y < (width);y++) {
				var currentNumber = this.genPuzzleState[x][y];
				if(currentNumber != "-"){
					currentNumber = currentNumber * 1;
					if(currentNumber != 9){
						currentNumber++;
						this.genPuzzleState[x][y] = currentNumber;
						var newPuzzleString = generatePuzzleString(this.genPuzzleState, this.width, this.height);
						//console.log(newPuzzleString);
						solver = new solveObject(newPuzzleString, this.difficulty);
						solver.solve();
						console.log(solver.getSolution());
						currentNumber--;
						this.genPuzzleState[x][y] = currentNumber;
					}
					
					if(currentNumber != 1){
						currentNumber--;
						this.genPuzzleState[x][y] = currentNumber;
						var newPuzzleString = generatePuzzleString(this.genPuzzleState, this.width, this.height);
						solver = new solveObject(newPuzzleString, this.difficulty);
						solver.solve();
						console.log(solver.getSolution());
						currentNumber++;
						this.genPuzzleState[x][y] = currentNumber;
					}
				}
			}
		}*/
		console.log(puzzleString);
		return puzzleString;
	}
}

function generatePuzzleString(genPuzzleState, width, height){
	var puzzleString = width + "x" + height + ":";
	for (var x=0;x < (height);x++) {
		for (var y=0; y < (width);y++) {
			if(genPuzzleState[x][y] != "-"){
				puzzleString += genPuzzleState[x][y];
			}else{
				puzzleString += "a";
			}
		}
	}
	//puzzleString = puzzleString.substring(0, puzzleString.length - 1);
	return puzzleString;
}
function countArray(array, check){
	var count = 0;
	for(var i = 0; i < array.length; i++){
	    if(array[i] == check){
		    count++;
		}
	}
	return count;
}
function checkAdjacent(cell1, cell2){
	var isAdjacent = false;
	var coords1 = cell1.split("-");
	var x = coords1[0] * 1;
	var y = coords1[1] * 1;
	if(((x + 1) + "-" + y == cell2) || ((x - 1) + "-" + y == cell2) || (x + "-" + (y + 1) == cell2) || (x + "-" + (y - 1) == cell2)){
		isAdjacent = true;
	}
	return isAdjacent;
}
/** If this array contains key, returns the index of
 * the first occurrence of key; otherwise returns -1. */
Array.prototype.linearSearch = function(key, compare) {
    if (typeof(compare) == 'undefined') {
        compare = ascend;
    }
    for (var i = 0;  i < this.length;  i++) {
        if (compare(this[i], key) == 0) {
            return i;
        }
    }
    return -1;
}


/** If this array contains key, returns the index of any
 * occurrence of key; otherwise returns -insertion - 1,
 * where insertion is the location within the array at
 * which the key should be inserted.  binarySearch assumes
 * this array is already sorted. */
Array.prototype.binarySearch = function(key, compare) {
    if (typeof(compare) == 'undefined') {
        compare = ascend;
    }
    var left = 0;
    var right = this.length - 1;
    while (left <= right) {
        var mid = left + ((right - left) >>> 1);
        var cmp = compare(key, this[mid]);
        if (cmp > 0)
            left = mid + 1;
        else if (cmp < 0)
            right = mid - 1;
        else
            return mid;
    }
    return -(left + 1);
}

/** Adds all the elements in the
 * specified arrays to this array. */
Array.prototype.addAll = function() {
    for (var a = 0;  a < arguments.length;  a++) {
        arr = arguments[a];
        for (var i = 0;  i < arr.length;  i++) {
            this.push(arr[i]);
        }
    }
}


/** Retains in this array all the elements
 * that are also found in the specified array. */
Array.prototype.retainAll = function(arr, compare) {
    if (typeof(compare) == 'undefined') {
        compare = ascend;
    }
    var i = 0;
    while (i < this.length) {
        if (arr.linearSearch(this[i], compare) == -1) {
            var end = i + 1;
            while (end < this.length &&
                    arr.linearSearch(this[end], compare) == -1) {
                end++;
            }
            this.splice(i, end - i);
        }
        else {
            i++;
        }
    }
}


/** Removes from this array all the elements
 * that are also found in the specified array. */
Array.prototype.removeAll = function(arr, compare) {
    if (typeof(compare) == 'undefined') {
        compare = ascend;
    }
    var i = 0;
    while (i < this.length) {
        if (arr.linearSearch(this[i], compare) != -1) {
            var end = i + 1;
            while (end < this.length &&
                    arr.linearSearch(this[end], compare) != -1) {
                end++;
            }
            this.splice(i, end - i);
        }
        else {
            i++;
        }
    }
}


/** Makes all elements in this array unique.  In other
 * words, removes all duplicate elements from this
 * array.  Assumes this array is already sorted. */
Array.prototype.unique = function(compare) {
    if (typeof(compare) == 'undefined') {
        compare = ascend;
    }
    var dst = 0;  // Destination for elements
    var src = 0;  // Source of elements
    var limit = this.length - 1;
    while (src < limit) {
        while (compare(this[src], this[src + 1]) == 0) {
            if (++src == limit) {
                break;
            }
        }
        this[dst++] = this[src++];
    }
    if (src == limit) {
        this[dst++] = this[src];
    }
    this.length = dst;
}


/** Compares two objects using
 * built-in JavaScript operators. */
function ascend(a, b) {
    if (a < b)
        return -1;
    else if (a > b)
        return 1;
    return 0;
}
function shuffle(array) {
    for (var i=array.length - 1; i > -1;i--) {
        var index = (Math.random() * i) | 0;
        var temp = array[i];
        array[i] = array[index];
        array[index] = temp;
    }
    return array;
}
