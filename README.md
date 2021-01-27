# limited-concurrency-queue

[![Maintainability](https://api.codeclimate.com/v1/badges/595ec60efac64affa139/maintainability)](https://codeclimate.com/github/crispwaters/limited-concurrency-queue/maintainability) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Build Status](https://travis-ci.com/crispwaters/limited-concurrency-queue.svg?branch=main)](https://travis-ci.com/crispwaters/limited-concurrency-queue)

This is a package to handle processing a maximum number of asynchronous requests concurrently. Items in the queue are processed in the order they are added. When an item finishes processing, the next item in the queue will begin processing.

## Queue

```javascript
const Queue = require('limited-concurrency-queue')
const myQueue = new Queue({ maxConcurrency: 5 })

const request = async (item) => ({
  // ... do async processing with item
})

const generator = (item) => ({ func: request, params: [item] })

myQueue.add(generator(1))
myQueue.add(...[2,3,4,5,6,7,8,9].map(generator))
Promise.resolve(myQueue.start()).then(() => {
  // all requests finished
})
```

## Items

Items added to the queue are objects with the following properties

```javascript
{
  func: 'Function',
  params: 'Array'
}
```

The `func` property is a generator function that performs the asynchronous request. The `params` property is an array that contains the parameters passed into the generator function

## Threshold

Queues can have a defined threshold for when no additional items will begin processing. Any items that are currently processing will finish processing. Thresholds an be defined by either a number value representing the time in milliseconds or an object that defines the numeric values of milliseconds, seconds, minutes, hours, and/or days.

```javascript
const Queue = require('limited-concurrency-queue')
const queue1 = new Queue({ threshold: 720000 })
const queue2 = new Queue({ threshold: { minutes: 12 } })
```

The default threshold value can also be altered through a static variable on the Queue class

```javascript
const Queue = require('limited-concurrency-queue')
const queue1 = new Queue()
Queue.defaults.threshold = { minutes: 12 }
const queue2 = new Queue()
console.log(queue1.threshold) //=> Infinity
console.log(queue2.threshold) //=> { minutes: 12 }
```