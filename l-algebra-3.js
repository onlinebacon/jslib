const mulMatMat = (a, b, dst) => {
	const [ aix, aiy, aiz, ajx, ajy, ajz, akx, aky, akz ] = a;
	const [ bix, biy, biz, bjx, bjy, bjz, bkx, bky, bkz ] = b;
	dst[0] = aix*bix + aiy*bjx + aiz*bkx;
	dst[1] = aix*biy + aiy*bjy + aiz*bky;
	dst[2] = aix*biz + aiy*bjz + aiz*bkz;
	dst[3] = ajx*bix + ajy*bjx + ajz*bkx;
	dst[4] = ajx*biy + ajy*bjy + ajz*bky;
	dst[5] = ajx*biz + ajy*bjz + ajz*bkz;
	dst[6] = akx*bix + aky*bjx + akz*bkx;
	dst[7] = akx*biy + aky*bjy + akz*bky;
	dst[8] = akx*biz + aky*bjz + akz*bkz;
};

const xRotationMat = (angle, dst) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	dst[0] = 1;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = cos;
	dst[5] = sin;
	dst[6] = 0;
	dst[7] = -sin;
	dst[8] = cos;
};

const yRotationMat = (angle, dst) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	dst[0] = cos;
	dst[1] = 0;
	dst[2] = -sin;
	dst[3] = 0;
	dst[4] = 1;
	dst[5] = 0;
	dst[6] = sin;
	dst[7] = 0;
	dst[8] = cos;
};

const zRotationMat = (angle, dst) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	dst[0] = cos;
	dst[1] = sin;
	dst[2] = 0;
	dst[3] = -sin;
	dst[4] = cos;
	dst[5] = 0;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = 1;
};

const mulVecMat = (v, m, dst) => {
	const [ x, y, z ] = v;
	const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = m;
	dst[0] = x*ix + y*jx + z*kx;
	dst[1] = x*iy + y*jy + z*ky;
	dst[2] = x*iz + y*jz + z*kz;
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
	apply(mat, dst = this) {
		mulMatMat(this, mat, dst);
		return dst;
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
	rotateX(angle, dst = this) {
		xRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
	}
	rotateY(angle, dst = this) {
		yRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
	}
	rotateZ(angle, dst = this) {
		zRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
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
		if (x instanceof Vector3) {
			[ x, y, z ] = x;
		}
		this[0] = x;
		this[1] = y;
		this[2] = z;
		return this;
	}
	apply(mat, dst = this) {
		mulVecMat(this, mat, dst);
		return dst;
	}
	rotateX(angle, dst = this) {
		xRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
	}
	rotateY(angle, dst = this) {
		yRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
	}
	rotateZ(angle, dst = this) {
		zRotationMat(angle, auxMat);
		this.apply(auxMat, dst);
		return dst;
	}
	sub(vec, dst = this) {
		dst[0] = this[0] - vec[0];
		dst[1] = this[1] - vec[1];
		dst[2] = this[2] - vec[2];
		return dst;
	}
	add(vec, dst = this) {
		dst[0] = this[0] + vec[0];
		dst[1] = this[1] + vec[1];
		dst[2] = this[2] + vec[2];
		return dst;
	}
	scale(scalar, dst = this) {
		dst[0] = this[0]*scalar;
		dst[1] = this[1]*scalar;
		dst[2] = this[2]*scalar;
		return dst;
	}
	normal(dst = this) {
		const scale = 1/this.len();
		dst[0] = this[0]*scale;
		dst[1] = this[1]*scale;
		dst[2] = this[2]*scale;
		return dst;
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
