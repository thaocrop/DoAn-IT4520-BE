export const calcDistance = (
  latCurrent: number | string,
  lngCurrent: number | string,
  latTo: number | string,
  LngTo: number | string,
) => {
  const R = 6371; // km
  const dLat = toRad(Number(latTo) - Number(latCurrent));
  const dLng = toRad(Number(LngTo) - Number(lngCurrent));
  const latCurrentRad = toRad(Number(latCurrent));
  const latToRad = toRad(Number(latTo));

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(latCurrentRad) * Math.cos(latToRad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

// Converts numeric degrees to radians
function toRad(value: number) {
  return (value * Math.PI) / 180;
}
