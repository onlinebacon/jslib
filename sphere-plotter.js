import { Transform, Vector } from './three-d.js';

const LEFT_BUTTON = 0;
const LEFT_BUTTON_MASK = 1;
const lineWidth = 1.5;
const crossHairLineWidth = 1;
const pointRad = lineWidth*1.5;
const colorMap = {
	background: '#2c2c2c',
	latitudeLines: 'rgba(0, 255, 192, 0.5)',
	longitudeLines: 'rgba(0, 192, 255, 0.5)',
	greenwich: 'rgba(255, 255, 255, 0.5)',
	equator: 'rgba(255, 64, 0, 0.5)',
	border: 'rgba(0, 255, 255, 1)',
	surface: 'rgba(40, 40, 40, 0.8)',
	smallCircle: '#fb0',
	crossHair: '#fff',
	line: '#fff',
	point: '#fff',
	northPole: '#f44',
	southPole: '#ccc',
};

const gridPoints = [];
const userPoints = [];
const gridSmallCircles = [];
const userSmallCircles = [];
const userLines = [];
const gridLines = [];
const global = new Transform();
const projection = new Transform();
const observerUpdateHandlers = [];

let canvas, ctx;
let cx, cy;
let nDivisions = 6;
let nVertices = 90;
let viewRadius = 190;

const chordToArc = (chord) => Math.asin(chord/2)*2;

const project = (vector, dst) => {
	return vector.apply(projection, dst);
};

const findCircleSliceStart = (arr) => {
	if (arr.length < 2) return 0;
	let index = -1;
	let dist = -1;
	for (let i=0; i<arr.length; ++i) {
		const a = arr.at(i - 1);
		const b = arr[i];
		const dx = a[0] - b[0];
		const dy = a[1] - b[1];
		const d = dx*dx + dy*dy;
		if (d > dist) {
			index = i;
			dist = d;
		}
	}
	return index;
};

