
var cellColor;
var numberModeColor;
var candidateModeColor;
var clueColor;
var incorrectColor;
var lineColor;
var dashColor;
var buttonColor;
var hintColor;
var context;
var canvas;

var width;
var height;
var gridSize = 45;
var buttonSize = 45;
var numberFont = "Arial, sans-serif";
var solveState;
var puzzleState;
var candidatesState;
var activeCell = true;
var lastVert;
var lastHor;
var candidateMode = false;
var combinations;
var worker;
var colorMode = 0;
var showToolbar = true;
var editMode = false;
var generatedPuzzle;
var copiedCandidates = "";
var puzzleId = "NA";
var isMobile = false;
var undoProgress;
var invalidNumbers = new Array();
var numberGroups = new Array();
var solvedNumbers = new Array();
var unsolvedNumbers = new Array();
var clearPuzzle = false;
var lastCell;
var clicking = false;
var dragging = false;
var calculating = false;
var activeNumber = "-";
function init() {
	if((('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) || (window.innerWidth <= 800)) {
    	isMobile = true;
	}
	//isMobile = true;
	if (isMobile == true){
		$("#footer").css("display", "none");
		//$("#canvasDiv").css("margin-bottom", "50px");
		$("#toolbarDiv").css("position", "fixed");
		$("#toolbarDiv").css("height", (buttonSize + 2) * 2);
		$("#toolbarDiv").css("bottom", 0);
		$("#toolbarDiv").css("width", "100%");
		$("#toolbarDiv").css("z-index", 1);
		//$("#stopButton").css("display", "inline");
		//$(window).on('load scroll', function() {
        //var ds = getDeviceScale();
        //("#toolbarDiv").css('transform','scale(1,' + ds + ')')
        //    .css('transform-origin', '0 0');
        //$("#toolbarDiv").css('transform', 'scale(' + ds + ',1)')
        //    .css('transform-origin', '0 0');
        //})
	}
	$(document).keydown(function(e) {
		$("#combosCanvas").remove();
		$("#generateButton").blur();
		$("#randomButton").blur();
		$("#saveButton").blur();
		$("#loadButton").blur();
		$("#clearButton").blur();
		$("#printButton").blur();
		$("#undoButton").blur();
		if (e.which === 8 && !$(e.target).is("input")) {
			e.preventDefault();
		}
		if (e.which === 32 && !$(e.target).is("input")) {
			e.preventDefault();
		}
		if ((e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) && !$(e.target).is("input, textarea")) {
			e.preventDefault();
		}
		handleKey(e);
	});
	$("#tabs li").click(function() {      
		$("#tabs li").removeClass('active');    
		$(this).addClass("active");     
		$(".tab_content").hide();
		$($(this).find("a").attr("href")).show();
		return false;
	});
	
	$("#tab1").show();

	$("#displayButton").click(function() {
		// $("#generatedPuzzle").val("");
		// $("#userSolvePuzzle").val("");
		// puzzle = $("#userPuzzle").val()
		puzzle = "13x9:aaa1aaa4a31a2a42a23aaaaa17aa3aaaa2a2aaaa21a52aaa2aa6aaa631a2a41a6a4aaaa3a5aa4aa35aaaa5a9a1aa3aa5aa2aaa9a1aaa64a21aaaa"
		displayPuzzle(puzzle);
	});
	if(isMobile == false){
		$("#puzzleCanvas").mousedown(function(e) {
			clicking = true;
			activeNumber = "-";
			activeNumber = getActiveNumber(e);
			$("#puzzleCanvas").css("border-color", "black");
			//redrawClues();
			$("#generateWidthField").blur();
			$("#generateHeightField").blur();
			//e.preventDefault();
			handleClick(e);
		});
		$("#puzzleCanvas").mousemove(function(e) {
			if(clicking == false) return;
			e.preventDefault();
			dragging = true;
			
			if (editMode == false){
				if(calculating == false){
					handleClick(e);
				}else{
					console.log("WAIT A MINUTE");
				}
			}
		});
		$(document).mouseup(function(){
			clicking = false;
			rightClick = false;
			dragging = false;
		});



	}else{
		$("#puzzleCanvas").mousedown(function(e) {

			isClicking = true;
			activeNumber = "-";
			activeNumber = getActiveNumber(e);
			$("#puzzleCanvas").css("border-color", "black");
			//redrawClues();
			$("#generateWidthField").blur();
			$("#generateHeightField").blur();
			//e.preventDefault();
			handleClick(e);
		});
		$("#puzzleCanvas").mousemove(function(e) {
			if(clicking == false) return;
			e.preventDefault();
			dragging = true;
			console.log(calculating);
			if (editMode == false){
				handleClick(e);
			}
		});
		$(document).mouseup(function(){
			clicking = false;
			rightClick = false;
			dragging = false;
		});
	}
	$("#generateButton").click(function() {
		editMode = false;
		$("#puzzleCanvas").css("border-color", "black");
		//redrawClues();
		generate(this.id);
	});
	$("#stopGenerationButton").click(function() {
		stopGeneration();
	});
	$("#saveButton").click(function() {
		savePuzzle();
	});
	$("#loadButton").click(function() {
		loadPuzzle();
	});
	$("#solveButton").click(function() {
		$("#generatedPuzzle").val("");
		$("#userPuzzle").val("");
		solve();
		$("#solveButton").blur();
	});

	$("#undoButton").click(function() {
		$("#canvasDiv").css("border-color", "black");
		if (editMode == false){
			undo();
		}
	});
	$("#displayGridButton").click(function() {
		$("#userSolvePuzzle").val("");
		displayGrid();
	});
	$("#clearButton").click(function() {
		$("#canvasDiv").css("border-color", "black");
		var clearDialog = confirm("Clear puzzle?");
		if (clearDialog == true){
			clear();
		}else{
			
		}
	});
	$("#puzzleCanvas").bind("contextmenu", function(e){
		e.preventDefault();
    })

    //checks for mobile devices
    //if(window.innerWidth <= 800 && window.innerHeight <= 800) {
    	//isMobile = true;
    //}

    //hides print button on mobile
    if (isMobile == true){
    	$("#printButton").css("display", "none");
    }
    canvas = document.getElementById('puzzleCanvas');  
	context = canvas.getContext('2d');
 
    setColors();
	puzzle = "6x6:a13b1b4c2a4a33445a53d2a1b33a";
	//6x6:2d6c2b6b62a4c3a2a5b3c45a
	//5x5:22f3b4a24b352e
	//5x5:c451f44a33445a1c
	//6x6:5d43a3f5b44a254a5a4d3c
	//6x6:3a6b3a6c664435i6c2a4b4
	//6x6:a2c3d2c653b64a6f6a2b3a
	//6x6:3a2a3f46d6a5b2b446664c66
	//13x9:b6a2a7a33g4d3a42b888822d62k46b6a69c9229e6c3b9a99a446677e442f9d69e9a
	//9x7:3h2a6a68c7b62a442d33c9999c6a9c9a2a62b5d2
	//30x30:234a6aa323a2aaa2aaa666aa33a2aaaa3aaa6aaaa1aaa23aa6a614aaa7441aa6a6a1a69aa665541aa5aa1877a3aaa6a2aaa63a6aa5aa232aaa8aa79a21a1aa4a6a331aa31aa5aa18a8aaaaa33aaa3aaa2aa5a4aaaa5a4a89a9a4aa521a545aaa552a446a14aa51a9a2a5a42aa4413aa54aaaaa7128aa9aaa2aaaaaa4a37aa3447735aaaaaaa3a1a31aaa7a337a3a2377255aa2a866a44a3a7466aa2a7aaaaaaa5aaaa8a64a2a55aaa6a344aaa55aa443aaaaa1aaa65a4a21a3aa5545a36a4534aa5a926a6aa6aaaa1aa5aa44aaaa5a4aaaa2a6a2a6aa7a52aa884a6a5a3aa157aaa33aa2a7a2aaa38a31a72a412a1a71a3a51aa3a4354a88aa7aaa5a53aaaa2aaa5a4a6a4aa4a4aaa7a35a4a5aa24aa55a45aa6aa6234477a66a4435aa3a244a2a5aa26aaa23a24a66aaa254a364a31aaa326aaaa1aaaa252aaaaaaaaaaaa823aaaa2aa255a12a5aa4a45aa6aaaaa54a2a354aaaaaaa5aa12a443a1288aa53a45aa4a3a2a6a3a8a3aa7a24a8a5aa3aa8a442346a1a2aaa99aaa7aa1a1aa1aaaa1aaaaa64a1a2991aaa1aaaaaaa1a887aaa4a8aa2a39aa232a2a347a6628aaa13aa8a2aaaa9aaaaa512aa1aaa5522a4a18aaaaa91a3a21aaa132a16aaa1aaa2aa1552
	//35x35:aa1a23aa2a342a3343aaaaaaa27aa3aa3a11344aa4a2aaa1aa3aa552a99aaaa2aaa212aaaa4a4a4aa55886a5aaa9a3aa23334a1aaaaa7a5aaaaa5aaaaaaaa2aaaaa4aaaa2a3a28446aaa77a533aa237aa328aaaaaaaa56a8a4a2aaa4a5aa7aaaa77aa6a4a1aa12a3a4aaaaa1aa3aaaaa2a1aa8836644aaa3a3aaa8a125a4a4322aaaa4aa7aaa6aaa34a5aaa26321aaa1aaaaa31a7aaaaa4aa1a6aaaa46aaaaa34aaa5a2a2aa842214aa7aa6aa521a3a2a6aaaa366aa5aa8a6aaa55a25aaaaaaaaaa55a342aa6a355899aaaaa5a6aa443a243a45aaaa7466a12aa9a5a3a3a8aa3a4a588aaa2aaa4aaaa7a91aa552a1a4823aa2aaa8aaaa5a4aa48a74aaaa5a1aaaaa1aa13aaa28a4aa6aaaaaaaaaaa3aa335aa3aa3aa2aa2aa2aaa6428873aaaaaa16aa2aaaa3aa2aa1aa2aa1aa7aa4a9a521a2aa4a13a4aaaa546aa46aa1aa77aa93aa7a7aaaaaaa52a5a2aa3a2aa9aaa7aaa12a3a3a4a223aa7a67a1aa66aaa9122a9aaa2a86a6a55aa23aa6a17a511a6aa2aaa9a1aaaaa624a5a32a56aaaa8a7a3a5aaaaaaa23aaaa3a4aaa4aaaa23aaaaaaaa6aa6aaaaa14832aa1a684a5aa3aaaa5a55a6a3a8a3aa32aa46aaaa1a17aa9a228aaa2a25aaaa6a4a2a3aa49aaa47a7aaaaaaaa3a6a1a7aa6a4a1a55aa61aa34a6a12a6a3a5a5a8a3aa2246a1aa5a6aaa5a6a4a3aaa93aaaaaa241a54aa822a9aa9a5a2344a8a121a6a3554a4aaaa3a5aa4a2a5aaaaaa3aa5aaa4a65aa9aa151aaa53a31aa7aa3aaaaaa13aaaa6a7996aa8a8a5aaaaa22a6aa423aa2aa44a37aa3aaa8a2aa3aaa3aa88a4aaaaaaa3aaa8aa743aa8a2a38aaaa43a8a64aaa3aaa28aa87aaa128aa1aaaa1a3aa866a4423a5
	//20x36:a2aaaa5aa22a453aaa2aaaaa2a5aaaaa3a1aaaa553a1aa1a25a4aa8a231aa5423aaaaa5aaa3a6aa24a6aa81a3a8aaaaaaaaaaaaaa9a4988161aaaaaaa3a129a9aaaaaaa8aaa4aaa3aa89a831a31a3631aa7aaa8aaaa52a4721aaaaa3a2a1273aa3aaaaaaaa6aa2a77a2aaaaaaaa42632a5a7aaa16a67a132aaaa5aa24aa4aa1a521a6aa1aa1a3aaa5aaaaa3aaaaa7aaa71a2a1aaa1aa21aa41aaaa6a1a4a3a21aa3aaaaaa313a21a24a41aa463aaaa434aaaa3aa91a6aaa2647a9a2613a5aaaa64a4aaaaaaa3aa1a2a224a4aaa12a61aaaa4aaa7a77aaaaaaaa3aaa31a4aa771aaaa6aa1a1aa26aaaa74315aaa1aaaaaaa4aa7aaaaa31aaa1a4aaa4aa299aa4a42aaaaa1a3a1a2aaa3aaa3a7aaa3aaaaa3a2a3a5aaa4a62a421aa5a6a3aaa3a2aa24aaaaa2aa71aa6aa81aaa9992a2aaaaa5aa6643aaa9aa7a9a1a3a34aaaa4aa21aaaaaaaaaaa57aa5aa3a413a6aa4aaaa53a2aa33a3a71845a122aaa4aa5aaa6aaaa1aaa3a3a4a
	//6x6:a6643a666a333a3c2a5g5242c3
	//13x9:52a1b4a29b9a5b444a3b9b5c5a29c32a5b27b2b4c2a4c5c3d337c555a4a8a84e77b885d6e7c3d
	//20x20:6aa3aaaaaaaa1a21a1aaaa5aa2aa432aaa2aa313a1aa52aa3aaa6aaaaaaa5aa27a66a4aaa1aaaaaa2aaaaaa76aa5aa342aaaaa3aa14aa66aa25aaa5a2a345aaa817343aa232aaaaaaaaaaaa3aaa1aaaa7aa7a34aa1aaaaaa1aa8aa8a5aaaa4a355aa8a5a3aa822a1aa141a5817aaa388aaaaaaaa4aaaaa5aa64aaa9a1aaa2a6a285a1aaa3a145aa17aaa8aa6aa6a23aaaaaaaa68aaaaaaaa4aa6aa22a6aa1323a3aaa4aaa6aa3a21aaaa3155a1aa484aaaaaa3a2aa9aa3aaaaaaaa235aa222a1aa5a83aa23aaa56a

	//7x7:41---14-2-2-4--2-2124--4-4----5-----4-44----6-226
	//7x7:242---3--213--3-------3523------------13-6-4--63-

	//18x10:aaa38aa3543aa23aaaaa88aa88aa35aa14aaa54aa48aaaa43aa41a33aa33aaaaaa32aa332aaa4aaa55aaa4aaa14aaa1aaa22aaa2aaa235aa55aaaaaa24aa37a55aa32aaaa55aa31aaa34aa32aa74aa31aaaaa47aa7722aa37aaa
	//nikoli
	//10x18:453aa363aaaaaa2aaaa3aaa2aaaa1aaaaa4aaaa4454aa452aaaaaa4aaaa4aaa1aaaa4aaaaa1aaaa5436aa615aaaa241aa2351aaaa4aaaaa2aaaa7aaa6aaaa4aaaaaa246aa4352aaaa3aaaaa2aaaa6aaa2aaaa1aaaaaa461aa241
	//88 medium
	//10x18:a4a2aa5aaaa5aa2a3aaaa3aa5aaa3aaa2a4aaa5aaa4aaa2a2a5a3aaa3aa53aaa4a4aa24aaa5aa4a1aa2a2aa3aaaa1aa4a4aa4a5aa2aaa44aa4a3aaa15aa5aaa3a4a5a4aaa1aaa3aaa5a2aaa4aaa3aa2aaaa4a4aa5aaaa3aa4a4a
	//98 hard
	//10x18:a2aa2aa1aaa3aa7aa6aaa3aa2aa7aaa1aa3aa3aaa2aa2aa2aa54aa6aa1aaaaaa3aa312aaaa2aaaaa24326aaaaaaaaaa71323aaaaa3aaaa144aa4aaaaaa2aa5aa12aa7aa4aa3aaa5aa7aa4aaa1aa3aa2aaa5aa5aa1aaa8aa4aa4a
	//100 hard
	//10x18:23aa6a6a5aaaa2aa2a2aaa3aaa5a3aa5aa7aa3aa3aaaaaaaaaaa137aaaaaaa3a7a939a5a325a4a1aaaaaaa245aa632aaaaaaa3a7a413a5a645a7a2aaaaaaa825aaaaaaaaaaa5aa5aa8aa3aa3a5aaa5aaa4a3aa8aaaa3a3a3aa25
	//118 hard
	//14x24:7aaaaa5546aaaaa765aaaaaa564aaaaa5744aaaaa8aaaaaaaaaa554a723aaaa345aaaaaaaa533aaaa546a237aaaaaaaaaa1aaaaa3445aaaaa637aaaaaa654aaaaa6331aaaaa6273aaaaaaa321aaaaaaaa455aaaaaaaa634aaaaaaaa766aaaaaaa2354aaaaa4454aaaaa776aaaaaa524aaaaa6585aaaaa4aaaaaaaaaa344a452aaaa533aaaaaaaa584aaaa424a335aaaaaaaaaa6aaaaa4244aaaaa532aaaaaa832aaaaa3542aaaaa4
	//128 hard
	//20x36:a53a55aaa25aaa24aa44a2aaa5aaaa2aaaa2aa5aaaaaaaa53aaaaaaaaaaaaaa64aaa4a27aa24aaaaaaaa5aaaaaa2aa7aaaaa57aaaaa43aaaaa5a45aa2aaaaaa8aaa5997a4aaaaaaaaaaaa87a7aa9aa992aaa1aa23a8aaaa88aa257a66a8a2aa98aaaaaaaaaa6aa64aaaa5aaaaaaaa6a7744aa95aaa77aaa8a62aa6aa4a5aaaa6aa76aaaaaaa54aa66aaaaaaa8aaaaaaaa46a6aa48aaa36aaaaaaaa4a6aaa5a37aaaaaaaa41a42aaaaaa2a46a25aa5aaaaa4aa5aaaa4aa1aaaaa5aa72a72a2aaaaaa54a55aaaaaaaa74a5aaa4a5aaaaaaaa43aaa12aa4a66aaaaaaaa2aaaaaaa83aa26aaaaaaa78aa2aaaa8a4aa1aa57a4aaa42aaa84aa3475a3aaaaaaaa4aaaa44aa5aaaaaaaaaa25aa4a8a82a565aa76aaaa8a53aa5aaa276aa6aa2a87aaaaaaaaaaaa6a5738aaa5aaaaaa3aa15a7aaaaa54aaaaa24aaaaa7aa7aaaaaa8aaaaaaaa44aa33a3aaa12aaaaaaaaaaaaaa46aaaaaaaa5aa4aaaa4aaaa1aaa8a76aa37aaa95aaa55a14a
	//129 hard
	//20x36:aa55aaaaa54aaaaa41aaaa34aaaa1aa3aaaa25aa35aa64a4aaaa3a36aa3246aa64a4aaaa2a56aa34aa35aaaa5aa7aaaa54aaaa45aaaaa43aaaaa34aaaaaaa2435aa4271aaaaa5253aaaaaaaaaaaa2642aaaaaa23a52a42aaaaaaa14aa6aa5aa4aa2aa37aa54aa6aa4aa2aa6aa66aaaaaaa63a24a62aaaaaa3733aaaaaaaaaaaa3571aaaaa5242aa2373aaaaaaaaaaaaaaaaaaaaaaaaa3aaaa4aa4543aa4aaaa25a74a6a3aaaa3a3a76a4a4aa5aa6aaaa6aa6aa5aa6aa5aa5aaaa5aa5aa5a3a45a3a2aaaa3a3a34a63aaaa7aa4534aa2aaaa3aaaaaaaaaaaaaaaaaaaaaaaaa2575aa4243aaaaa3642aaaaaaaaaaaa7676aaaaaa46a25a24aaaaaaa43aa2aa7aa4aa6aa72aa25aa5aa2aa4aa5aa54aaaaaaa36a52a62aaaaaa1254aaaaaaaaaaaa5534aaaaa5535aa3453aaaaaaa34aaaaa44aaaaa55aaaa36aaaa7aa7aaaa37aa33aa55a7aaaa3a45aa4652aa43a5aaaa6a77aa47aa33aaaa6aa5aaaa67aaaa44aaaaa36aaaaa52aa
	//error merging fixed
	//6x6:a3c25d4a2a52e4462b44a6a1b


	//not completing group
	//17x13:a4b2a6e9e33a68c8c3a5a4b4b6a8a625d2b5b54a36f3a32b8c28d8c55a8b33b8842b36e5j46b62a4d88b65c2d48888b4a55a3b6775e6c55b5c7d5333a2b2c822b34d3c4a8b
	

	//13x9:c4a27c88b777b37a788b777a9c98a1a99a7d988c9967a4a4c5f73b22c955b5g5a54453a3a22g5b1

	//escapefinished not working?
	//6x6:c4d3c22c5b2b6f53a442

	//not removing number
	//10x10:1aa2aaaaaaa4a8aa2aa72aaa4313775a2aa6aa5aa8aaa5aa251aaa5aaaaaaa2aa58a2aaaa588a3123a2a8a8aaaaaaaa5a4aa
	//10x10:1aa2aaaaaaa4a8aa2aaa2aaa4313775a2aa6aa5aa8aaa5aa251aaa5aaaaaaa2aa58a2aaaa588a3123a2a8a8aaaaaaaa5a4aa

	//10x10:a1a21a4a5aaa7aaa2aaa3a3aaaaaaa4a3a1a3a25418aaaaa444aaa2a35a44a53a4aaa7a553a1377a4a9aa2a47aaa999a4aaa
	//10x10:a1a21a4a5aaa7aaa2aaa3a3aaaaaaaaa3a1a3a25418aaaaa444aaa2a35a44a53a4aaa7a553a1377a4a9aa2a47aaa999a4aaa
	//3122174455377777244537388823254338143325418824554448832435444553943557555391377744999224774499994447


	//8x8:-2--3--1-7-4523--72--5---72----1-5-----326-6-2-93-62-21--3------
	//8x8:-2--3--1-7-4523---2--5----2----1-5-----326-6-2-93-62-21--3------

	//6x6:1e2b54a5b42b3e26c4e
	//6x6:aaaa2aaaa1a5aa3aa23252aa13aaaaaaaa1a

	//10x10:a23125aaaaa4aaaa4aaaa43a9995a2a229aa92a1aaaaaa4aaa64aaa4434a5aaaa3aaaa24a321216aaaaaaaaaaa1aaaaaa1a1
	//4x4:3a2a3a3a1aaa3a3a
	displayPuzzle(puzzle);

}
function savePuzzle(){

	var solution = "";
	for (x=1;x <= (height);x++) {
		for (y=1; y <= (width);y++) {
			solution += solveState[x][y];
		}
	}
	//solution = solution.substring(0, solution.length - 1);
	//docCookies.removeItem("KOSavedPuzzle");
	//docCookies.removeItem("KOSavedSolution");
	//docCookies.setItem("KOSavedPuzzle", generatedPuzzle, new Date(9999, 9, 9));
	//docCookies.setItem("KOSavedSolution", solution, new Date(9999, 9, 9));
	localStorage.removeItem("KOSavedFillomino");
	localStorage.removeItem("KOSavedFillominoSolution");
	console.log(solution);
	localStorage.setItem("KOSavedFillomino", puzzle);
	localStorage.setItem("KOSavedFillominoSolution", solution);
	//$("#message").text("Puzzle " + puzzleId + " saved");
	//$("#idField").val(puzzleId);
}
function loadPuzzle(){
	var savedPuzzle = localStorage.getItem("KOSavedFillomino");
	console.log(savedPuzzle);
	generatedPuzzle = savedPuzzle;
	puzzle = savedPuzzle
	if (savedPuzzle){
		displayPuzzle(generatedPuzzle);
		var savedSolution = localStorage.getItem("KOSavedFillominoSolution");
		//console.log(savedSolution);
		//alert(savedSolution);
		var nums = savedSolution.split("");
		var z = 0;
		//console.log(nums)
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				if (puzzleState[x][y] != "-"){	
					drawGiven(nums[z], x, y);
					//solveState[x][y] = nums[z];
					calculateLines(x, y, nums[z]);
				}else if (solveState[x][y] == "-" && nums[z] != "-"){
					drawNumber(nums[z], x, y);
					solveState[x][y] = nums[z];
					calculateLines(x, y, nums[z]);
				}else{

				}

				z++;
			}
		}
		calculateGroups();
	}else{
		//$("#message").text("No puzzle saved");
	}			
}

