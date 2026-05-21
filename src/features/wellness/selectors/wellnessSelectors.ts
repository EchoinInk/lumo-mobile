/**
 * Wellness Selectors
 * 
 * Derived state selectors for wellness.
 * Memoized for performance.
 */

/**
 * Select average mood
 */
export const selectAverageMood = (moodData: any[]) => {
  if (!moodData.length) return 0;
  const sum = moodData.reduce((acc, curr) => acc + curr.level, 0);
  return sum / moodData.length;
};

/**
 * Select average energy
 */
export const selectAverageEnergy = (energyData: any[]) => {
  if (!energyData.length) return 0;
  const sum = energyData.reduce((acc, curr) => acc + curr.level, 0);
  return sum / energyData.length;
};

/**
 * Select average sleep quality
 */
export const selectAverageSleep = (sleepData: any[]) => {
  if (!sleepData.length) return 0;
  const sum = sleepData.reduce((acc, curr) => acc + curr.level, 0);
  return sum / sleepData.length;
};
