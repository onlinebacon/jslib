import { Vec3 } from './l-algebra-3.js';
import {
	coordToNormalVec3,
	Vec3ToCoordNormal,
} from './sphere-math.js';

const aVec = Vec3();
const bVec = Vec3();
const mVec = Vec3();

export const findIntersection = (a, b) => {
	vec3ToCoordNormal(a, aVec);
};
