// This library implements operations for vectors and matrices of 3 dimensions.
// Definitions:
// - Matrices are implemented as single-dimensioned arrays;
// - Matrices are row major;
// - The coordinate system is right-handed;
// - Rotations around the coordinate axes are clockwise when seen from the positive to the negative of the axis;

const mulMat3Mat3 = (a, b, dst) => {
	const [
		aix, aiy, aiz,
		ajx, ajy, ajz,
		akx, aky, akz,
	] = a;
	const [
		bix, biy, biz,
		bjx, bjy, bjz,
		bkx, bky, bkz,
	] = b;

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

const mulVec3Mat3 = (v, m, dst) => {
	const [ x, y, z ] = v;
	const [
		ix, iy, iz,
		jx, jy, jz,
		kx, ky, kz,
	] = m;

	dst[0] = x*ix + y*jx + z*kx;
	dst[1] = x*iy + y*jy + z*ky;
	dst[2] = x*iz + y*jz + z*kz;
};

const rotateXVec3 = (v, angle, dst) => {
	const [ x, y, z ] = v;
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);

	dst[0] = x;
	dst[1] = y*cos + z*sin;
	dst[2] = z*cos - y*sin;
};

const rotateYVec3 = (v, angle, dst) => {
	const [ x, y, z ] = v;
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);

	dst[0] = x*cos - z*sin;
	dst[1] = y;
	dst[2] = z*cos + x*sin;
};

const rotateZVec3 = (v, angle, dst) => {
	const [ x, y, z ] = v;
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);

	dst[0] = x*cos + y*sin;
	dst[1] = y*cos - x*sin;
	dst[2] = z;
};

const buildXRotationMat3 = (angle, dst) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);

	dst[0] = 1;
	dst[1] = 0;
	dst[2] = 0;

	dst[3] = 0;
	dst[4] = cos;
	dst[5] = - sin;

	dst[6] = 0;
	dst[7] = sin;
	dst[8] = cos;
};
