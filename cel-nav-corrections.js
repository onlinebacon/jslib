const TO_RAD = Math.PI/180;
const TO_DEG = 180/Math.PI;
const acos = cos => Math.acos(cos)*TO_DEG;
const tan = angle => Math.tan(angle*TO_RAD);
const cot = angle => 1/tan(angle);

const R = 6371e3*7/6;

export const refraction = (h) => cot(h+7.31/(h+4.4))/60;
export const dip = (h) => acos(R/(R+h));
