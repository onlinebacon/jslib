import { Vec3, Mat3 } from './l-algebra-3.js';
import {
	arclenToChord,
	normalVec3ToCoord,
	coordToNormalVec3,
	calcDist,
} from './sphere-math.js';

const { cos, sin, PI, acos, sqrt } = Math;
const TAU = PI*2;

const mat = Mat3();
const vec = Vec3();
const aVec = Vec3();
const bVec = Vec3();

const calcXYAzimuth = (x, y) => {
	const rad = sqrt(x*x + y*y);
	if (rad === 0) return 0;
	const ny = y/rad;
	return x >= 0 ? acos(ny) : TAU - acos(ny);
};

export const get2CirclesIntersections = (
	aCenter, aRadius,
	bCenter, bRadius,
) => {
	coordToNormalVec3(bCenter, bVec);
	const [ lat, lon ] = aCenter;
	bVec.rotateYX(-lon, lat);
	const azimuth = calcXYAzimuth(bVec.x, bVec.y);
	bVec.rotateZ(azimuth);
	const a = -bVec.y/bVec.z;
	bVec.scale(cos(bRadius), vec);
	const z = cos(aRadius);
	const b = vec.z - vec.y*a;
	const y = (z - b)/a;
	const r = sin(aRadius);
	const x = sqrt(r*r - y*y);
	mat.rotationZXY(-azimuth, -lat, lon);
	aVec.set(x, y, z).apply(mat);
	bVec.set(-x, y, z).apply(mat);
	return [
		normalVec3ToCoord(aVec),
		normalVec3ToCoord(bVec),
	];
};

export const circlesIntersect = (
	aCenter, aRadius,
	bCenter, bRadius
) => {
	const d = calcDist(aCenter, bCenter);
	const r1 = Math.min(aRadius, bRadius);
	const r2 = Math.max(aRadius, bRadius);
	if (r1 + r2 <= d) return false;
	if (d + r1 <= r2) return false;
	return true;
};
