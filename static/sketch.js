const socket = io.connect('http://' + document.domain + ':' + location.port);

let button;
//let userId;
//Cookies.remove('userId');
let userId = Cookies.get('userId');


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
	}
	 

	background(51);
	button = createButton('Mine');
  	button.position(19, 19);
  	button.mousePressed(getLatestBlock);
  	
}

socket.on('block', function(msg) {
	console.log(msg);
});

socket.on('pos', function(msg) {
	let data = JSON.parse(msg);
	console.log(data);

	ellipse(data.x, data.y, 10, 10);

});


function calcHash(data){
	let encrypted = CryptoJS.SHA256(JSON.stringify(data)).toString();
	console.log(encrypted);
}

function getLatestBlock(){
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
	httpPost('/block/verify', 'json', block, function(res){
		console.log(res);
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
	//console.log(count);	
}


