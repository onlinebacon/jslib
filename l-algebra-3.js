const mulMatMat = (a, b, r) => {
	const [ aix, aiy, aiz, ajx, ajy, ajz, akx, aky, akz ] = a;
	const [ bix, biy, biz, bjx, bjy, bjz, bkx, bky, bkz ] = b;
	r[0] = aix*bix + aiy*bjx + aiz*bkx;
	r[1] = aix*biy + aiy*bjy + aiz*bky;
	r[2] = aix*biz + aiy*bjz + aiz*bkz;
	r[3] = ajx*bix + ajy*bjx + ajz*bkx;
	r[4] = ajx*biy + ajy*bjy + ajz*bky;
	r[5] = ajx*biz + ajy*bjz + ajz*bkz;
	r[6] = akx*bix + aky*bjx + akz*bkx;
	r[7] = akx*biy + aky*bjy + akz*bky;
	r[8] = akx*biz + aky*bjz + akz*bkz;
};

const xRotationMat = (angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	r[0] = 1;
	r[1] = 0;
	r[2] = 0;
	r[3] = 0;
	r[4] = cos;
	r[5] = sin;
	r[6] = 0;
	r[7] = -sin;
	r[8] = cos;
};

const yRotationMat = (angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	r[0] = cos;
	r[1] = 0;
	r[2] = -sin;
	r[3] = 0;
	r[4] = 1;
	r[5] = 0;
	r[6] = sin;
	r[7] = 0;
	r[8] = cos;
};

const zRotationMat = (angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	r[0] = cos;
	r[1] = sin;
	r[2] = 0;
	r[3] = -sin;
	r[4] = cos;
	r[5] = 0;
	r[6] = 0;
	r[7] = 0;
	r[8] = 1;
};

const mulVecMat = (v, m, r) => {
	const [ x, y, z ] = v;
	const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = m;
	r[0] = x*ix + y*jx + z*kx;
	r[1] = x*iy + y*jy + z*ky;
	r[2] = x*iz + y*jz + z*kz;
};

class Matrix3 extends Array {
	constructor() {
		super(9);
		this.clear();
	}
	clear() {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 1;
		this[5] = 0;
		this[6] = 0;
		this[7] = 0;
		this[8] = 1;
		return this;
	}
	apply(mat, r = this) {
		mulMatMat(this, mat, r);
		return r;
	}
	rotationX(angle) {
		xRotationMat(angle, this);
		return this;
	}
	rotationY(angle) {
		yRotationMat(angle, this);
		return this;
	}
	rotationZ(angle) {
		zRotationMat(angle, this);
		return this;
	}
	rotateX(angle, r = this) {
		xRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return r;
	}
	rotateY(angle, r = this) {
		yRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return r;
	}
	rotateZ(angle, r = this) {
		zRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return r;
	}
}

class Vector3 extends Array {
	constructor(x = 0, y = 0, z = 0) {
		super(3);
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}
	set(x, y, z) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		return this;
	}
	apply(mat, r = this) {
		mulVecMat(this, mat, r);
		return r;
	}
	rotateX(angle, r = this) {
		xRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return this;
	}
	rotateY(angle, r = this) {
		yRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return this;
	}
	rotateZ(angle, r = this) {
		zRotationMat(angle, auxMat);
		this.apply(auxMat, r);
		return this;
	}
	sub(vec, r = this) {
		r[0] = this[0] - vec[0];
		r[1] = this[1] - vec[1];
		r[2] = this[2] - vec[2];
		return r;
	}
	normal(r = this) {
		const scale = 1/this.len();
		r[0] = this[0]*scale;
		r[1] = this[1]*scale;
		r[2] = this[2]*scale;
		return r;
	}
	distTo(vec) {
		this.sub(vec, auxVec);
		return auxVec.len();
	}
	len() {
		const [ x, y, z ] = this;
		return Math.sqrt(x*x + y*y + z*z);
	}
	clone() {
		const [ x, y, z ] = this;
		return new Vector3(x, y, z);
	}
}

const auxMat = new Matrix3();
const auxVec = new Vector3();

export const Mat3 = () => new Matrix3();
export const Vec3 = (...args) => new Vector3(...args);
