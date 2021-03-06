/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_$" }] */
const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day7.txt'), 'utf8')
  .trim().split('\n')

class Step {
  constructor (val) {
    this.val = val
    this.dependencies = new Set()
  }
}

function getSteps (input) {
  let steps = new Map()
  input.forEach((line) => {
    let split = line.split(' ')
    let step
    let dep
    if (steps.has(split[7])) {
      step = steps.get(split[7])
    } else {
      step = new Step(split[7])
      steps.set(split[7], step)
    }
    if (steps.has(split[1])) {
      dep = steps.get(split[1])
    } else {
      dep = new Step(split[1])
      steps.set(split[1], dep)
    }
    step.dependencies.add(dep)
  })
  return steps
}

function getBestNextStep (steps) {
  let bestNextStep = null
  for (let step of steps) {
    if (!bestNextStep || step.val < bestNextStep.val) {
      bestNextStep = step
    }
  }
  return bestNextStep
}

function getPossibleNextSteps (steps, done) {
  let possibleNextSteps = new Set()
  for (let [_, step] of steps) {
    if (done.has(step)) continue
    let allDepsDone = [...step.dependencies].every(dep => done.has(dep))
    if (step.dependencies.size < 1 || allDepsDone) {
      possibleNextSteps.add(step)
    }
  }
  return possibleNextSteps
}

function getOrder (steps) {
  let order = []
  let done = new Set()
  // see if all dependencies have been done
  // for each step -- if so, add it to possible next steps
  // then find smallest step value and do it
  while (order.length < steps.size) {
    let possibleNextSteps = getPossibleNextSteps(steps, done)
    let bestNextStep = getBestNextStep(possibleNextSteps)
    done.add(bestNextStep)
    order.push(bestNextStep.val)
  }
  return order.join('')
}

function completeSteps (steps, baseTime, workers) {
  let seconds = 0
  let doing = new Map()
  let done = new Set()
  let availableWorkers = workers
  while (done.size < steps.size) {
    while (availableWorkers) {
      // get possible next steps
      let possibleNextSteps = getPossibleNextSteps(steps, done)
      // filter out any steps we are doing
      for (let step of possibleNextSteps) {
        if (doing.has(step)) possibleNextSteps.delete(step)
      }
      // get best next step
      let bestNextStep = getBestNextStep(possibleNextSteps)
      if (!bestNextStep) break
      let timeNeeded = bestNextStep.val.charCodeAt(0) - 64 + baseTime
      doing.set(bestNextStep, timeNeeded)
      availableWorkers--
    }
    // work on what we're doing
    for (let [step, timeRemaining] of doing) {
      timeRemaining--
      if (timeRemaining === 0) {
        availableWorkers++
        done.add(step)
        doing.delete(step)
      } else {
        doing.set(step, timeRemaining)
      }
    }
    seconds++
  }
  return seconds
}

let steps = getSteps(input)
console.log('\tsolution 1:', getOrder(steps))
console.log('\tsolution 2:', completeSteps(steps, 60, 5))
