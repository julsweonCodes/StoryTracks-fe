export const convertToDecimal = (
  coord: number[],
  ref: "N" | "E" | "S" | "W",
): number => {
  const [degrees, minutes, seconds] = coord;
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === "S" || ref === "W") {
    decimal *= -1;
  }
  return decimal;
};
