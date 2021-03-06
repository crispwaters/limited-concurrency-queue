module.exports = (threshold) => {
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
