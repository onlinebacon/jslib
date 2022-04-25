import { Vec3, Mat3 } from './l-algebra-3.js';
import {
	arclenToChord,
	normalVec3ToCoord,
	coordToNormalVec3,
	calcDist,
	calcAzimuth,
	coordAzDistToPoint,
} from './sphere-math.js';
import {
	sphereSearch,
	SphereSearcher,
} from './sphere-search.js';

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

const calcErrorFunction = (points) => (coord) => {
	let sum = 0;
	for (let point of points) {
		const dist = point[2];
		const dif = dist - calcDist(coord, point);
		sum += dif*dif;
	}
	return sum;
};

const getFocusPoints = (a, b) => {
	if (a[2] < b[2]) [ a, b ] = [ b, a ];
	const [ aLat, aLon, aRadius ] = a;
	const [ bLat, bLon, bRadius ] = b;
	const aCenter = [ aLat, aLon ];
	const bCenter = [ bLat, bLon ];
	const d = calcDist(aCenter, bCenter);
	if (aRadius + bRadius <= d) {
		const dist = aRadius + (d - aRadius - bRadius)*0.5;
		const azimuth = calcAzimuth(aCenter, bCenter);
		const coord = coordAzDistToPoint(aCenter, azimuth, dist);
		return [ coord ];
	}
	if (d + bRadius <= aRadius) {
		const dist = d + bRadius + (aRadius - bRadius - d)*0.5;
		const azimuth = calcAzimuth(aCenter, bCenter);
		const coord = coordAzDistToPoint(aCenter, azimuth, dist);
		return [ coord ];
	}
	return get2CirclesIntersections(aCenter, aRadius, bCenter, bRadius);
};

export const trilaterate = (points) => {
	if (points.length === 2) {
		const [ a, b ] = points;
		if (circlesIntersect(a, a[2], b, b[2])) {
			return get2CirclesIntersections(a, a[2], b, b[2]);
		}
	}
	const calcError = calcErrorFunction(points);
	const focus = [];
	for (let j=1; j<points.length; ++j) {
		const b = points[j];
		for (let i=0; i<j; ++i) {
			const a = points[i];
			focus.push(...getFocusPoints(a, b));
		}
	}
	let searchers = focus.map(coord => {
		let distance;
		for (let other of focus) {
			if (other === coord) continue;
			const dist = calcDist(coord, other);
			if (distance === undefined || dist < distance) distance = dist;
		}
		if (distance !== undefined) distance /= 3;
		return new SphereSearcher({ calcError, coord, distance });
	});
	if (searchers.length === 0) searchers = undefined;
	return sphereSearch({
		calcError,
		searchers,
		nResults: focus.length === 2 ? 2 : 1,
	});
};
