import { Mat3, Vec3 } from './l-algebra-3.js';

const { PI, sin, cos, asin, acos, sqrt } = Math;
const TAU = PI*2;

const d90 = PI*0.5;
const d180 = PI*1;
const d360 = PI*2;

const auxVec = Vec3();
const auxVecA = Vec3();
const auxVecB = Vec3();

const auxMat = Mat3();

export const chordToArclen = (chord) => {
	return asin(chord*0.5)*2;
};

export const coordToNormalVec3 = ([ lat, lon ], dst = Vec3()) => {
	return dst.set(0, 0, 1)
		.rotateX(-lat)
		.rotateY(lon);
};

export const normalVec3ToCoord = ([ x, y, z ]) => {
	const lat = asin(y);
	const len = Math.sqrt(x*x + z*z);
	if (len === 0) return [ lat, 0 ];
	return [ lat, x >= 0 ? acos(z/len) : - acos(z/len) ];
};

export const calcDist = (a, b) => {
	latLonToNormal(a, auxVecA);
	latLonToNormal(b, auxVecB);
	const chord = auxVecA.sub(auxVecB).len();
	return chordToArclen(chord);
};

export const coordAzDistToVec3 = ([ lat, lon ], azimuth, distance, dst = Vec3()) => {
	dst.set(0, 0, 1);
	dst.rotateX(-distance);
	dst.rotateZ(-azimuth);
	dst.rotateX(-lat);
	dst.rotateY(lon);
	return dst;
};

export const coordAzDistToPoint = (coord, azimuth, distance) => {
	coordAzDistToVec3(coord, azimuth, distance, auxVec);
	return normalVec3ToCoord(auxVec);
};
