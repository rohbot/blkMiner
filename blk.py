import vectormath as vmath
from random import random, randrange
import time

WORLD_HEIGHT = 100
WORLD_WIDTH = 100
MAX_ACCL = 10

class BlkWorld:
	def __init__(self, height=WORLD_HEIGHT, width=WORLD_WIDTH):
		self.blks = []
		self.steps = 0
		self.height = height
		self.width = width

	def createBlk(self, _id):
		blk = Blk(_id)
		self.blks.append(blk)

	def step(self):
		for blk in self.blks:
			blk.step()
		self.steps += 1
			
	def getData(self):
		data = []
		for blk in self.blks:
			data.append(blk.getData())
		return data	

class Blk:
	def __init__(self, _id):
		self.id = _id
		self.pos = vmath.Vector2(randrange(WORLD_HEIGHT), randrange(WORLD_WIDTH))
		self.vel = vmath.Vector2(random() - 0.5, random()- 0.5)
		self.acc = vmath.Vector2(random()- 0.5, random()- 0.5)
		self.size = 1


	def step(self):
		self.vel += self.acc
		self.pos += self.vel

		if self.pos.x < 0:
			self.pos.x = 0
			self.vel.x = -self.vel.x

		if self.pos.x > WORLD_WIDTH:
			self.pos.x = WORLD_WIDTH
			self.vel.x = -self.vel.x

		if self.pos.y < 0:
			self.pos.y = 0
			self.vel.y = -self.vel.y

		if self.pos.y > WORLD_WIDTH:
			self.pos.y = WORLD_WIDTH
			self.vel.y = -self.vel.y

		# Set acceleration to 0
		self.acc *= 0

	def applyForce(self, force):
			
		self.acc += vmath.Vector2(force,force)
		if(self.acc > MAX_ACCL):
			force = MAX_ACCL
	
	def getData(self):
		data = {'id':self.id,'x': self.pos.x, 'y': self.pos.y}
		return data

if __name__ == '__main__':
	world = BlkWorld()
	world.createBlk('test')
	while True:
		world.step()
		print(world.getData())
		time.sleep(0.05)