function setColors(){
	if(colorMode == 0){
		cellColor = "white";
		numberModeColor = "#80B5DD";
		clueColor = "white";
		incorrectColor = "#C03C39";
		lineColor = "black";
		inputColor = "black";
	}else{
		cellColor = "white";
		numberModeColor = "#80B5DD";
		clueColor = "black";
		incorrectColor = "#C03C39";
		lineColor = "black";
		inputColor = "black";
	}
}
function displayPuzzle(puzzle){
	$("#canvasDiv").css("border-color", "black");
	invalidNumbers = new Array();
	undoProgress = new Array();
	lastVert = "";
	lastHor = "";
	var puzzData = puzzle.split(":");
	var size = puzzData[0];
	var wxh = size.split("x");
	width = parseInt(wxh[0]);
	height = parseInt(wxh[1]);

	puzzData = puzzData[1];
	solveState = new Array(height);
	for(var i=1;i<=(height);i++){
		solveState[i] = new Array(width);
	}
	puzzleState = new Array(height);
	for(var i=1;i<=(height);i++){
		puzzleState[i] = new Array(width);
	}

	wallState = new Array((height * 2) + 1);
	for(var i = 0;i < ((height * 2) + 1);i++){
		wallState[i] = new Array((width * 2) + 1);
	}
	for (x = 0;x < (height + (height + 1));x++) {
		for (y = 0;y < (width + (width + 1));y++) {
			if((y % 2 != 0) && (x % 2 != 0)){
				wallState[x][y] = "-";
			}else if(y % 2 != 0 && x % 2 == 0) {
				if(x == 0 || x == (height * 2)){
					wallState[x][y] = "line";
				}else{
					wallState[x][y] = "noline";
				}
			}else if(x % 2 != 0 && y % 2 == 0) {
				if(y == 0 || y == (width * 2)){
					wallState[x][y] = "line";
				}else{
					wallState[x][y] = "noline";
				}
			}else{
				wallState[x][y] = "dot";
			}
		}
	}
	formattedPuzzle = puzzle.split(":");
	formattedPuzzle = formattedPuzzle[1];
	formattedPuzzle = formattedPuzzle.replace(/_/gi, "");
	formattedPuzzle = formattedPuzzle.replace(/a/gi, "-");
	formattedPuzzle = formattedPuzzle.replace(/b/gi, "--");
	formattedPuzzle = formattedPuzzle.replace(/c/gi, "---");
	formattedPuzzle = formattedPuzzle.replace(/d/gi, "----");
	formattedPuzzle = formattedPuzzle.replace(/e/gi, "-----");
	formattedPuzzle = formattedPuzzle.replace(/f/gi, "------");
	formattedPuzzle = formattedPuzzle.replace(/g/gi, "-------");
	formattedPuzzle = formattedPuzzle.replace(/h/gi, "--------");
	formattedPuzzle = formattedPuzzle.replace(/i/gi, "---------");
	formattedPuzzle = formattedPuzzle.replace(/j/gi, "----------");
	formattedPuzzle = formattedPuzzle.replace(/k/gi, "-----------");
	formattedPuzzle = formattedPuzzle.replace(/l/gi, "------------");
	formattedPuzzle = formattedPuzzle.replace(/m/gi, "-------------");
	formattedPuzzle = formattedPuzzle.replace(/n/gi, "--------------");
	formattedPuzzle = formattedPuzzle.replace(/o/gi, "---------------");
	formattedPuzzle = formattedPuzzle.replace(/p/gi, "----------------");
	formattedPuzzle = formattedPuzzle.replace(/q/gi, "-----------------");
	formattedPuzzle = formattedPuzzle.replace(/r/gi, "------------------");
	formattedPuzzle = formattedPuzzle.replace(/s/gi, "-------------------");
	formattedPuzzle = formattedPuzzle.replace(/t/gi, "--------------------");
	formattedPuzzle = formattedPuzzle.replace(/u/gi, "---------------------");
	formattedPuzzle = formattedPuzzle.replace(/v/gi, "----------------------");
	formattedPuzzle = formattedPuzzle.replace(/w/gi, "-----------------------");
	formattedPuzzle = formattedPuzzle.replace(/x/gi, "------------------------");
	formattedPuzzle = formattedPuzzle.replace(/y/gi, "-------------------------");
	formattedPuzzle = formattedPuzzle.replace(/z/gi, "--------------------------");
		
	puzzData2 = formattedPuzzle.split("");
	//console.log(puzzData2);
	var z = 0;
	for (x=1;x <= (height);x++) {
		for (y=1; y <= (width);y++) {
			if(puzzData2[z] == "-"){
				puzzleState[x][y] = puzzData2[z];
				solveState[x][y] = puzzData2[z];
			}else{
				puzzleState[x][y] = "(" + puzzData2[z] + ")";
				solveState[x][y] = puzzData2[z];
			}
			z++;
			
		}
	}
	//console.log(z)
	var drawX = 0;
	var drawY = 0;

	canvas.height = (height * gridSize);
	canvas.width = (width * gridSize);
	for (x=1;x <= (height);x++) {
		for (y=1; y <= (width);y++) {
			var number = "-";
			if(puzzleState[x][y] != "-"){
				//var temp = solveState[x][y].split("");
				var number = solveState[x][y];
				drawGiven(number, drawX, drawY);
			}

			context.fillStyle = lineColor;	
			context.fillRect(drawX, drawY, gridSize, gridSize);
			context.fillStyle = cellColor;
			//draws different rects for near 3x3 segments
			var left = drawX + gridSize * .02;
			var top = drawY + gridSize * .02;
			var right = gridSize - (gridSize * .04);
			var bottom = gridSize - (gridSize * .04);
			//handles edges
			
			if(x == 1){
				top = drawY + (gridSize * .06);
				bottom = gridSize - (gridSize * .08);
			}
			if(y == 1){
				left = drawX + (gridSize * .06);
				right = gridSize - (gridSize * .08);
			}
			if(x == height){
				top = drawY + (gridSize * .02);
				bottom = gridSize - (gridSize * .08);
			}
			if(y == width){
				left = drawX + (gridSize * .02);
				right = gridSize - (gridSize * .08);
			}

			//handles adjacent numbers
			if(x != 1 && number != "-" && solveState[x - 1][y] != "-" && solveState[x - 1][y] != number){
				wallState[(((x - 1) * 2) + 1) - 1][(((y - 1) * 2) + 1)] = "line";
				drawLine((((x - 1) * 2) + 1) - 1, (((y - 1) * 2) + 1), x, y, x - 1, y);
				top = drawY + (gridSize * .04);
				bottom = bottom - (gridSize * .02);
			}
			if(y != 1 && number != "-" && solveState[x][y - 1] != "-" && solveState[x][y - 1] != number){
				wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) - 1] = "line";
				left = drawX + (gridSize * .04);
				right = right - (gridSize * .02);
			}
			if(x != height && number != "-" && solveState[x + 1][y] != "-" && solveState[x + 1][y] != number){
				wallState[(((x - 1) * 2) + 1) + 1][(((y - 1) * 2) + 1)] = "line";
				bottom = bottom - (gridSize * .02);
			}
			if(y != width && number != "-" && solveState[x][y + 1] != "-" && solveState[x][y + 1] != number){
				wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) + 1] = "line";
				right = right - (gridSize * .02);
			}

			context.fillRect(left, top, right, bottom);
			context.fillStyle = inputColor;

			if(number != "-"){
				drawGiven(number, x, y);
			}
			drawX += gridSize;
		}
		drawX = 0;
		drawY += gridSize;
	}
	//console.log(wallState); 

	calculateGroups();
}
function calculateGroups(){
	numberGroups = new Array();
	var allVisitedCells = new Array();
	for (x2=1;x2 <= (height);x2++) {
		for (y2=1; y2 <= (width);y2++) {
			if(solveState[x2][y2] != "-" && allVisitedCells.indexOf(x2 + "-" + y2) == -1){
				var groupNumber = solveState[x2][y2];

				var visitedCells = travelCells(x2, y2, solveState, groupNumber);
				allVisitedCells.push.apply(allVisitedCells, visitedCells);

				var group = new Array();
				group.push(groupNumber);
				group.push.apply(group, visitedCells);
				numberGroups.push(group);
			}
		}
	}
	//console.log(numberGroups);
	calculateFinishedGroups();
	removeUnfinishedLines();
	drawFinishedLines();
	
}
function calculateFinishedGroups(){
	solvedNumbers = new Array();
	unsolvedNumbers = new Array();
	for(i = 0; i < numberGroups.length; i++){
		var group = numberGroups[i];
		var number = group[0];
		if (group.length - 1 >= number * 1){
			for(j = 1; j < group.length; j++){
				solvedNumbers.push(group[j]);

			}
		}else{
			for(j = 1; j < group.length; j++){
				unsolvedNumbers.push(group[j]);
			}
		}
	}
}
function removeUnfinishedLines(){

	for(i = 0; i < unsolvedNumbers.length; i++){
		var temp = unsolvedNumbers[i].split("-");
		var x = temp[0] * 1;
		var y = temp[1] * 1;
		var lineX = (((x - 1) * 2) + 1);
		var lineY = (((y - 1) * 2) + 1);
		var drawY = Math.floor((x - 1) * gridSize);
		var drawX = Math.floor((y - 1) * gridSize);
		context.fillStyle = lineColor;
		context.fillRect(drawX, drawY, gridSize, gridSize);
		context.fillStyle = cellColor;
		var number = solveState[x][y];

		if(x != 1 && number != "-" && solveState[x - 1][y] == "-"){
			//wallState[x * 2][y * 2] = "line";
			wallState[(((x - 1) * 2) + 1) - 1][(((y - 1) * 2) + 1)] = "noline";

		}
		if(y != 1 && number != "-" && solveState[x][y - 1] == "-"){
			wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) - 1] = "noline";

		}
		if(x != height && number != "-" && solveState[x + 1][y] == "-"){
			wallState[(((x - 1) * 2) + 1) + 1][(((y - 1) * 2) + 1)] = "noline";

		}
		if(y != width && number != "-" && solveState[x][y + 1] == "-"){
			wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) + 1] = "noline";

		}
		redrawCell(x, y);
		redrawCell(x + 1, y);
		redrawCell(x - 1, y);
		redrawCell(x, y + 1);
		redrawCell(x, y - 1);
	}
}
function drawFinishedLines(){
	for(i = 0; i < solvedNumbers.length; i++){
		var temp = solvedNumbers[i].split("-");
		var x = temp[0] * 1;
		var y = temp[1] * 1;
		var drawY = Math.floor((x - 1) * gridSize);
		var drawX = Math.floor((y - 1) * gridSize);
		context.fillStyle = lineColor;
		context.fillRect(drawX, drawY, gridSize, gridSize);
		context.fillStyle = cellColor;
		var number = solveState[x][y];

		var left = drawX + gridSize * .02;
		var top = drawY + gridSize * .02;
		var right = gridSize - (gridSize * .04);
		var bottom = gridSize - (gridSize * .04);
		//handles edges
		if(x == 1){
			top = drawY + (gridSize * .06);
			bottom = gridSize - (gridSize * .08);
		}
		if(y == 1){
			left = drawX + (gridSize * .06);
			right = gridSize - (gridSize * .08);
		}
		if(x == height){
			top = drawY + (gridSize * .02);
			bottom = gridSize - (gridSize * .08);
		}
		if(y == width){
			left = drawX + (gridSize * .02);
			right = gridSize - (gridSize * .08);
		}

		if(x != 1 && number != "-" && solveState[x - 1][y] != number){
			//wallState[x * 2][y * 2] = "line";
			wallState[(((x - 1) * 2) + 1) - 1][(((y - 1) * 2) + 1)] = "line";
			top = drawY + (gridSize * .04);
			bottom = bottom - (gridSize * .02);
		}
		if(y != 1 && number != "-" && solveState[x][y - 1] != number){
			wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) - 1] = "line";
			left = drawX + (gridSize * .04);
			right = right - (gridSize * .02);
		}
		if(x != height && number != "-" && solveState[x + 1][y] != number){
			wallState[(((x - 1) * 2) + 1) + 1][(((y - 1) * 2) + 1)] = "line";
			bottom = bottom - (gridSize * .02);
		}
		if(y != width && number != "-" && solveState[x][y + 1] != number){
			wallState[(((x - 1) * 2) + 1)][(((y - 1) * 2) + 1) + 1] = "line";
			right = right - (gridSize * .02);
		}
		redrawCell(x, y);
		redrawCell(x + 1, y);
		redrawCell(x - 1, y);
		redrawCell(x, y + 1);
		redrawCell(x, y - 1);

	}
	//console.log(wallState);
}
function modifyGroup(x, y, inputNumber, oldNumber){
	
	//inputNumber = inputNumber * 1;
	if(puzzleState[x][y] == "-" && inputNumber != oldNumber && (isNaN(inputNumber) == false || inputNumber == "-")){
		//console.log(numberGroups);
		//console.log(inputNumber);
		
			for(i = numberGroups.length - 1; i > -1; i--) {
				var group = numberGroups[i];
				if(group.indexOf(x + "-" + y) != -1 || group.indexOf((x + 1) + "-" + y) != -1 || group.indexOf((x - 1) + "-" + y) != -1
					|| group.indexOf(x + "-" + (y + 1)) != -1 || group.indexOf(x + "-" + (y - 1)) != -1){
					numberGroups.splice(i, 1);
				}
			}
			var allVisitedCells = new Array();
			for (x2=1;x2 <= (height);x2++) {
				for (y2=1; y2 <= (width);y2++) {
					var cell = x2 + "-" + y2;
					if(solveState[x2][y2] != "-" && allVisitedCells.indexOf(x2 + "-" + y2) == -1 &&
					 (cell == ((x + 1) + "-" + y) || cell == ((x - 1) + "-" + y) || cell == (x + "-" + (y + 1)) || cell == (x + "-" + (y - 1)) || cell == (x + "-" + y)) ){
						//console.log(x2 + "-" + y2);
						var groupNumber = solveState[x2][y2];

						var visitedCells = travelCells(x2, y2, solveState, groupNumber);
						allVisitedCells.push.apply(allVisitedCells, visitedCells);

						var group = new Array();
						group.push(groupNumber);
						group.push.apply(group, visitedCells);
						numberGroups.push(group);
					}
				}
			}
		
		//console.log(numberGroups);
		calculateFinishedGroups();
		removeUnfinishedLines();
		drawFinishedLines();
		
	}else{
		//console.log("WHAT2");
	}


}
function travelCells(xCoord, yCoord, solveState, number){
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
		if(x != height && solveState[x + 1][y] == number && visitedCells.indexOf((x + 1) + "-" + y) == -1){
			x++;
		}else if(x != 1 && solveState[x - 1][y] == number && visitedCells.indexOf((x - 1) + "-" + y) == -1){
			x--;
		}else if(y != width && solveState[x][y + 1] == number && visitedCells.indexOf(x + "-" + (y + 1)) == -1){
			y++;
		}else if(y != 1 && solveState[x][y - 1] == number && visitedCells.indexOf(x + "-" + (y - 1)) == -1 ){
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
function findPosition(e, canvas){
	var canvasElement = document.getElementById(canvas);
	var x;
	var y;
	//alert(parseInt($(canvasElement).css("border-left-width")));
	x = e.pageX - $(canvasElement).offset().left - parseInt($(canvasElement).css("border-left-width"));
	y = e.pageY - $(canvasElement).offset().top - parseInt($(canvasElement).css("border-top-width"));
	return x + "-" + y;
}
function getActiveNumber(e){

	var coords = findPosition(e, "puzzleCanvas");
	coords = coords.split("-");
	var xCoord = coords[0];
	var yCoord = coords[1];
	vertCell = (Math.floor(yCoord / gridSize) + 1);
	horCell = (Math.floor(xCoord / gridSize) + 1);
	if(vertCell > height){
		vertCell = height;
	}
	if(horCell > width){
		horCell = width;
	}
	if(vertCell < 1){
		vertCell = 1;
	}
	if(horCell < 1){
		horCell = 1;
	}
	var number = solveState[vertCell][horCell];
	//console.log(number);
	return number;
}
function handleClick(e){
	//console.log(activeNumber);
	$("#userPuzzleField").blur();
	var coords = findPosition(e, "puzzleCanvas");
	coords = coords.split("-");
	var xCoord = coords[0];
	var yCoord = coords[1];
	vertCell = (Math.floor(yCoord / gridSize) + 1);
	horCell = (Math.floor(xCoord / gridSize) + 1);

	if(vertCell > height){
		vertCell = height;
	}
	if(horCell > width){
		horCell = width;
	}
	if(vertCell < 1){
		vertCell = 1;
	}
	if(horCell < 1){
		horCell = 1;
	}
	var drawY = Math.floor((vertCell - 1) * gridSize);
	var drawX = Math.floor((horCell - 1) * gridSize);
	
	if(dragging == true && puzzleState[vertCell][horCell] == "-"){
		handleNumberDrawing(activeNumber, vertCell, horCell);
	}

	//console.log(lastVert + "-" + lastHor);
	//draw color and then redraw the state of the cell
	if (editMode == false){
		if (puzzleState[vertCell][horCell] == "-"){
			if (solveState[vertCell][horCell] != "-"){
				drawColor(numberModeColor, vertCell, horCell);	
				drawNumber(solveState[vertCell][horCell], vertCell, horCell);
			}else{
				drawColor(numberModeColor, vertCell, horCell);	
			}
		}else{
			drawColor(numberModeColor, vertCell, horCell);
			drawGiven(solveState[vertCell][horCell], vertCell, horCell);
		}
	}else{
		if(puzzleState[vertCell][horCell] == "-"){
			if (solveState[vertCell][horCell] != "-"){
				drawColor(numberModeColor, vertCell, horCell);	
				drawNumber(solveState[vertCell][horCell], vertCell, horCell);
			}else{
				drawColor(numberModeColor, vertCell, horCell);	
			}
		}else{
			drawColor(numberModeColor, vertCell, horCell);	
			if (solveState[vertCell][horCell] != "-"){
				drawGiven(solveState[vertCell][horCell], vertCell, horCell);
			}
		}
	}
	//clear the color of the last cell, and redraw the state

	//console.log(dragging);


	if (lastHor != ""){
		if (lastVert != vertCell || lastHor != horCell){
			//if(editMode == false){
				if (solveState[lastVert][lastHor] == "-"){
					drawColor(cellColor, lastVert, lastHor);
				}else if (isNaN(solveState[lastVert][lastHor]) == false){
					drawColor(cellColor, lastVert, lastHor);
					if(puzzleState[lastVert][lastHor].indexOf(")") == -1){
						drawNumber(solveState[lastVert][lastHor], lastVert, lastHor);
					}else{
						drawGiven(solveState[lastVert][lastHor], lastVert, lastHor);
					}
				}else{
					//console.log("what")
				}
			//}else{

			//}
		}
	}
	lastVert = vertCell;
	lastHor = horCell;

}
function handleKey(e){	

	drawY = Math.floor((lastVert - 1) * gridSize);
	drawX = Math.floor((lastHor - 1) * gridSize);
	switch (e.which){
		case 49:
			number = "1";
			break;
		case 50:
			number = "2";
			break;
		case 51:
			number = "3";
			break;
		case 52:
			number = "4";
			break;
		case 53:
			number = "5";
			break;
		case 54:
			number = "6";
			break;
		case 55:
			number = "7";
			break;
		case 56:
			number = "8";
			break;
		case 57:
			number = "9";
			break;
		case 37:
			number = "left";
			break;
		case 38:
			number = "up";
			break;
		case 39:
			number = "right";
			break;
		case 40:
			number = "down";
			break;
		case 8:
			number = "";
			break;
		case 32:
			number = "";
			break;
		case 16:
			number = "none"
			//changeCandidateMode(lastVert, lastHor);
		case 97:
			number = "1";
			break;
		case 98:
			number = "2";
			break;
		case 99:
			number = "3";
			break;
		case 100:
			number = "4";
			break;
		case 101:
			number = "5";
			break;
		case 102:
			number = "6";
			break;
		case 103:
			number = "7";
			break;
		case 104:
			number = "8";
			break;
		case 105:
			number = "9";
			break;
		default:
			number = "none2";
			break;
	}
	if (number == "left" || number == "right" || number == "up" || number == "down"){
		handleArrowKey(number);
	}else{
		if (e.which != 16 && number != "none2"){

			if(clearPuzzle == true && editMode == true){
				clear();
				clearPuzzle = false;
			}
			handleNumberDrawing(number, lastVert, lastHor);
		}
	}
}


function handleNumberDrawing(number, lastVert, lastHor){
	if(lastVert){
		var oldNumber = solveState[lastVert][lastHor];
		if (lastHor && (puzzleState[lastVert][lastHor].indexOf("(") == -1 || editMode == true)){
			//record data for undo
			if(solveState[lastVert][lastHor] == "-"){
				if(number != "" && number != "none" && number != "none2" && number != "-"){
					undoProgress.push(lastVert + "-" + lastHor + "_" + "none");
				}
			}else{
				if(number != solveState[lastVert][lastHor]){
					undoProgress.push(lastVert + "-" + lastHor + "_" + "number_" + solveState[lastVert][lastHor]);
				}
			}
			//console.log(undoProgress);
			
			//draw inputted number
			if (isNaN(number) == false){
				solveState[lastVert][lastHor] = number;
				if(number == ""){
					solveState[lastVert][lastHor] = "-";
				}
			}else{
				solveState[lastVert][lastHor] = "-";
			}
			//drawColor(numberModeColor, lastVert, lastHor);
			//drawNumber(number, lastVert, lastHor);
			
			//drawColor(numberModeColor, lastVert, lastHor);

			modifyGroup(lastVert, lastHor, number, oldNumber);
			calculateLines(lastVert, lastHor, number);
			redrawCell(lastVert, lastHor);
			redrawCell(lastVert + 1, lastHor);
			redrawCell(lastVert - 1, lastHor);
			redrawCell(lastVert, lastHor + 1);
			redrawCell(lastVert, lastHor - 1);
			
			
		}
		
		//calculateGroups();
		//check for errors
		if(editMode == false){
			validateInput(lastVert, lastHor);
			validateSolution();
		}
	}
}
function calculateLines(vertCell, horCell, number){
	//console.log("LOL" + number);
	var x = vertCell;
	var y = horCell;
	var lineX = (((vertCell - 1) * 2) + 1);
	var lineY = (((horCell - 1) * 2) + 1);
	if(number != "-" && number != ""){
		if(x != 1 && solveState[x - 1][y] != "-" && (solveState[x - 1][y] != number)){
			wallState[lineX - 1][lineY] = "line";
		}
		if(y != 1 && solveState[x][y - 1] != "-" && (solveState[x][y - 1] != number)){
			wallState[lineX][lineY - 1] = "line";
		}
		if(x != height && solveState[x + 1][y] != "-" && (solveState[x + 1][y] != number)){
			wallState[lineX + 1][lineY] = "line";
		}
		if(y != width && solveState[x][y + 1] != "-" && (solveState[x][y + 1] != number)){
			wallState[lineX][lineY + 1] = "line";
		}

		if(x != 1 && (solveState[x - 1][y] == number)){
			wallState[lineX - 1][lineY] = "noline";
		}
		if(y != 1 && (solveState[x][y - 1] == number)){
			wallState[lineX][lineY - 1] = "noline";
		}
		if(x != height && (solveState[x + 1][y] == number)){
			wallState[lineX + 1][lineY] = "noline";
		}
		if(y != width && (solveState[x][y + 1] == number)){
			wallState[lineX][lineY + 1] = "noline";
		}
	}else{

		if(solvedNumbers.indexOf((x - 1) + "-" + y) == -1){
			wallState[lineX - 1][lineY] = "noline";
		}
		if(solvedNumbers.indexOf((x + 1) + "-" + y) == -1){
			wallState[lineX + 1][lineY] = "noline";
		}
		if(solvedNumbers.indexOf(x + "-" + (y - 1)) == -1){
			wallState[lineX][lineY - 1] = "noline";
		}
		if(solvedNumbers.indexOf(x + "-" + (y + 1)) == -1){
			wallState[lineX][lineY + 1] = "noline";
		}
	}
	//console.log(wallState);
}

function handleArrowKey(direction){
	var vertCell;
	var horCell;
	switch (direction){
		case "down":
			vertCell = lastVert + 1;
			horCell = lastHor;
			break;
		case "up":
			vertCell = lastVert - 1;
			horCell = lastHor;
			break;
		case "left":
			horCell = lastHor - 1;
			vertCell = lastVert;
			break;
		case "right":
			horCell = lastHor + 1;
			vertCell = lastVert;
			break;
	}

	var drawY = Math.floor((vertCell - 1) * gridSize);
	var drawX = Math.floor((horCell - 1) * gridSize);
	
	if(vertCell > 0 && horCell > 0 && vertCell < height + 1 && horCell < width + 1){

		if (puzzleState[vertCell][horCell] == "-"){
			if (solveState[vertCell][horCell] != "-"){
				drawColor(numberModeColor, vertCell, horCell);	
				drawNumber(solveState[vertCell][horCell], vertCell, horCell);
			}else{
				drawColor(numberModeColor, vertCell, horCell);	
			}
		}else{
			drawColor(numberModeColor, vertCell, horCell);
			drawGiven(solveState[vertCell][horCell], vertCell, horCell);
		}
			
		
		if (lastHor != ""){
			if (lastVert != vertCell || lastHor != horCell){
				drawY = Math.floor((lastVert - 1) * gridSize);
				drawX = Math.floor((lastHor - 1) * gridSize);
				if (solveState[lastVert][lastHor] == "-"){
					drawColor(cellColor, lastVert, lastHor);
				}else if (isNaN(solveState[lastVert][lastHor]) == false){
					drawColor(cellColor, lastVert, lastHor);
					if(puzzleState[lastVert][lastHor].indexOf(")") == -1){
						drawNumber(solveState[lastVert][lastHor], lastVert, lastHor);
					}else{
						drawGiven(solveState[lastVert][lastHor], lastVert, lastHor);
					}
				}
			}
		}
		lastVert = vertCell;
		lastHor = horCell;
	}
}
function redrawCell(x, y){
	if(x != 0 && x != height + 1 && y != 0 && y != width + 1){
		if(x != lastVert || y != lastHor){
			drawColor(cellColor, x, y);
		}else{
			drawColor(numberModeColor, x, y);
		}
		if(solveState[x][y] != "-"){
			if(puzzleState[x][y].indexOf(")") == -1){
				drawNumber(solveState[x][y], x, y);
			}else{
				//var temp = puzzleState[x][y].split("");
				//var number = temp[1];
				drawGiven(solveState[x][y], x, y);
			}
		}
	}
}

function drawColor(color, x, y){

	var drawY = Math.floor((x - 1) * gridSize);
	var drawX = Math.floor((y - 1) * gridSize);
	context.fillStyle = lineColor;
	context.fillRect(drawX, drawY, gridSize, gridSize);
	context.fillStyle = color;
	var number = solveState[x][y];
	//console.log("what" + number);
	var left = drawX + gridSize * .02;
	var top = drawY + gridSize * .02;
	var right = gridSize - (gridSize * .04);
	var bottom = gridSize - (gridSize * .04);
	//handles edges
	
	if(x == 1){
		top = drawY + (gridSize * .06);
		bottom = gridSize - (gridSize * .08);
	}
	if(y == 1){
		left = drawX + (gridSize * .06);
		right = gridSize - (gridSize * .08);
	}
	if(x == height){
		top = drawY + (gridSize * .02);
		bottom = gridSize - (gridSize * .08);
	}
	if(y == width){
		left = drawX + (gridSize * .02);
		right = gridSize - (gridSize * .08);
	}
	//console.log(x + "-" + y);
	//handles adjacent numbers
	//if(x != 1 && number != "-" && solveState[x - 1][y] != "-" && (solveState[x - 1][y] != number)){
	var lineX = (((x - 1) * 2) + 1);
	var lineY = (((y - 1) * 2) + 1);
	if(x != 1 && wallState[lineX - 1][lineY] == "line"){
		
		top = drawY + (gridSize * .04);
		bottom = bottom - (gridSize * .02);
	}
	//if(y != 1 && number != "-" && solveState[x][y - 1] != "-" && (solveState[x][y - 1] != number)){
	if(y != 1 && wallState[lineX][lineY - 1] == "line"){
		left = drawX + (gridSize * .04);
		right = right - (gridSize * .02);
	}
	//if(x != height && number != "-" && solveState[x + 1][y] != "-" && (solveState[x + 1][y] != number)){
	if(x != height && wallState[lineX + 1][lineY] == "line"){
		bottom = bottom - (gridSize * .02);
	}
	//if(y != width && number != "-" && solveState[x][y + 1] != "-" && (solveState[x][y + 1] != number)){
	if(y != width && wallState[lineX][lineY + 1] == "line"){
		//console.log("RIGHT" + x + "-" + y);
		right = right - (gridSize * .02);
	}
	context.fillRect(left, top, right, bottom);

}
function drawNumber(number, x, y){
	var drawY = Math.floor((x - 1) * gridSize);
	var drawX = Math.floor((y - 1) * gridSize);
	context.font = (gridSize * .5) + "pt " + numberFont;

	if(invalidNumbers.indexOf(x + "-" + y) == -1){
		context.fillStyle = inputColor;
	}else{
		context.fillStyle = incorrectColor;
	}
	
	if(number == "-"){
		number = "";
	}
	if(editMode == true){
		context.font = "bold " + (gridSize * .5) + "pt " + numberFont;
	}
	context.fillText(number, drawX + (gridSize * .33), drawY + (gridSize * .75));
}
function drawGiven(number, x, y){
	var drawY = Math.floor((x - 1) * gridSize);
	var drawX = Math.floor((y - 1) * gridSize);
	if(invalidNumbers.indexOf(x + "-" + y) == -1){
		context.fillStyle = inputColor;
	}else{
		context.fillStyle = incorrectColor;
	}
	context.font = "bold " + (gridSize * .5) + "pt " + numberFont;
	
	context.fillText(number, drawX + (gridSize * .33), drawY + (gridSize * .75));
}
function drawLine(lineX, lineY, firstX, firstY, secondX, secondY){

	if(lineY % 2 != 0 && lineX % 2 == 0) {
		//console.log(lineX + "-" + lineY);
		//console.log(firstX + "-" + firstY);

		//console.log("horizontal");
	}else{
		//console.log("vertical");
	}
}
function undo(){

	if(undoProgress.length > 0){
		//console.log(undoProgress);
		var undoState = undoProgress[undoProgress.length - 1];
		var data = undoState.split("_");
		var coords = data[0].split("-");
		var undoVertCell = coords[0] * 1;
		var undoHorCell = coords[1] * 1;

		var undoColor = cellColor;
		if(lastVert == undoVertCell && lastHor == undoHorCell){
			undoColor = numberModeColor;
		}
		var oldNumber = solveState[undoVertCell][undoHorCell];
		var number = "-";

		if(data[1] == "none"){
			drawColor(undoColor, undoHorCell, undoVertCell);
			drawNumber("", undoHorCell, undoVertCell);
			solveState[undoVertCell][undoHorCell] = "-";
		}else if(data[1] == "number"){
			number = data[2] * 1;
			drawColor(undoColor, undoHorCell, undoVertCell);
			drawNumber(number, undoHorCell, undoVertCell);
			solveState[undoVertCell][undoHorCell] = number;
			
		}

		modifyGroup(undoVertCell, undoHorCell, number, oldNumber);
		validateInput(undoVertCell, undoHorCell);
		calculateLines(undoVertCell, undoHorCell, number);
		redrawCell(undoVertCell + 1, undoHorCell);
		redrawCell(undoVertCell - 1, undoHorCell);
		redrawCell(undoVertCell, undoHorCell + 1);
		redrawCell(undoVertCell, undoHorCell - 1);
		redrawCell(undoVertCell, undoHorCell);
		
        //validateSolution();
		undoProgress.pop();
		//lastVert = undoVertCell;
		//lastHor = undoHorCell;
		validateSolution();
	}
	
}
function validateInput(vertCell, horCell){

	var checkCells = new Array();
	checkCells.push(vertCell + "-" + horCell);
	if(vertCell != height){
		checkCells.push((vertCell + 1) + "-" + horCell);
	}
	if(vertCell != 1){
		checkCells.push((vertCell - 1) + "-" + horCell);
	}
	if(horCell != width){
		checkCells.push(vertCell + "-" + (horCell + 1));
	}
	if(horCell != 1){
		checkCells.push(vertCell + "-" + (horCell - 1));
	}
	//console.log(vertCell + "-" + horCell);
	for(i = 0; i < checkCells.length; i++){
		var cell = checkCells[i];
		var temp = cell.split("-");
		var checkX = temp[0] * 1;
		var checkY = temp[1] * 1;
		var number = solveState[checkX][checkY] * 1;
		//console.log(number);
		if(isNaN(number) == false){
			for(k = 0; k < numberGroups.length; k++){
				var group = numberGroups[k];
				if(group.indexOf(cell) != -1){
					if(group.length > (number + 1)){
						//console.log("INVALID");
						for(j = 1; j < group.length; j++){
							if(invalidNumbers.indexOf(group[j]) == -1){
								invalidNumbers.push(group[j]);
							}
							var temp = group[j].split("-");
							var redrawX = temp[0] * 1;
							var redrawY = temp[1] * 1;
							redrawCell(redrawX, redrawY);
						}
					}else{
						for(j = 1; j < group.length; j++){
							var index = invalidNumbers.indexOf(group[j]);
							//console.log(group[j]);
							//console.log(index);
							if(index != -1){
								invalidNumbers.splice(index, 1);
								var temp = group[j].split("-");
								var redrawX = temp[0] * 1;
								var redrawY = temp[1] * 1;
								redrawCell(redrawX, redrawY);
							}
						}
						var foundEmpty = false;

						for(j = 1; j < group.length; j++){
							if(foundEmpty == false){
								var cell = group[j];
								var temp = cell.split("-");
								var emptyX = temp[0] * 1;
								var emptyY = temp[1] * 1;
								if(emptyX != height && solveState[emptyX + 1][emptyY] == "-"){
									foundEmpty = true;
								}else if(emptyX != 1 && solveState[emptyX - 1][emptyY] == "-"){
									foundEmpty = true;
								}else if(emptyY != width && solveState[emptyX][emptyY + 1] == "-"){
									foundEmpty = true;
								}else if(emptyY != 1 && solveState[emptyX][emptyY - 1] == "-"){
									foundEmpty = true;
								}
							}
						}
						if(foundEmpty == false && group.length != number + 1){
							for(j = 1; j < group.length; j++){
								if(invalidNumbers.indexOf(group[j]) == -1){
									invalidNumbers.push(group[j]);
								}
								var temp = group[j].split("-");
								var redrawX = temp[0] * 1;
								var redrawY = temp[1] * 1;
								redrawCell(redrawX, redrawY);
							}
						}
					}
					//console.log("LOL");
				}
			}
		}
	}
}
function stopGeneration(){
	worker.terminate();
	$("#generateButton").css("display", "inline");
	$("#stopGenerationButton").css("display", "none");
	$("#genProgress").css("display", "none");
}
function generate(button){
	var progressBar = $("#genProgress");
	progressBar.attr("value", 0);
	progressBar.attr("max", 100);
	var tempId = $("#idField").val();
	// var difficulty = $("input[name=difficulty]:checked").val();
	var difficulty = "hard";
	// var userWidth = $("#genWidthField").val();
	var userWidth = 13;
	// var userHeight = $("#genHeightField").val();
	var userHeight = 9;
	progressBar.css("display", "block");
	
	$("#generateButton").css("display", "none");
	$("#stopGenerationButton").css("display", "inline");
	//$("#generateButton").attr("disabled","disabled");
	progressBar.attr("max", userWidth * userHeight);
	progressBar.attr("value", 0);
	//$("#randomButton").attr("disabled","disabled");
	
	worker = new Worker("solverGenerator.js");
	worker.onmessage = function (event) {
		var data = event.data;
		console.log(data);
		if(data.indexOf("done") != -1){
			
			temp = data.split("_");
			generatedPuzzle = temp[1];
			displayPuzzle(generatedPuzzle);
			puzzle = generatedPuzzle;
			//console.log(generatedPuzzle);
			progressBar.attr("value", 0);
			progressBar.attr("max", userWidth * userHeight);
			progressBar.css("display", "none");
			//$("#generateButton").removeAttr('disabled').removeClass('ui-state-disabled');
			//$("#randomButton").removeAttr('disabled').removeClass('ui-state-disabled');
			$("#generateButton").css("display", "inline");
			$("#stopGenerationButton").css("display", "none");
		}else if(data.indexOf("regen") != -1){
			//console.log("regen");
			//progressBar.attr("value", 0);
		}else if(data.indexOf("testing") != -1){
			var newProgress = (progressBar.attr("value") * 1) + 1;
			progressBar.attr("value", newProgress);
		}else if(data.indexOf("replacing") != -1){
			
			//console.log(data);
		}else{
			//console.log(data);
		}
	};
	worker.onerror = function(event){
		console.log(event.message + " (" + event.filename + ":" + event.lineno + ")");
	};
	
	worker.postMessage("generate_" + userWidth + "_" + userHeight + "_" + difficulty);
		
			
		

}
function solve(){
	
	var max = width * height;
	var progressBar = $("#solveProgress");
	progressBar.attr("value", 0);
	progressBar.attr("max", max);
	var userSolvePuzzle = $("#userSolvePuzzle").val();
	if (userSolvePuzzle != ""){
		
		editMode = false;
		puzzle = userSolvePuzzle;
		display(userSolvePuzzle);
		max = (width * height) - (userSolvePuzzle.split("1").length - 1) - (userSolvePuzzle.split("2").length - 1) - (userSolvePuzzle.split("3").length - 1) - (userSolvePuzzle.split("4").length - 1) - (userSolvePuzzle.split("5").length - 1)
		- (userSolvePuzzle.split("6").length - 1) - (userSolvePuzzle.split("7").length - 1) - (userSolvePuzzle.split("8").length - 1) - (userSolvePuzzle.split("9").length - 1);
	}else{
		//console.log(puzzleState);
		tempPuzzle = width + "x" + height + ":";
		var numberCount = 0;
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				if(editMode == false){
					if(puzzleState[x][y] != "-"){
						numberCount++;
						var temp = puzzleState[x][y].split("");
						tempPuzzle += temp[1] + "";
					}else{
						tempPuzzle += puzzleState[x][y];
					}
				}else{
					tempPuzzle += solveState[x][y];
				}
			}
		}
		max = (width * height) - numberCount;
		puzzle = tempPuzzle;
		console.log(tempPuzzle);
	}
	$("#generatedPuzzle").val(puzzle);
	worker = new Worker("solverGenerator.js");
	worker.onerror = function(event){
		console.log(event.message + " (" + event.filename + ":" + event.lineno + ")");
	};
	var progress = 0;
	progressBar.css("display", "block");
	$("#stopSolvingButton").css("display", "inline");
	$("#solveButton").css("display", "none");
	progressBar.attr("max", max);
	progressBar.attr("value", progress);
	console.time("solve");
	worker.onmessage = function (event) {
		data = event.data;
		if(data.indexOf("done") != -1){
			console.timeEnd("solve");
			//alert(data);

			$("#solveProgress").css("display", "none");
			$("#stopSolvingButton").css("display", "none");
			$("#solveButton").css("display", "inline");
			temp = data.split("_");
			console.log(temp);
			temp = temp[1].split(":");
			var solutionString = temp[2];
			//console.log(solutionString);
			displaySolution(solutionString);

		}else if(data.indexOf("error") != -1){
			worker.terminate();
			$("#solveProgress").css("display", "none");
			$("#stopSolvingButton").css("display", "none");
			$("#solveButton").css("display", "inline");
		}else if(data.indexOf("solving") != -1){
			var newProgress = (progressBar.attr("value") * 1) + 1;
			progressBar.attr("value", newProgress);
			//console.log(data);
		}else{
			console.log(data);
		}
	};
	worker.postMessage("solve_" + puzzle + "_" + "harder");
}
function displaySolution(solutionString){
	if(editMode == true){
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				if(solveState[x][y] != "-"){
					puzzleState[x][y] = "(" + solveState[x][y] + ")";
				}
			}
		}
	}
	//console.log(puzzleState);
	var tempEdit = false;
	if(editMode == true){
		tempEdit = true;
	}
	editMode = false;
	var solutionData = solutionString.split("")
	var z = 0;
	for (x=1;x <= (height);x++) {
		for (y=1;y <= (width);y++) {
			if(solutionData[z].indexOf("-") == -1){
				if(solveState[x][y] == "-"){
					solveState[x][y] = solutionData[z];
					drawNumber(solutionData[z], x, y);
					//modifyGroup(x, y, solutionData[z], "-");
					calculateLines(x, y, solutionData[z]);
				}
			}
			
			z++;
		}
	}
	calculateGroups();

	if(tempEdit == true){
		editMode = true;
	}
	if(editMode == true){
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				if(puzzleState[x][y] == "-"){
					solveState[x][y] = "-";
				}
			}
		}
	
		for (x=1;x <= (height);x++) {
			for (y=1;y <= (width);y++) {
				puzzleState[x][y] = "-";
			}
		}
		clearPuzzle = true;
	}
	//console.log("LOL");
}
function validateSolution(){
    var isSolved = true;
    var foundEmpty = false;
    //console.log("invalid: " + invalidClues);
    if(invalidNumbers.length == 0){
        //console.log("checking");
        while(foundEmpty == false){
            for (x=1;x <= (height);x++) {
                for (y=1; y <= (width);y++) {
                    if(solveState[x][y] == "-" || solveState[x][y] == ""){
                        isSolved = false;
                        foundEmpty = true;
                        //console.log("found empty");
                    }
                }
            }
            foundEmpty = true;
        }
    }else{
        isSolved = false
    }
	if(isSolved == true){
		//console.log("WHAT");
		$("#canvasDiv").css("border-color", "#1BE032");
	}else{
		$("#canvasDiv").css("border-color", "black");
	}
	
}
function clear(){

	$("#clearButton").blur();
	if(editMode == false){
		displayPuzzle(puzzle);
	}else{

		var tempPuzzle = width + "x" + height + ":";
		for (x=1;x <= (height);x++) {
	        for (y=1; y <= (width);y++) {
				tempPuzzle += solveState[x][y];				
	        }
	    }
	    console.log(tempPuzzle);
	    puzzle = tempPuzzle;
	    displayPuzzle(tempPuzzle);
	}

}
function displayGrid(){
	editMode = true;
	width = $("#solveWidthField").val();
	height = $("#solveHeightField").val();
	tempString = width + "x" + height + ":";
	for (z=0;z <= (width * height);z++) {
		tempString += "a";
	}
	puzzle = tempString;
	displayPuzzle(tempString);
}

function getDeviceScale() {
    var deviceWidth, landscape = Math.abs(window.orientation) == 90;
    if (landscape) {
      // iPhone OS < 3.2 reports a screen height of 396px
      deviceWidth = Math.max(480, screen.height);
    } else {
      deviceWidth = screen.width;
    }
    return window.innerWidth / deviceWidth;
}
var docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
