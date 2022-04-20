// import trilaterate from './trilaterate-sphere.js';
import { azimuthAndDistanceToPoint } from './sphere-math.js';

const TO_RAD = Math.PI/180;
const TO_DEG = 180/Math.PI;
const coord = (...args) => args.map(v=>v*TO_RAD);

const coords = [];
for (let i=1; i<=360; ++i) {
	const res = azimuthAndDistanceToPoint(
		coord(-25.5, -54.5),
		i*TO_RAD,
		10*TO_RAD,
	).map(v=>v*TO_DEG);
	coords.push(res);
}

console.log(`coords = [[${coords.join('],\n[')}]]`);

// let args = [
// 	{
// 		"gp": [
// 			-1.0631469516777392,
// 			-1.8405047363718645
// 		],
// 		"arc": 1.1663949573238783
// 	},
// 	{
// 		"gp": [
// 			0.48820980094570826,
// 			2.5235437683133997
// 		],
// 		"arc": 1.0840464293852248
// 	}
// ];

// args = args.map(arg => {
// 	const { gp, arc } = arg;
// 	const [ lat, lon ] = gp;
// 	return { lat, lon, distance: arc };
// });

// const res = trilaterate({ points: args })
// 	.map(coord => coord.map(val => val*180/Math.PI));

// res.sort((a, b) => a[0] - b[0]).splice(1, 1);

// console.log(res.map(coord => coord.map(x => x.toFixed(5)).join(', ')).join('\n'));
