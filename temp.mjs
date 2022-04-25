import { Vec3, Mat3 } from './l-algebra-3.mjs';

const hasSumReg = /.[+\-]/;
const mul = (a, b) => {
	if (a == 0) return 0;
	if (b == 0) return 0;
	if (a == 1) return b;
	if (b == 1) return a;
	if (hasSumReg.test(a)) a = `(${a})`;
	if (hasSumReg.test(b)) b = `(${b})`;
	return `${a}*${b}`;
};
const add = (a, b) => {
	if (a == 0) return b;
	if (b == 0) return a;
	return `${a} + ${b}`;
};
const mat = [ 'ix', 'iy', 'iz', 'jx', 'jy', 'jz', 'kx', 'ky', 'kz' ];
const vec = [ 'x', 'y', 'z', 0, 0, 0, 0, 0, 0 ];
const rot_x = [ 1, 0, 0, 0, 'cos_x', 'sin_x', 0, '-sin_x', 'cos_x' ];
const rot_y = [ 'cos_y', 0, '-sin_y', 0, 1, 0, 'sin_y', 0, 'cos_y' ];
const rot_z = [ 'cos_z', 'sin_z', 0, '-sin_z', 'cos_z', 0, 0, 0, 1 ];
const mulMat3Mat3 = (a, b) => {
	let r = [];
	for (let i=0; i<3; ++i) {
		for (let j=0; j<3; ++j) {
			let sum = 0;
			for (let k=0; k<3; ++k) {
				sum = add(sum, mul(a[i*3 + k], b[k*3 + j]));
			}
			r[i*3 + j] = sum;
		}
	}
	return r;
};
const test = (mat, zAngle, xAngle, yAngle) => {
		const dst = mat;
		const cos_z = Math.cos(zAngle);
		const sin_z = Math.sin(zAngle);
		const cos_x = Math.cos(xAngle);
		const sin_x = Math.sin(xAngle);
		const cos_y = Math.cos(yAngle);
		const sin_y = Math.sin(yAngle);
		dst[0] = cos_z*cos_y + sin_z*sin_x*sin_y;
		dst[1] = sin_z*cos_x;
		dst[2] = sin_z*sin_x*cos_y - cos_z*sin_y;
		dst[3] = cos_z*sin_x*sin_y - sin_z*cos_y;
		dst[4] = cos_z*cos_x;
		dst[5] = sin_z*sin_y + cos_z*sin_x*cos_y;
		dst[6] = cos_x*sin_y;
		dst[7] = -sin_x;
		dst[8] = cos_x*cos_y;
		return dst;
};

// console.log(mulMat3Mat3(mulMat3Mat3(rot_z, rot_x), rot_y).join('\n')); /*

const a = Mat3();
a.forEach((_,i,m) => m[i] = Math.random());
const b = a.clone();
const zAngle = Math.random()*Math.PI*2;
const xAngle = Math.random()*Math.PI*2;
const yAngle = Math.random()*Math.PI*2;
a.rotationZXY(zAngle, xAngle, yAngle);
test(b, zAngle, xAngle, yAngle);
console.log(a.join(', '));
console.log(b.join(', '));
const hash = m => m.map(v=>v.toFixed(8)).join(',');
console.log('Match: ' + (hash(a) === hash(b)));

// */