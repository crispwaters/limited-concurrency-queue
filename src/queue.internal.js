/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to delay execution.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Checks if the threshold for the queue has been exceeded.
 * @param {Queue} Queue - The queue to check the threshold for.
 * @returns {boolean} `true` if the threshold has been exceeded, otherwise `false`.
 */
export function thresholdExceeded (Queue) {
  return (Date.now() - Queue._start) > Queue.threshold
}

/**
 * Controls the concurrency of the queue.
 * @param {Queue} Queue - The queue to control the concurrency of.
 * @returns {Promise} A promise that resolves when the concurrency is within the threshold.
 */
export async function concurrencyControl (Queue) {
  while (!thresholdExceeded(Queue)) {
    if (Queue.concurrencyCount < Queue.maxConcurrency) return
    await sleep(100)
  }
}

/**
 * Runs the next item in the queue.
 * @param {Queue} Queue - The queue to run the next item for.
 */
export function runNext (Queue) {
  const next = Queue.items.shift()
  if (next === undefined) return
  Queue.concurrencyCount++
  Promise.resolve(next.func(...next.params)).then(() => Queue.concurrencyCount--)
}

/**
 * Checks if the queue should stop executing early.
 * @param {Queue} Queue - The queue to check if it should stop early.
 * @returns {boolean} `true` if the queue should stop early, otherwise `false`.
 */
export function stopEarly (Queue) {
  return Queue._executing === false || thresholdExceeded(Queue)
}

/**
 * Runs the queue.
 * @param {Queue} Queue - The queue to run.
 * @returns {Promise} A promise that resolves when all items in the queue have been executed.
 */
export async function run (Queue) {
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
