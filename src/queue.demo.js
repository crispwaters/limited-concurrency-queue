import { Queue } from './queue.js'

/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to delay execution.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Simulates a request by waiting for a random amount of time.
 * @param {string} name - The name of the thread making the request.
 * @returns {Promise} A promise that resolves after the request has been simulated.
 */
async function simulateRequest (name) {
  const length = 200 + Math.floor(Math.random() * 1000)
  console.log(`[Thread ${name}] Starting -- ${length}`)
  await sleep(length)
  console.log(`[Thread ${name}] Finishing`)
}

/**
 * Generates an object with a function and its parameters.
 * @param {*} item - The item to pass as a parameter to the generated function.
 * @returns {Object} An object with a `func` property that is the generated function and a `params` property that is an array of the parameters to pass to the function.
 */
function generator (item) {
  return { func: simulateRequest, params: [item] }
}

/**
 * Runs a demo of the `Queue` class.
 */
async function runQueue () {
  const requeusts = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const queue = new Queue({ maxConcurrency: 4, items: requeusts.map(generator) })

  console.log('Starting queue')
  Promise.resolve(queue.start()).then(() => {
    console.log('Queue finished')
    if (queue.items.length) {
      console.log(`Remaining items in queue: ${queue.items.length}`)
    }
  })

  await sleep(500)
  queue.add(generator(10))
  await sleep(200)
  queue.add(generator(11))
  await sleep(700)
  queue.add(generator(12), generator(13), generator(14))

  await sleep(300)
  if (Math.floor(Math.random() * 2)) queue.stop()
}

runQueue()
