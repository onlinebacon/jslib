import { Vec3 } from './l-algebra-3.js';
import { coordToNormalVec3, normalVec3ToCoord } from './sphere-math.js';

const trilaterate = ({ points, nIterations = 50 }) => {
	const refs = points.map(point => {
		const { lat, lon, distance } = point;
		const vec = coordToNormalVec3([ lat, lon ]);
		const chord = Math.sin(distance/2)*2;
		return { vec, distance: chord };
	});
	const calcError = (vec) => {
		let sum = 0;
		for (const ref of refs) {
			const dif = ref.distance - vec.distTo(ref.vec);
			sum += dif*dif;
		}
		return sum;
	};
	const clusters = new Array(8);
	for (let i=0; i<8; ++i) {
		const x = 1 - ((i >> 0)&1)*2;
		const y = 1 - ((i >> 1)&1)*2;
		const z = 1 - ((i >> 2)&1)*2;
		const vec = Vec3(x, y, z).normal();
		const error = calcError(vec);
		clusters[i] = { vec, error };
	}
	let range = 0.5;
	const indexOfClosestCluster = (vec) => {
		let index = 0;
		let minDist = vec.distTo(clusters[0].vec);
		for (let i=1; i<8; ++i) {
			const cluster = clusters[i];
			const dist = vec.distTo(cluster.vec);
			if (dist < minDist) {
				index = i;
				minDist = dist;
			}
		}
		return index;
	};
	const testNewPoint = (vec) => {
		const index = indexOfClosestCluster(vec);
		const cluster = clusters[index];
		const error = calcError(vec);
		if (error < cluster.error) {
			cluster.error = error;
			cluster.vec = vec;
		}
	};
	const visit = ([ x, y, z ]) => {
		for (let i=0; i<8; ++i) {
			const vec = Vec3(
				x + (1 - ((i >> 0)&1)*2)*range,
				y + (1 - ((i >> 1)&1)*2)*range,
				z + (1 - ((i >> 2)&1)*2)*range,
			);
			vec.normal();
			testNewPoint(vec);
		}
	};
	const iterate = () => {
		for (const cluster of clusters) {
			visit(cluster.vec);
		}
		range *= 0.7;
	};
	const collapseClosest = () => {
		let minDist = Infinity;
		let pair = null;
		for (let j=1; j<clusters.length; ++j) {
			const b = clusters[j];
			for (let i=0; i<j; ++i) {
				const a = clusters[i];
				const dist = a.vec.distTo(b.vec);
				if (dist < minDist) {
					minDist = dist;
					pair = [ i, j ];
				}
			}
		}
		const [ i, j ] = pair;
		const a = clusters[i];
		const b = clusters[j];
		const index = a.error < b.error ? j : i;
		clusters.splice(index, 1);
	};
	for (let i=0; i<nIterations; ++i) {
		iterate();
	}
	clusters.sort((a, b) => a.error - b.error);
	if (refs.length === 2) {
		while (clusters.length !== 2) {
			collapseClosest();
		}
	} else {
		clusters.splice(1, clusters.length - 1);
	}
	return clusters.map(cluster => normalVec3ToCoord(cluster.vec));
};

export default trilaterate;
