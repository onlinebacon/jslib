// Coordinate system is right-handed
// Positive rotations are clockwise when viewed from the positive side of the axes of rotation

const NumType = Float64Array;
const VEC_LEN = NumType.BYTES_PER_ELEMENT*3;

export class Vector extends NumType {
	constructor(a, b) {
		if (a instanceof Transform) {
			const [ { buffer }, index ] = [ a, b ];
			const offset = VEC_LEN*index;
			super(buffer, offset, 3);
		} else {
			super(3);
		}
	}
	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }
	set x(val) { this[0] = val; }
	set y(val) { this[1] = val; }
	set z(val) { this[2] = val; }
	set([ x, y, z ]) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		return this;
	}
	add([ x, y, z ], dst = this) {
		const [ vx, vy, vz ] = this;
		dst[0] = vx + x;
		dst[1] = vy + y;
		dst[2] = vz + z;
		return dst;
	}
	sub([ x, y, z ], dst = this) {
		const [ vx, vy, vz ] = this;
		dst[0] = vx - x;
		dst[1] = vy - y;
		dst[2] = vz - z;
		return dst;
	}
	len() {
		const [ x, y, z ] = this;
		return Math.sqrt(x*x, y*y, z*z);
	}
	scale(scalar, dst = this) {
		const [ x, y, z ] = this;
		dst[0] = x*scalar;
		dst[1] = y*scalar;
		dst[2] = z*scalar;
		return dst;
	}
	normalize(dst = this) {
		return this.scale(1/this.len(), dst);
	}
	dot([ x, y, z ]) {
		return this[0]*x + this[1]*y + this[2]*z;
	}
	transform(transform, dst = this) {
		const [ x, y, z ] = this;
		const [ ix, iy, iz, jx, jy, jz, kx, ky, kz, lx, ly, lz ] = transform;
		dst[0] = x*ix + y*jx + z*kx + lx;
		dst[1] = x*iy + y*jy + z*ky + ly;
		dst[2] = x*iz + y*jz + z*kz + lz;
		return dst;
	}
	_rotateX(sin, cos, dst = this) {
		const [ x, y, z ] = this;
		dst[0] = x;
		dst[1] = y*cos + z*sin;
		dst[2] = z*cos - y*sin;
		return dst;
	}
	_rotateY(sin, cos, dst = this) {
		const [ x, y, z ] = this;
		dst[0] = x*cos - z*sin;
		dst[1] = y;
		dst[2] = z*cos + x*sin;
		return dst;
	}
	_rotateZ(sin, cos, dst = this) {
		const [ x, y, z ] = this;
		dst[0] = x*cos + y*sin;
		dst[1] = y*cos - x*sin;
		dst[2] = z;
		return dst;
	}
	rotateX(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this._rotateX(sin, cos, dst);
		return dst;
	}
	rotateY(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this._rotateY(sin, cos, dst);
		return dst;
	}
	rotateZ(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this._rotateZ(sin, cos, dst);
		return dst;
	}
}

