import { Vec3 } from './l-algebra-3.js';
import { normalVec3ToCoord, coordAzDistToPoint, calcDist } from './sphere-math.js';

const N_NEIGHBORS = 5;
const STEP = Math.PI*2/N_NEIGHBORS;

export class SphereSearcher {
	constructor({ coord, distance, calcError }) {
		this.id = Symbol();
		this.coord = coord;
		this.error = calcError(coord);
		this.distance = distance;
		this.calcError = calcError;
	}
	iterate() {
		const { calcError } = this;
		let { coord, error, distance } = this;
		let changed = false;
		const [ lat, lon ] = coord;
		for (let i=0; i<N_NEIGHBORS; ++i) {
			const azimuth = STEP*i;
			const point = coordAzDistToPoint(coord, azimuth, distance);
			const e = calcError(point);
			if (e < error) {
				changed = true;
				error = e;
				coord = point;
			}
		}
		if (changed) {
			this.coord = coord;
			this.error = error;
			return false;
		}
		distance *= 0.5;
		this.distance = distance;
		return this;
	}
}

const distance = calcDist(
	normalVec3ToCoord(Vec3(1, 1, 1).normal()),
	normalVec3ToCoord(Vec3(1, 1, -1).normal()),
)/4;
const vec = Vec3();
const defaultSearchers = (calcError) => {
	const array = [];
	for (let i=0; i<8; ++i) {
		const xBit = i&1;
		const yBit = (i>>1)&1;
		const zBit = i>>2;
		const x = xBit*2 - 1;
		const y = yBit*2 - 1;
		const z = zBit*2 - 1;
		vec.set(x, y, z).normal();
		const coord = normalVec3ToCoord(vec);
		const searcher = new SphereSearcher({ coord, distance, calcError });
		array.push(searcher);
	}
	return array;
};

export const sphereSearch = ({
	calcError,
	precision = 1e-6,
	maxIterations = 50,
	searchers = defaultSearchers(calcError),
	nResults = 1,
}) => {
	for (let i=0; i<maxIterations; ++i) {
		let complete = true;
		for (let searcher of searchers) {
			if (searcher.distance >= precision) {
				searcher.iterate();
			}
			if (searcher.distance >= precision) {
				complete = false;
			}
		}
		if (complete) break;
	}
	searchers.sort((a, b) => a.error - b.error);
	return searchers.map(searcher => searcher.coord);
};
