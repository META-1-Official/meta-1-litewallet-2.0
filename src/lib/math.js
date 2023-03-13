export const ceilFloat = (floatVal, precision) => {
  precision = Math.pow(10, precision);
  return Math.ceil(floatVal * precision) / precision;
}
