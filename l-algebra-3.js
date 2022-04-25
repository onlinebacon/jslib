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

const zxyRotationMat = (zAngle, xAngle, yAngle, dst) => {
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
	rotationZXY(zAngle, xAngle, yAngle) {
		zxyRotationMat(zAngle, xAngle, yAngle, this)
		return this;
	}
	rotateX(angle, dst = this) {
		const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = this;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		dst[0] = ix;
		dst[1] = iy*cos - iz*sin;
		dst[2] = iy*sin + iz*cos;
		dst[3] = jx;
		dst[4] = jy*cos - jz*sin;
		dst[5] = jy*sin + jz*cos;
		dst[6] = kx;
		dst[7] = ky*cos - kz*sin;
		dst[8] = ky*sin + kz*cos;
		return dst;
	}
	rotateY(angle, dst = this) {
		const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = this;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		dst[0] = ix*cos + iz*sin;
		dst[1] = iy;
		dst[2] = iz*cos - ix*sin;
		dst[3] = jx*cos + jz*sin;
		dst[4] = jy;
		dst[5] = jz*cos - jx*sin;
		dst[6] = kx*cos + kz*sin;
		dst[7] = ky;
		dst[8] = kz*cos - kx*sin;
		return dst;
	}
	rotateZ(angle, dst = this) {
		const [ ix, iy, iz, jx, jy, jz, kx, ky, kz ] = this;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		dst[0] = ix*cos - iy*sin;
		dst[1] = ix*sin + iy*cos;
		dst[2] = iz;
		dst[3] = jx*cos - jy*sin;
		dst[4] = jx*sin + jy*cos;
		dst[5] = jz;
		dst[6] = kx*cos - ky*sin;
		dst[7] = kx*sin + ky*cos;
		dst[8] = kz;
		return dst;
	}
	clone() {
		const clone = new Matrix3();
		clone[0] = this[0];
		clone[1] = this[1];
		clone[2] = this[2];
		clone[3] = this[3];
		clone[4] = this[4];
		clone[5] = this[5];
		clone[6] = this[6];
		clone[7] = this[7];
		clone[8] = this[8];
		return clone;
	}
}

class Vector3 extends Array {
	constructor(x = 0, y = 0, z = 0) {
		super(3);
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}
	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }
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
		const [ x, y, z ] = this;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		dst[0] = x;
		dst[1] = y*cos - z*sin;
		dst[2] = y*sin + z*cos;
		return dst;
	}
	rotateY(angle, dst = this) {
		const [ x, y, z ] = this;
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		dst[0] = x*cos + z*sin;
		dst[1] = y;
		dst[2] = z*cos - x*sin;
		return dst;
	}
	rotateZ(angle, dst = this) {
		const [ x, y, z ] = this;
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		dst[0] = x*cos - y*sin;
		dst[1] = x*sin + y*cos;
		dst[2] = z;
		return dst;
	}
	rotateXY(xAngle, yAngle, dst = this) {
		const [ x, y, z ] = this;
		const cos_x = Math.cos(xAngle);
		const sin_x = Math.sin(xAngle);
		const cos_y = Math.cos(yAngle);
		const sin_y = Math.sin(yAngle);
		const a = y*sin_x + z*cos_x;
		dst[0] = x*cos_y + a*sin_y;
		dst[1] = y*cos_x - z*sin_x;
		dst[2] = a*cos_y - x*sin_y;
		return dst;
	}
	rotateXZ(xAngle, zAngle, dst = this) {
		const [ x, y, z ] = this;
		const cos_x = Math.cos(xAngle);
		const sin_x = Math.sin(xAngle);
		const cos_z = Math.cos(zAngle);
		const sin_z = Math.sin(zAngle);
		const a = y*cos_x - z*sin_x;
		dst[0] = x*cos_z - a*sin_z;
		dst[1] = x*sin_z + a*cos_z;
		dst[2] = y*sin_x + z*cos_x;
		return dst;
	}
	rotateYX(yAngle, xAngle, dst = this) {
		const [ x, y, z ] = this;
		const cos_y = Math.cos(yAngle);
		const sin_y = Math.sin(yAngle);
		const cos_x = Math.cos(xAngle);
		const sin_x = Math.sin(xAngle);
		const a = x*-sin_y + z*cos_y;
		dst[0] = x*cos_y + z*sin_y;
		dst[1] = y*cos_x - a*sin_x;
		dst[2] = y*sin_x + a*cos_x;
		return dst;
	}
	rotateZXY(zAngle, xAngle, yAngle, dst = this) {
		const [ x, y, z ] = this;
		const cos_z = Math.cos(zAngle);
		const sin_z = Math.sin(zAngle);
		const cos_x = Math.cos(xAngle);
		const sin_x = Math.sin(xAngle);
		const cos_y = Math.cos(yAngle);
		const sin_y = Math.sin(yAngle);
		const a = x*sin_z + y*cos_z;
		const b = x*cos_z - y*sin_z;
		const c = a*sin_x + z*cos_x;
		dst[0] = b*cos_y + c*sin_y;
		dst[1] = a*cos_x - z*sin_x;
		dst[2] = c*cos_y - b*sin_y;
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
