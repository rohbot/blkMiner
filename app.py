from flask import Flask, render_template, jsonify, request, json
from flask_redis import Redis
from flask_socketio import SocketIO
import time
import sys
import Crypto
import Crypto.Random
from Crypto.Hash import SHA
import hashlib
from uuid import uuid4






app = Flask(__name__)
redis = Redis(app)
socketio = SocketIO(app)

try:
	LATEST_HASH = redis.get('prev-hash').decode("utf-8")
except:
	LATEST_HASH = '0000'
	redis.set('prev-hash', LATEST_HASH)
print('Latest hash:', LATEST_HASH)

try:
	LAST_BLOCK_ID = int(redis.get('last-block-id').decode("utf-8"))
except:
	LAST_BLOCK_ID = 0
	redis.set('last-block-id', LAST_BLOCK_ID)
print("last block id:" , LAST_BLOCK_ID)


@app.route('/')
def index():
	nodeId = redis.get('node-id').decode("utf-8")
	return render_template('./index.html', nodeId=nodeId, blockId=LAST_BLOCK_ID, prevHash = LATEST_HASH)


@app.route('/block/latest')
def latestBlock():
	#nid = redis.get('node-id').decode("utf-8") 
	response = {'prevHash': LATEST_HASH, 'blockId' : LAST_BLOCK_ID}
	return jsonify(response), 200 

@app.route('/block/verify', methods=['POST'])
def verifyBlock():
	global LAST_BLOCK_ID, LATEST_HASH
	try:
		print(type(request.json))
		#data = json.dumps(request.json)
		#block = json.loads(data)
		block = request.json
		print('new Block:', block)
		if block['blockId'] != LAST_BLOCK_ID:
			raise Exception("Block id does not match")
		if block['prevHash'] != LATEST_HASH:
			raise Exception("Previous Hash not up to date")
			
		hashString = (str(block['prevHash'])+str(block['userId'])+str(block['nonce'])).encode()
		hashResult = hashlib.sha256(hashString).hexdigest()
		print('Hash Valid: ', hashResult)
		if hashResult != block['hash'] or hashResult[:4] != '0000':
			raise Exception("Invalid hash for block")
		
		# Update latest Hash and save to redis
		LATEST_HASH = hashResult
		redis.set('prev-hash', LATEST_HASH)	
		
		LAST_BLOCK_ID = redis.incr('last-block-id')
		userBlks = redis.incr('blk:'+block['userId']) 
		latestBlock = { 'blockId': LAST_BLOCK_ID, 'prevHash': LATEST_HASH}
		socketio.emit('block', latestBlock);
		response = {'status': 'accepted', 'block': latestBlock, 'blks': userBlks};
		
		return jsonify(response), 200 

	except:
		print(sys.exc_info())
		response = {'message': 'Error in Block'}
		return jsonify(response), 406



@app.route('/node/id')
def nodeid():
	nid = redis.get('node-id').decode("utf-8") 
	response = {'nodeId': nid}
	return jsonify(response), 200 


@app.route('/user/blks/<userId>', methods=['GET'])
def getUserBlks(userId):
	#Generate random number to be used as userId
	blks = redis.get('blk:'+str(userId)).decode() 
	response = {'blks': blks}
	return jsonify(response), 200 




@app.route('/user/new', methods=['GET'])
def newUser():
	#Generate random number to be used as userId
	userId = str(uuid4()).replace('-', '')
	response = {'userId': userId}
	return jsonify(response), 200 


@app.route('/pos', methods=['POST'])
def pos():
	if request.headers['Content-Type'] == 'application/json':
		data = json.dumps(request.json)
		print('new data:', data)
		socketio.emit('pos', data);
		response = {'status': 'ok'}
		return jsonify(response), 200 

	else:
		response = {'message': 'Invalid Transaction!'}
		return jsonify(response), 406


@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)


if __name__ == '__main__':

    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
