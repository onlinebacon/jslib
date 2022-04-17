import { Vec3, Mat3 } from './l-algebra-3.js';

import {
	chordToArclen,
	coordToNormalVec3,
	normalVec3ToCoord,
	calcDist,
} from './sphere-math.js';

const coord = (lat, lon) => [ lat/180*Math.PI, lon/180*Math.PI ];
