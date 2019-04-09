const socket = io.connect();

let button;
//let userId;
//Cookies.remove('userId');
let userId = Cookies.get('userId');

let blk_count = 0;
let MINING = false;
let blks = [];

let BLKS_UPDATED = false



function createNewUser(){

	fetch('/user/new')
		.then(function(data){
			console.log(res);
			userId = res.userId;
			Cookies.set('userId', userId);
			console.log(res.userId);
		})
		.catch(function(error){
			console.error(error);
		})


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
  	//console.log(button);
  	
}

socket.on('blks', function(data) {
	//console.log(blks);
	blks = data;
	BLKS_UPDATED = true;
});

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
	fetch('/user/blks/' + userId)
		.then((resp) => resp.json()) // Transform the data into json
		.then(function(data){
			
			blk_count = data.blks;
			console.log('blocks', data, blk_count);	
		})
		.catch(function (error){
			console.error(error);
		})
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
	console.log(block, JSON.stringify(block));


	httpPost('/block/verify', 'json', block, function(res,err){
		if(err){
			console.error("Cannot Verify block", err);
			getLatestBlock();
		
		}else{
			blk_count = res.blks;
			console.log(res, blk_count);
				
		}

		button.show();
		MINING = false;

	});
}


function mousePressed(){
	let msg = {'x': mouseX, 'y': mouseY};
	socket.emit('step world', msg)
}


function mouseMoved(){
	
}

function draw() {
	background(51);
	fill(240);
	textSize(32);
	text('Blocks:' + blk_count.toString() , 20, 40);
	//console.log(count);

	if(MINING){
		fill(0);
		textSize(64);
		text('Mining...', 10, 200);
	}

	for(let i = 0; i < blks.length; i++){
		drawBlk(blks[i])
	}
}	

function drawBlk(blk){
	let x = map(blk.x, 0, worldWidth, 0, windowWidth);
	let y = map(blk.y, 0, worldHeight, 0, windowHeight);
	
	rect(x,y, 10, 10);
}

//setInterval(1000, mousePressed);