import { Vec3 } from './l-algebra-3.js';
import { normalVec3ToCoord, coordAzDistToPoint, calcDist } from './sphere-math.js';

const N_NEIGHBORS = 5;
const STEP = Math.PI*2/N_NEIGHBORS;
const arrayRemove = (array, item) => {
	const index = array.indexOf(item);
	if (index !== -1) array.splice(index, 1);
};

const defDist = calcDist(
	normalVec3ToCoord(Vec3(1, 1, 1).normal()),
	normalVec3ToCoord(Vec3(1, 1, -1).normal()),
)/4;

export class SphereSearcher {
	constructor({ calcError, coord, distance = defDist }) {
		this.coord = coord;
		this.error = calcError(coord);
		this.distance = distance;
		this.calcError = calcError;
	}
	iterate() {
		const { calcError, distance } = this;
		let { coord, error } = this;
		let changed = false;
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
			this.distance = distance*1.2;
		} else {
			this.distance = distance*0.5;
		}
		return this;
	}
}

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
		const searcher = new SphereSearcher({ coord, distance: defDist, calcError });
		array.push(searcher);
	}
	return array;
};

const combineSearchers = (searchers, groupDistance) => {
	let pairs = [];
	for (let j=1; j<searchers.length; ++j) {
		const b = searchers[j];
		for (let i=0; i<j; ++i) {
			const a = searchers[i];
			const dist = calcDist(a.coord, b.coord);
			pairs.push({ a, b, dist });
		}
	}
	pairs.sort((a, b) => a.dist - b.dist);
	while (pairs.length) {
		const [{ a, b, dist }] = pairs;
		if (dist >= groupDistance) break;
		const removed = a.error > b.error ? a : b;
		arrayRemove(searchers, removed);
		pairs = pairs.filter(pair => pair.a !== removed && pair.b !== removed);
	}
};

export const sphereSearch = ({
	calcError,
	precision = 1e-6,
	groupDistance = precision*10,
	maxIterations = 100,
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
	combineSearchers(searchers, groupDistance);
	searchers.sort((a, b) => a.error - b.error);
	return searchers.slice(0, nResults).map(searcher => searcher.coord);
};
