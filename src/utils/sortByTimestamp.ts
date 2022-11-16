export const sortByTimeStamp = (timestampFirst: number | string, timestampSecond: number | string) => {
  return Number(timestampSecond) - Number(timestampFirst)
}
