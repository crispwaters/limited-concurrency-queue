import './parseThreshold.typedef.js'
/**
 * Parses a threshold value in milliseconds from an object or number.
 * @param {Threshold|number} threshold - The threshold value to parse.
 * @returns {number} The parsed threshold value in milliseconds.
 */
export function parseThreshold (threshold) {
  if (typeof threshold === 'number') return threshold
  if (typeof threshold === 'object' && threshold !== null) {
    const msMap = {}
    msMap.milliseconds = 1
    msMap.seconds = msMap.milliseconds * 1000
    msMap.minutes = msMap.seconds * 60
    msMap.hours = msMap.minutes * 60
    msMap.days = msMap.hours * 24
    return Object.keys(threshold).filter(key => msMap[key]).reduce((acc, key) => acc + (msMap[key] * threshold[key]), 0)
  }
}
