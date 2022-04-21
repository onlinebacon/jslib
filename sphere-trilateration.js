import { Vec3 } from './l-algebra-3.js';
import {
	arclenToChord,
	normalVec3ToCoord,
	coordToNormalVec3,
} from './sphere-math.js';

const { cos, sin, PI, acos } = Math;
const TAU = PI*2;

const vec = Vec3();
const aVec = Vec3();
const bVec = Vec3();

const calcXYAzimuth = (x, y) => {
	const rad = Math.sqrt(x*x + y*y);
	if (rad === 0) return 0;
	const ny = y/rad;
	return x >= 0 ? acos(ny) : TAU - acos(ny);
};

export const get2CirclesIntersections = (
	aCenter, aRadius,
	bCenter, bRadius,
	nSubdivisions = 15,
	nIterations = 15,
) => {
	const [ lat, lon ] = aCenter;
	coordToNormalVec3(bCenter, bVec).rotateYX(-lon, lat);
	const bDist = arclenToChord(bRadius);
	const z = cos(aRadius);
	const rad = sin(aRadius);
	let a = 0;
	let b = PI*2;
	let bestAngle = null;
	let bestError = Infinity;
	vec.set(0, rad, z);
	for (let it=0; it<nIterations; ++it) {
		const stride = (b - a)/nSubdivisions;
		for (let i=0; i<nSubdivisions; ++i) {
			const angle = a + stride*i;
			const x = sin(angle)*rad;
			const y = cos(angle)*rad;
			const dif = aVec.set(x, y, z).distTo(bVec) - bDist;
			const error = Math.abs(dif);
			if (error < bestError) {
				vec.set(aVec);
				bestAngle = angle;
				bestError = error;
			}
		}
		a = bestAngle - stride;
		b = bestAngle + stride;
	}
	const ans1 = normalVec3ToCoord(vec.rotateXY(-lat, lon));
	const azimuth = calcXYAzimuth(bVec[0], bVec[1]);
	const angle = azimuth - (bestAngle - azimuth);
	const x = sin(angle)*rad;
	const y = cos(angle)*rad;
	vec.set(x, y, z);
	const ans2 = normalVec3ToCoord(vec.rotateXY(-lat, lon));
	return [ ans1, ans2 ];
};
