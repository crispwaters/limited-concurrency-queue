function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function thresholdExceeded (Queue) {
  return (Date.now() - Queue._start) > Queue.threshold
}

async function concurrencyControl (Queue) {
  while (!thresholdExceeded(Queue)) {
    if (Queue.concurrencyCount < Queue.maxConcurrency) return
    await sleep(100)
  }
}

function runNext (Queue) {
  const next = Queue.items.shift()
  if (next === undefined) return
  Queue.concurrencyCount++
  Promise.resolve(next.func(...next.params)).then(() => Queue.concurrencyCount--)
}

function stopEarly (Queue) {
  return Queue._executing === false || thresholdExceeded(Queue)
}

async function run (Queue) {
  Queue._start = Date.now()
  while (Queue._executing && Queue.items.length) {
    await concurrencyControl(Queue)
    if (stopEarly(Queue)) break
    runNext(Queue)
  }
  while (Queue.concurrencyCount > 0) {
    await sleep(100)
  }
}

module.exports = {
  concurrencyControl,
  run,
  runNext,
  sleep,
  stopEarly,
  thresholdExceeded
}
