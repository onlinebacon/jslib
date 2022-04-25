import { Mat3, Vec3 } from './l-algebra-3.js';

const { PI, sin, cos, asin, acos, sqrt } = Math;
const sin2 = angle => {
	const ans = sin(angle);
	return ans*ans;
};
const TAU = PI*2;

const d90 = PI*0.5;
const d180 = PI*1;
const d360 = PI*2;

const auxVec = Vec3();
const auxVecA = Vec3();
const auxVecB = Vec3();

const auxMat = Mat3();

export const haversine = (aLat, aLon, bLat, bLon) => {
	const dLat = bLat - aLat;
	const dLon = bLon - aLon;
	return 2*asin(sqrt(sin2(dLat*0.5) + cos(aLat)*cos(bLat)*sin2(dLon*0.5)));
};

export const chordToArclen = (chord) => {
	return asin(chord*0.5)*2;
};

export const arclenToChord = (arclen) => {
	return sin(arclen*0.5)*2;
};

export const coordToNormalVec3 = ([ lat, lon ], dst = Vec3()) => {
	return dst.set(0, 0, 1).rotateXY(-lat, lon);
};

export const normalVec3ToCoord = ([ x, y, z ]) => {
	const lat = asin(y);
	const len = Math.sqrt(x*x + z*z);
	if (len === 0) return [ lat, 0 ];
	return [ lat, x >= 0 ? acos(z/len) : - acos(z/len) ];
};

export const calcDist = ([ aLat, aLon ], [ bLat, bLon ]) => haversine(aLat, aLon, bLat, bLon);

export const coordAzDistToVec3 = ([ lat, lon ], azimuth, distance, dst = Vec3()) => {
	dst.set(0, 0, 1);
	dst.rotateXZ(-distance, -azimuth);
	dst.rotateXY(-lat, lon);
	return dst;
};

export const coordAzDistToPoint = (coord, azimuth, distance) => {
	coordAzDistToVec3(coord, azimuth, distance, auxVec);
	return normalVec3ToCoord(auxVec);
};

export const azFromCoordToVec3 = ([ lat, lon ], vec) => {
	const [ x, y, z ] = auxVec.set(vec).rotateYX(-lon, lat);
	const len = sqrt(x*x + y*y);
	return x >= 0 ? acos(y/len) : d360 - acos(y/len);
};

export const calcAzimuth = (a, b) => {
	return azFromCoordToVec3(a, coordToNormalVec3(b, auxVec));
};
