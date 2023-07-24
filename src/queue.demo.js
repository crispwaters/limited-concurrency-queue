import { Queue } from './queue.js'

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function simulateRequest (name) {
  const length = 200 + Math.floor(Math.random() * 1000)
  console.log(`[Thread ${name}] Starting -- ${length}`)
  await sleep(length)
  console.log(`[Thread ${name}] Finishing`)
}

function generator (item) {
  return { func: simulateRequest, params: [item] }
}

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