export class Transform extends NumType {
	constructor() {
		super([
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
			0, 0, 0,
		]);
		this.i = new Vector(this, 0);
		this.j = new Vector(this, 1);
		this.k = new Vector(this, 2);
		this.l = new Vector(this, 3);
	}
	set(transform) {
		this.i.set(transform.i);
		this.j.set(transform.j);
		this.k.set(transform.k);
		this.l.set(transform.l);
		return this;
	}
	translate(vec, dst = this) {
		if (dst !== this) {
			dst.set(this);
		}
		dst.l.add(vec);
		return dst;
	}
	rotateX(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this.i._rotateX(sin, cos, dst.i);
		this.j._rotateX(sin, cos, dst.j);
		this.k._rotateX(sin, cos, dst.k);
		this.l._rotateX(sin, cos, dst.l);
		return dst;
	}
	rotateY(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this.i._rotateY(sin, cos, dst.i);
		this.j._rotateY(sin, cos, dst.j);
		this.k._rotateY(sin, cos, dst.k);
		this.l._rotateY(sin, cos, dst.l);
		return dst;
	}
	rotateZ(angle, dst = this) {
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this.i._rotateZ(sin, cos, dst.i);
		this.j._rotateZ(sin, cos, dst.j);
		this.k._rotateZ(sin, cos, dst.k);
		this.l._rotateZ(sin, cos, dst.l);
		return dst;
	}
	transform(transform, dst = this) {
		this.i.transform(transform, dst.i);
		this.j.transform(transform, dst.j);
		this.k.transform(transform, dst.k);
		this.l.transform(transform, dst.l);
		return dst;
	}
	toMatrix() {
		return [
			[...this.i, 0],
			[...this.j, 0],
			[...this.k, 0],
			[...this.l, 0],
		];
	}
	clear() {
		for (let i=12; i--;) {
			this[i] = (i & 3) === 0;
		}
		return this;
	}
	calcYXZRotation(dst = [ 0, 0, 0 ]) {
		tempT.set(this);
		dst[2] = deconstructZRotOfJ(tempT);
		dst[1] = deconstructXRotOfJ(tempT);
		dst[0] = deconstructYRotOfI(tempT);
		return dst;
	}
	calcZXYRotation(dst = [ 0, 0, 0 ]) {
		tempT.set(this);
		dst[2] = deconstructYRotOfK(tempT);
		dst[1] = deconstructXRotOfK(tempT);
		dst[0] = deconstructZRotOfJ(tempT);
		return dst;
	}
}

const deconstructZRotOfJ = (t) => {
	const [ x, y ] = t.j;
	const len = Math.sqrt(x*x + y*y);
	if (len === 0) return 0;
	const nx = x/len;
	const ny = y/len;
	const sin = -nx;
	const cos = ny;
	t.i._rotateZ(sin, cos);
	t.j[0] = 0;
	t.j[1] = len;
	t.k._rotateZ(sin, cos);
	return nx >= 0 ? Math.acos(ny) : Math.PI*2 - Math.acos(ny);
};

const deconstructXRotOfJ = (t) => {
	const [ _, y, z ] = t.j;
	const len = Math.sqrt(y*y + z*z);
	if (len === 0) return 0;
	const ny = y/len;
	const nz = z/len;
	const sin = nz;
	const cos = ny;
	t.i._rotateX(sin, cos);
	t.j[1] = len;
	t.j[2] = 0;
	t.k._rotateX(sin, cos);
	return nz <= 0 ? Math.acos(ny) : Math.PI*2 - Math.acos(ny);
};

const deconstructYRotOfI = (t) => {
	const [ x, _, z ] = t.i;
	const len = Math.sqrt(x*x + z*z);
	if (len === 0) return 0;
	const nx = x/len;
	const nz = z/len;
	const sin = -nz;
	const cos = nx;
	t.i[0] = len;
	t.i[2] = 0;
	t.j._rotateY(sin, cos);
	t.k._rotateY(sin, cos);
	return nz >= 0 ? Math.acos(cos) : Math.PI*2 - Math.acos(cos);
};

const deconstructYRotOfK = (t) => {
	const [ x, _, z ] = t.k;
	const len = Math.sqrt(x*x + z*z);
	if (len === 0) return 0;
	const nx = x/len;
	const nz = z/len;
	const sin = nx;
	const cos = nz;
	t.i._rotateY(sin, cos);
	t.j._rotateY(sin, cos);
	t.k[0] = 0;
	t.k[2] = len;
	return nx <= 0 ? Math.acos(cos) : Math.PI*2 - Math.acos(cos);
};

const deconstructXRotOfK = (t) => {
	const [ _, y, z ] = t.k;
	const len = Math.sqrt(y*y + z*z);
	if (len === 0) return 0;
	const ny = y/len;
	const nz = z/len;
	const sin = -ny;
	const cos = nz;
	t.i._rotateX(sin, cos);
	t.j._rotateX(sin, cos);
	t.k[1] = 0;
	t.k[2] = len;
	return ny >= 0 ? Math.acos(cos) : Math.PI*2 - Math.acos(cos);
};

const tempT = new Transform();