const drawHalfCircle = (arr, connect = false) => {
	let index;
	index = findCircleSliceStart(arr);
	ctx.beginPath();
	for (let i=0; i<arr.length; ++i) {
		const j = (i + index)%arr.length;
		const [ x, y ] = arr[j];
		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	if (connect) {
		ctx.closePath();
	}
	ctx.stroke();
};

const drawGreatCircleRoute = (arr, flip) => {
	ctx.beginPath();
	for (let i=0; i<arr.length; ++i) {
		const [ x, y ] = arr[i];
		if (i === 0 || i === flip) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.stroke();
};

const drawPoint = (point) => {
	const { projected, color } = point;
	const [ x, y ] = projected;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, pointRad, 0, Math.PI*2);
	ctx.fill();
};

class Point {
	constructor(lat, lon, color) {
		this.lat = lat;
		this.lon = lon;
		this.color = color;
		this.isPositive = null;
		this.vertex = new Vector();
		this.projected = new Vector();
		this.buildVertices();
	}
	buildVertices() {
		const { lat, lon, vertex } = this;
		vertex.set([ 0, 0, 1 ]).rotateX(lat).rotateY(-lon);
		return this;
	}
	updateView() {
		project(this.vertex, this.projected);
		return this;
	}
	drawNegative() {
		if (this.projected.z < 0) {
			drawPoint(this);
		}
		return this;
	}
	drawPositive() {
		if (this.projected.z >= 0) {
			drawPoint(this);
		}
		return this;
	}
}

class SmallCircle {
	constructor(lat, lon, rad, color) {
		this.lat = lat;
		this.lon = lon;
		this.rad = rad;
		this.color = color;
		this.positive = [];
		this.negative = [];
		this.createVertexArray();
		this.buildVertices();
	}
	createVertexArray() {
		this.vertices = [...new Array(nVertices)].map(() => new Vector());
		this.projected = [...new Array(nVertices)].map(() => new Vector());
		return this;
	}
	buildVertices() {
		if (this.vertices.length !== nVertices) {
			this.createVertexArray();
		}
		const { vertices, lat, lon, rad } = this;
		const z = Math.cos(rad);
		const zRad = Math.sin(rad);
		const transform = new Transform().rotateX(lat).rotateY(-lon);
		for (let i=0; i<nVertices; ++i) {
			const angle = (i/nVertices)*(Math.PI*2);
			const x = Math.sin(angle)*zRad;
			const y = Math.cos(angle)*zRad;
			vertices[i].set([ x, y, z ]).apply(transform);
		}
		return this;
	}
	updateView() {
		const { vertices, projected, positive, negative } = this;
		positive.length = 0;
		negative.length = 0;
		for (let i=0; i<vertices.length; ++i) {
			const point = project(vertices[i], projected[i]);
			const z = point[2];
			if (z >= 0) positive.push(point);
			else negative.push(point);
		}
		return this;
	}
	drawPositive() {
		const { positive } = this;
		drawHalfCircle(positive, this.negative.length === 0);
		return this;
	}
	drawNegative() {
		const { negative } = this;
		drawHalfCircle(negative, this.positive.length === 0);
		return this;
	}
}

class Line {
	constructor(lat1, lon1, lat2, lon2, color) {
		this.color = color;
		this.end1 = new Vector([ 0, 0, 1 ]).rotateX(lat1).rotateY(-lon1);
		this.end2 = new Vector([ 0, 0, 1 ]).rotateX(lat2).rotateY(-lon2);
		this.dif = new Vector().set(this.end2).sub(this.end1);
		this.chord = this.dif.len();
		this.arc = chordToArc(this.chord);
		this.positive = [];
		this.negative = [];
		this.positiveFlip = null;
		this.negativeFlip = null;
		this.createVertexArray();
		this.buildVertices();
		this.updateView();
	}
	createVertexArray() {
		const n = Math.ceil(this.arc/(Math.PI*2/nVertices)) + 1;
		this.vertices = [...new Array(n)].map(() => new Vector());
		this.projected = [...new Array(n)].map(() => new Vector());
		return this;
	}
	buildVertices() {
		if (this.vertices.length !== nVertices) {
			this.createVertexArray();
		}
		const { vertices, end1, end2, chord, arc } = this;
		const [ ax, ay, az ] = end1;
		const [ bx, by, bz ] = end2;
		const n = vertices.length;
		const iScalar = 1/(n - 1);
		for (let i=0; i<n; ++i) {
			const val = i*iScalar;
			const theta = arc*(0.5 - val);
			const chordSegment = Math.sin(theta);
			const wb = (chord*0.5 - chordSegment)/chord;
			const wa = 1 - wb;
			vertices[i].set([
				ax*wa + bx*wb,
				ay*wa + by*wb,
				az*wa + bz*wb,
			]).normalize();
		}
		return this;
	}
	updateView() {
		const { vertices, projected, positive, negative } = this;
		positive.length = 0;
		negative.length = 0;
		this.positiveFlip = null;
		this.negativeFlip = null;
		let last = null;
		for (let i=0; i<vertices.length; ++i) {
			const point = project(vertices[i], projected[i]);
			const z = point[2];
			const sign = z >= 0 ? 1 : -1;
			if (sign === 1) {
				positive.push(point);
				if (last === -1) this.negativeFlip = negative.length;
			} else {
				negative.push(point);
				if (last === 1) this.positiveFlip = positive.length;
			}
			last = sign;
		}
		return this;
	}
	drawNegative() {
		drawGreatCircleRoute(this.negative, this.negativeFlip);
		return this;
	}
	drawPositive() {
		drawGreatCircleRoute(this.positive, this.positiveFlip);
		return this;
	}
}

const updateProjection = () => {
	projection.set([
		viewRadius, 0, 0,
		0, -viewRadius, 0,
		0, 0, 1,
		cx, cy, 0,
	]);
	global.apply(projection, projection);
};

const handleCanvasResize = () => {
	cx = canvas.width*0.5;
	cy = canvas.height*0.5;
};

const clear = () => {
	ctx.fillStyle = colorMap.background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const forEachCircle = (fn) => {
	for (let i=0; i<gridSmallCircles.length; ++i) {
		fn(gridSmallCircles[i]);
	}
	for (let i=0; i<userSmallCircles.length; ++i) {
		fn(userSmallCircles[i]);
	}
};

const forEachLine = (fn) => {
	for (let i=0; i<gridLines.length; ++i) {
		fn(gridLines[i]);
	}
	for (let i=0; i<userLines.length; ++i) {
		fn(userLines[i]);
	}
};

const forEachPoint = (fn) => {
	for (let i=0; i<gridPoints.length; ++i) {
		fn(gridPoints[i]);
	}
	for (let i=0; i<userPoints.length; ++i) {
		fn(userPoints[i]);
	}
};

const updateViews = () => {
	forEachCircle((circle) => circle.updateView());
	forEachLine(line => line.updateView());
	forEachPoint(point => point.updateView());
};

const drawNevagives = () => {
	forEachCircle((circle) => {
		ctx.strokeStyle = circle.color;
		circle.drawNegative();
	});
	forEachLine(line => {
		ctx.strokeStyle = line.color;
		line.drawNegative();
	});
	forEachPoint(point => {
		ctx.strokeStyle = point.color;
		point.drawNegative();
	});
};

const drawPositives = () => {
	forEachCircle((circle) => {
		ctx.strokeStyle = circle.color;
		circle.drawPositive();
	});
	forEachLine(line => {
		ctx.strokeStyle = line.color;
		line.drawPositive();
	});
	forEachPoint(point => {
		ctx.strokeStyle = point.color;
		point.drawPositive();
	});
};

const drawCrossHair = () => {
	const size = 10;
	ctx.strokeStyle = colorMap.crossHair;
	ctx.lineWidth = crossHairLineWidth;
	ctx.beginPath();
	ctx.moveTo(cx - size, cy);
	ctx.lineTo(cx + size, cy);
	ctx.moveTo(cx, cy - size);
	ctx.lineTo(cx, cy + size);
	ctx.stroke();
};

const drawBase = () => {
	ctx.fillStyle = colorMap.surface;
	ctx.strokeStyle = colorMap.border;
	ctx.beginPath();
	ctx.arc(cx, cy, viewRadius, 0, Math.PI*2);
	ctx.fill();
	ctx.stroke();
};

const render = () => {
	updateProjection();
	updateViews();
	clear();
	ctx.lineWidth = lineWidth;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	drawNevagives();
	drawBase();
	drawPositives();
	drawCrossHair();
};

const buildGrid = () => {
	gridSmallCircles.length = 0;
	gridLines.length = 0;
	gridPoints.length = 0;
	for (let i=1; i<nDivisions; ++i) {
		const angle = Math.PI/2 + Math.PI/nDivisions*i;
		gridSmallCircles.push(new SmallCircle(0, angle, Math.PI*0.5, colorMap.longitudeLines));
	}
	gridLines.push(new Line(0, 0, Math.PI/2, 0, colorMap.greenwich));
	gridLines.push(new Line(0, 0, -Math.PI/2, 0, colorMap.greenwich));
	gridLines.push(new Line(0, Math.PI, Math.PI/2, 0, colorMap.longitudeLines));
	gridLines.push(new Line(0, Math.PI, -Math.PI/2, 0, colorMap.longitudeLines));
	for (let i=1; i<nDivisions; ++i) {
		const t = i/nDivisions;
		const color = t === 0.5 ? colorMap.equator : colorMap.latitudeLines;
		const angle = Math.PI*t;
		gridSmallCircles.push(new SmallCircle(Math.PI*0.5, 0, angle, color));
	}
	gridPoints.push(new Point(Math.PI/2, 0, colorMap.northPole));
	gridPoints.push(new Point(-Math.PI/2, 0, colorMap.southPole));
};

let touchStartData = null;
const handleTouchStart = (x, y) => {
	touchStartData = {
		pos: [ x, y ],
		global: new Transform().set(global),
	};
};

const callObserverUpdateHandlers = () => {
	const [ lat, lon, azm ] = getObserver();
	observerUpdateHandlers.forEach(handler => handler(lat, lon, azm));
};

const handleDrag = (x, y) => {
	const [ ax, ay ] = touchStartData.pos;
	const [ bx, by ] = [ x, y ];
	if (ax === bx && ay === by) {
		global.set(touchStartData.global);
		render();
		callObserverUpdateHandlers();
		return;
	}
	const radianPerPx = 1/viewRadius;
	const dx = bx - ax;
	const dy = by - ay;
	const len = Math.sqrt(dx*dx + dy*dy);
	const nx = dx/len;
	const ny = dy/len;
	const angle = ny <= 0 ? Math.acos(nx) : - Math.acos(nx);
	const rot = len*radianPerPx;
	global.set(touchStartData.global).rotateZ(angle).rotateY(-rot).rotateZ(-angle);
	render();
	callObserverUpdateHandlers();
};

const handleTouchEnd = (x, y) => {
	touchStartData = null;
};

const bindCanvas = () => {
	canvas.addEventListener?.('mousedown', e => {
		if (e.ctrlKey || e.shiftKey || e.altKey) return;
		if (e.button !== LEFT_BUTTON) return;
		const x = e.offsetX;
		const y = e.offsetY;
		handleTouchStart(x, y);
	});
	canvas.addEventListener?.('mousemove', e => {
		if (touchStartData === null) return;
		const x = e.offsetX;
		const y = e.offsetY;
		if (!(e.buttons & LEFT_BUTTON_MASK)) {
			handleTouchEnd(x, y);
			return;
		}
		handleDrag(x, y);
	});
	canvas.addEventListener?.('mouseup', e => {
		if (e.button !== LEFT_BUTTON) return;
		if (touchStartData === null) return;
		const x = e.offsetX;
		const y = e.offsetY;
		handleTouchEnd(x, y);
	});
	canvas.addEventListener?.('touchstart', e => {
		const bcr = e.target.getBoundingClientRect();
		const x = e.targetTouches[0].clientX - bcr.x;
		const y = e.targetTouches[0].clientY - bcr.y;
		e.preventDefault();
		e.stopPropagation();
		handleTouchStart(x, y);
	});
	canvas.addEventListener?.('touchmove', e => {
		const bcr = e.target.getBoundingClientRect();
		const x = e.targetTouches[0].clientX - bcr.x;
		const y = e.targetTouches[0].clientY - bcr.y;
		e.preventDefault();
		e.stopPropagation();
		handleDrag(x, y);
	});
	canvas.addEventListener?.('wheel', e => {
		const { deltaY } = e;
		if (!deltaY) return;
		viewRadius = Math.exp(Math.log(viewRadius) - deltaY/Math.abs(deltaY)*0.2);
		render();
	});
};

export const setCavnas = (dom) => {
	canvas = dom;
	ctx = dom.getContext('2d');
	bindCanvas();
	handleCanvasResize();
};

export const resize = (width, height) => {
	canvas.width = width;
	canvas.height = height;
	handleCanvasResize();
};

export const addSmallCircle = (lat, lon, rad, color = colorMap.smallCircle) => {
	const circle = new SmallCircle(lat, lon, rad, color);
	userSmallCircles.push(circle);
	return circle;
};

export const addPoint = (lat, lon, color = colorMap.point) => {
	const point = new Point(lat, lon, color);
	userPoints.push(point);
	return point;
};

export const addLine = (lat1, lon1, lat2, lon2, color = colorMap.line) => {
	const line = new Line(lat1, lon1, lat2, lon2, color);
	userLines.push(line);
	return line;
};

export const getObserver = () => {
	const [ ry, rx, rz ] = global.calcYXZRotation();
	const lat = rx > Math.PI ? Math.PI*2 - rx : - rx;
	const lon = ry > Math.PI ? ry - Math.PI*2 : ry;
	const azm = rz > 0 ? Math.PI*2 - rz : 0;
	return [ lat, lon, azm ];
}

export const setObserver = (lat, lon, azm) => {
	global.clear().rotateY(lon).rotateX(-lat).rotateZ(-azm);
};

export const update = () => {
	render();
};

export const onObserverUpdate = (handler) => {
	observerUpdateHandlers.push(handler);
};

export const removeSmallCircle = (circle) => {
	const index = userSmallCircles.indexOf(circle);
	userSmallCircles.splice(index, 1);
};

export const removePoint = (point) => {
	const index = userPoints.indexOf(point);
	userPoints.splice(index, 1);
};

export const removeLine = (line) => {
	const index = userLines.indexOf(line);
	userLines.splice(index, 1);
};

export const getNVertices = () => nVertices;
export const setNVertices = (n) => {
	nVertices = n;
	forEachCircle(circle => circle.buildVertices());
};

export const getNDivisions = () => nDivisions;
export const setNDivisions = (n) => {
	nDivisions = n;
	buildGrid();
};

export const setColor = ({
	background,
	latitudeLines,
	longitudeLines,
	greenwich,
	equator,
	border,
	surface,
	smallCircle,
	line,
	point,
	northPole,
	southPole,
	crossHair,
}) => {
	if (background != null) colorMap.background = background;
	if (latitudeLines != null) colorMap.latitudeLines = latitudeLines;
	if (longitudeLines != null) colorMap.longitudeLines = longitudeLines;
	if (greenwich != null) colorMap.greenwich = greenwich;
	if (equator != null) colorMap.equator = equator;
	if (border != null) colorMap.border = border;
	if (surface != null) colorMap.surface = surface;
	if (smallCircle != null) colorMap.smallCircle = smallCircle;
	if (crossHair != null) colorMap.crossHair = crossHair;
	if (line != null) colorMap.line = line;
	if (point != null) colorMap.point = point;
	if (northPole != null) colorMap.northPole = northPole;
	if (southPole != null) colorMap.southPole = southPole;
};

export const setViewRadius = (radius) => {
	viewRadius = radius;
};

export const reset = () => {
	userPoints.length = 0;
	userLines.length = 0;
	userSmallCircles.length = 0;
};

buildGrid();
