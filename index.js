//Made by StarshipCode

//Canvas and graphic context
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

//Size of the tiles
const tileSize = 64
//Field of view
const fov = 60
//Wall width
const wallSize = tileSize * 10
//Colors constants
const SKY_COLOR = "#373"
const FLOOR_COLOR = "#788"

//Speeds
let speed = 4
let angleSpeed = 5

//Render the blocks or map view
let render = true

//Map array
const map = [
	[1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 3, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
	[1, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

//Resize canvas
canvas.width = 700
canvas.height = 700

//Textures
let wallTexture = new Image()
wallTexture.src = "./textures/wall.png"

let handTexture = new Image()
handTexture.src = "textures/hands.png"

function drawMap() {
	ctx.fillStyle = "#333"
	for (let x = 0; x < map[0].length; x++) {
		for (let y = 0; y < map.length; y++) {
			if (map[y][x] == 1)
				ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
		}
	}
}
//keeping the angle between 0 and 360
function normalizeAngle(angle) {
	if (angle > 360)
		return angle % 360
	else if (angle < 0)
		return 360 + angle

	return angle
}
//Convert to radians
function toRadians(angle) {
	return Math.PI / 180 * angle
}
//Calculate distance between two points
function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

//Player
function Player() {
	//Player coords
	this.x = tileSize * 1.7
	this.y = tileSize * 1.7

	//Moves
	this.down = false
	this.up = false
	//Player angle
	this.angle = 0

	this.rays = []
	//Start
	this.start = () => {
		let angle = toRadians(fov) / canvas.width
		for (let i = 0; i < canvas.width; i++) {
			this.rays.push(new Ray(this.angle + i * angle, this.x, this.y, i))
		}
	}

	//Draw
	this.draw = () => {
		//Moves
		if (this.up) {
			let x = Math.floor((this.x + Math.cos(toRadians(this.angle)) * 2) / tileSize)
			let y = Math.floor((this.y + Math.sin(toRadians(this.angle)) * 2) / tileSize)
			if (map[y][x] == 0) {
				this.y += Math.sin(toRadians(this.angle)) * 2
				this.x += Math.cos(toRadians(this.angle)) * 2
			}
		}
		else if (this.down) {
			let x = Math.floor((this.x - Math.cos(toRadians(this.angle)) * 2) / tileSize)
			let y = Math.floor((this.y - Math.sin(toRadians(this.angle)) * 2) / tileSize)
			if (map[y][x] == 0) {
				this.y -= Math.sin(toRadians(this.angle)) * 2
				this.x -= Math.cos(toRadians(this.angle)) * 2
			}
		}

		if (!render) {
			//Draw pointer
			ctx.beginPath()
			ctx.strokeStyle = "red"
			ctx.moveTo(this.x, this.y)
			ctx.lineTo(this.x + Math.cos(toRadians(this.angle)) * 17, this.y + Math.sin(toRadians(this.angle)) * 17)
			ctx.stroke()
			ctx.closePath()
		}
		//Normalize angle
		this.angle = normalizeAngle(this.angle)
		//If render is false, just draw the player
		if (!render) {
			//Draw player
			ctx.beginPath()
			ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
			ctx.fill()
			ctx.closePath()
		}

		this.angle = normalizeAngle(this.angle)
		//Making a cone of rays
		let angle = fov / canvas.width
		let x = -fov / 2
		for (let i = 0; i < canvas.width; i++) {
			this.rays[i].angle = toRadians(normalizeAngle(this.angle + x))
			x += angle
			this.rays[i].x = this.x
			this.rays[i].y = this.y
			this.rays[i].draw()
		}
		//Drawing hands
		let size = 5 //Zoom of texture
		ctx.drawImage(handTexture, canvas.width / 2 - handTexture.width / 2 * size, canvas.height - handTexture.height * size, handTexture.width * size, handTexture.height * size)
	}
}
//Rays
function Ray(angle, x, y, i) {
	//Coords of the player
	this.x = x
	this.y = y
	//Id of ray
	this.i = i
	//Hit of the ray
	this.wallHitX = 0
	this.wallHitY = 0

	this.wallHitHorizontalX = 0
	this.wallHitHorizontalY = 0

	this.wallHitVerticalY = 0
	this.wallHitVerticalX = 0
	//Pixel to draw from texture
	this.pixel = 0
	//Kind of texture to draw
	this.textureId = 0
	//Angle of the ray
	this.angle = toRadians(angle)

	this.draw = () => {

		this.stepX = 0
		this.stepY = 0

		let tempX = Math.floor(this.x / tileSize)
		let tempY = Math.floor(this.y / tileSize)
		this.tempX = tempX
		this.right = false
		this.down = false

		//Horizontal bounce
		if (this.angle < toRadians(90) || this.angle > toRadians(270)) {
			tempX += 1
			this.right = true
		}
		//Vertical bounce
		if (this.angle < Math.PI) {
			tempY += 1
			this.down = true
		}

		this.interceptX = 0
		this.interceptY = 0
		this.stepX = 0
		this.stepY = 0

		//Horizontal Bounce
		let horizontalBounce = false

		this.interceptY = tempY * tileSize
		let adyacent = (this.interceptY - this.y) / Math.tan(this.angle)
		this.interceptX = this.x + adyacent

		//Calculate steps
		this.stepY = tileSize
		this.stepX = tileSize / Math.tan(this.angle)

		if (!this.down)
			this.stepY *= -1

		if ((!this.right && this.stepX > 0) || (this.right && this.stepX < 0))
			this.stepX *= - 1

		let nextHorizontalX = this.interceptX
		let nextHorizontalY = this.interceptY

		if (!this.down)
			nextHorizontalY--

		while (!horizontalBounce && (nextHorizontalX >= 0 && nextHorizontalX < tileSize * map[0].length && nextHorizontalY >= 0 && nextHorizontalY < tileSize * map.length)) {
			let x = Math.floor(nextHorizontalX / tileSize)
			let y = Math.floor(nextHorizontalY / tileSize)

			if (map[y][x] != 0) {
				horizontalBounce = true
				this.wallHitHorizontalX = nextHorizontalX
				this.wallHitHorizontalY = nextHorizontalY
			}
			else {
				nextHorizontalX += this.stepX
				nextHorizontalY += this.stepY
			}
		}
		//Vertical bounce
		let verticalBounce = false

		this.interceptX = tempX * tileSize
		let opposite = Math.tan(this.angle) * (this.interceptX - this.x)
		this.interceptY = this.y + opposite
		//Calculate steps
		this.stepX = tileSize
		this.stepY = Math.tan(this.angle) * tileSize

		if (!this.right)
			this.stepX *= -1

		if ((!this.down && this.stepY > 0) || (this.down && this.stepY < 0))
			this.stepY *= -1

		let nextVerticalX = this.interceptX
		let nextVerticalY = this.interceptY

		if (!this.right)
			nextVerticalX--
		//Loop to find bounce
		while (!verticalBounce && (nextVerticalX >= 0 && nextVerticalX < tileSize * map[0].length && nextVerticalY >= 0 && nextVerticalY < tileSize * map.length)) {
			let x = Math.floor(nextVerticalX / tileSize)
			let y = Math.floor(nextVerticalY / tileSize)

			if (map[y][x] != 0) {
				verticalBounce = true
				this.wallHitVerticalX = nextVerticalX
				this.wallHitVerticalY = nextVerticalY
			}
			else {
				nextVerticalX += this.stepX
				nextVerticalY += this.stepY
			}
		}
		//Calculate first bounce
		let horizontalDistance = 9999
		let verticalDistance = 9999

		if (horizontalBounce)
			horizontalDistance = distanceBetweenPoints(this.x, this.y, this.wallHitHorizontalX, this.wallHitHorizontalY)
		if (verticalBounce)
			verticalDistance = distanceBetweenPoints(this.x, this.y, this.wallHitVerticalX, this.wallHitVerticalY)
		if (horizontalDistance < verticalDistance) {
			this.wallHitX = this.wallHitHorizontalX
			this.wallHitY = this.wallHitHorizontalY
			//Select pixel of the texture
			this.pixel = this.wallHitX % tileSize
			//Texture id
		}
		else {
			this.wallHitX = this.wallHitVerticalX
			this.wallHitY = this.wallHitVerticalY
			//Select pixel of the texture
			this.pixel = this.wallHitY % tileSize
			//Texture id
		}

		//Id of texture
		let idX = Math.floor(this.wallHitX / tileSize)
		let idY = Math.floor(this.wallHitY / tileSize)
		this.textureId = map[idY][idX]
		//Rendering map
		if (!render) {
			ctx.beginPath()
			ctx.moveTo(this.x, this.y)
			ctx.lineTo(this.wallHitX, this.wallHitY)
			ctx.stroke()
			ctx.closePath()
		}
		else {
			let distance = Math.cos(toRadians(player.angle) - this.angle) * distanceBetweenPoints(this.x, this.y, this.wallHitX, this.wallHitY)
			let distanceToProjectionPlane = (canvas.width / 2) / Math.tan(fov / 2)
			let wallSizeProjected = (wallSize / distance) * distanceToProjectionPlane
			//Render texture
			let textureHeight = 64
			ctx.imageSmoothingEnabled = false
			if (render == 1)
				ctx.drawImage(wallTexture, this.pixel, (this.textureId - 1) * textureHeight, 1, textureHeight, this.i, canvas.height / 2 - wallSizeProjected / 2, 1, wallSizeProjected)
			else if (render == 2) {
				ctx.fillStyle = `rgb(${255 / distance * 4 + 70},${255 / distance * 4 + 70},${255 / distance * 4 + 70})`
				ctx.fillRect(i, Math.floor(canvas.height / 2) - Math.floor(wallSizeProjected / 2), 1, wallSizeProjected)
			}
		}
	}
}

let player = new Player()
//Loop function for drawing
function draw() {
	//Clear display
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	//Draw sky and floor
	ctx.fillStyle = SKY_COLOR
	ctx.fillRect(0, 0, canvas.width, canvas.height / 2)
	ctx.fillStyle = FLOOR_COLOR
	ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2)
	//Draw map
	if (!render)
		drawMap()
	//Draw player
	player.draw()

	requestAnimationFrame(draw)
}

player.start()
draw()
//Keys
const K_LEFT = 37
const K_RIGHT = 39
const K_UP = 38
const K_DOWN = 40
//Keyboard events
document.addEventListener("keydown", e => {
	let x = 0
	let y = 0
	switch (e.keyCode) {
		case K_LEFT:
			player.angle -= angleSpeed
			break;
		case K_RIGHT:
			player.angle += angleSpeed
			break
		case K_UP:
			player.up = true
			break;
		case K_DOWN:
			player.down = true
			break;
	}
})

document.addEventListener("keyup", e=>{
	switch(e.keyCode){
		case K_UP:
			player.up = false
			break
		case K_DOWN:
			player.down = false
			break;
	}
})