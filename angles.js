const parseAngle = (str) => {
	str = str.trim();
	let sign = 1;
	if (str.startsWith('-')) {
		sign = - sign;
	}
	str = str.replace(/^[+\-]\s*/, '');
	str = str.replace(/[^\d\s\.]/g, '\x20');
	str = str.replace(/\s+/g, '\x20');
	return str.trim()
		.split(/\s+/)
		.map((val, i) => val*Math.pow(60, -i))
		.reduce((a, b) => a + b, 0)*sign;
};

const decimalRegex = /^([+\-]\s*)?\d+(\.\d+)?$/;
const degreesRegex = /^(([+\-]\s*)?\d+((\s*°\s*|\s+)\d+(\.\d+)?(\s*'$)?((\s*'\s*|\s+)\d+(\.\d+)?(\s*")?)?)?)$/;
const arcMinRegex = /^(([+\-]\s*)?\d+(\.\d+)?(\s*')?)$/;
const timeRegex = /^\d+((\s*h\s*|\s+)\d+((\s*m\s*|\s+)\d+(\.\d+)?(\s*s)?)?)?$/i;

export const parse = (str) => {
	if (decimalRegex.test(str)) return Number(str);
	if (degreesRegex.test(str)) return parseAngle(str);
	if (arcMinRegex.test(str)) return parseAngle(str)/60;
	if (timeRegex.test(str)) return parseAngle(str)*(360/24);
	return null;
};

export const stringify = (angle) => {
	let res = angle < 0 ? '-' : '';
	let t = Math.round(Math.abs(angle)*60*10);
	let mins = (t%(60*10))/10;
	let degs = Math.round((t - mins*10)/(60*10));
	if (mins === 0) return res + degs + '°';
	return res + `${degs}°${mins}'`;
};
