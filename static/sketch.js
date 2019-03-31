const socket = io.connect();

let button;
//let userId;
//Cookies.remove('userId');
let userId = Cookies.get('userId');

let blks = 0;
let MINING = false;


function createNewUser(){

	httpGet('/user/new', 'json', function(res){
		console.log(res);
		userId = res.userId;
		Cookies.set('userId', userId);
		console.log(res.userId);
		
	});
}


function setup() {

	createCanvas(windowWidth, windowHeight);

	if(userId == undefined){
		createNewUser();
	}else{
		console.log('userId:', userId);
		getUserBlks();
	}
	 

	background(51);
	button = createButton('Mine');
  	button.position(200, 19);
  	button.mousePressed(getLatestBlock);
  	console.log(button);
  	
}



socket.on('block', function(block) {
	//console.log(msg);
	//let block = JSON.parse(msg);
	console.log('New Block', block);
	blockId = block.blockId;
	prevHash = block.prevHash;

});

socket.on('pos', function(msg) {
	let data = JSON.parse(msg);
	console.log(data);

	ellipse(data.x, data.y, 10, 10);

});

function getUserBlks(){
	httpGet('/user/blks/' + userId, 'json', function(res){
		console.log('blocks', res);
		blks = res.blks;
	});
}

function getLatestBlock(){
	MINING = true;
	button.hide();

	httpGet('/block/latest', 'json', function(res){
		console.log('Latest Block', res);
		blockId = res.blockId;
		prevHash = res.prevHash;
		mineBlock();
	})
}


function validateBlock(userId, prevHash, nonce){
	let hashString = prevHash + userId + nonce.toString()
	let hash = CryptoJS.SHA256(hashString).toString();
	if(hash.slice(0,4) == "0000"){
		return true;
	}else{
		return false
	}
}

function mineBlock(){
	let nonce = 0
	while(!validateBlock(userId, prevHash, nonce)){
		nonce++;
	}
	let hashString = prevHash + userId + nonce.toString()
	let hash = CryptoJS.SHA256(hashString).toString();
	//console.log(hash.slice(0,2), hashString, hash);
	
	let block = {
		blockId : blockId,
		prevHash : prevHash,
		userId : userId,
		nonce : nonce,
		hash: hash
	}
	console.log(block);
	httpPost('/block/verify', 'json', block, function(res,err){
		if(err){
			console.error("Cannot Verify block", err);
			getLatestBlock();
		}else{
			blks = res.blks;
			console.log(res, blks);
				
		}
		
		button.show();
		MINING = false;
	});
}


function mousePressed(){
	let msg = {'x': mouseX, 'y': mouseY};
	//console.log(msg);
	// httpPost('/pos', 'json', msg, function(res){
	// 	console.log(res);
	// });
}


function mouseMoved(){
	
}

function draw() {
	background(51);
	fill(240);
	textSize(32);
	text('Blocks:' + blks.toString() , 20, 40);
	//console.log(count);

	if(MINING){
		fill(0);
		textSize(64);
		text('Mining...', 10, 200);

	}	
}


