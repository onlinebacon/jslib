import {
	calcAzimuth,
	calcDist,
} from './sphere-math.js';

import {
	get2CircleIntersections,
} from './sphere-trilateration.js';

const TO_RAD = Math.PI/180;
const coord = (...args) => args.map(v=>v*TO_RAD);
const dist = (angle) => angle*TO_RAD;

const a = coord(-25.5, -54.5);
const b = coord(-3.1, -60.0);

const res = get2CircleIntersections(
	coord(26.0478, -50.9717),
	dist(51.6192),
	coord(7.4111, 164.7393),
	dist(59.0633),
);

console.log(res.map(ans=>ans.map(v=>(v/TO_RAD).toFixed(5))).join('\n'));