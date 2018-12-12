/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_$" }] */
const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day12.txt'), 'utf8').split('\n')
let initialState = input[0].slice(15).split('').reduce((state, plant, idx) => {
  state.set(idx, plant)
  return state
}, new Map())
let rules = input.slice(2).reduce((rules, line) => {
  let split = line.split(' ')
  rules.set(split[0], split[2])
  return rules
}, new Map())

function getNextState (state, rules) {
  let nextState = new Map()
  for (let [idx, plant] of state) {
    // [ L1, L2, C, R2, R1 ]
    let l1 = state.get(idx - 2) || '.'
    if (!l1) {
      nextState.set(idx - 2, '.')
      l1 = nextState.get(idx - 2)
    }
    let l2 = state.get(idx - 1) || '.'
    if (!l2) {
      nextState.set(idx - 1, '.')
      l2 = nextState.get(idx - 1)
    }
    let r1 = state.get(idx + 2)
    if (!r1) {
      nextState.set(idx + 2, '.')
      r1 = nextState.get(idx + 2)
    }
    let r2 = state.get(idx + 1)
    if (!r2) {
      nextState.set(idx + 1, '.')
      r2 = nextState.get(idx + 1)
    }
    let key = `${l1}${l2}${plant}${r2}${r1}`
    nextState.set(idx, rules.get(key))
  }
  return nextState
}

function sumPlantContainingPots (state) {
  let total = 0
  for (let [idx, plant] of state) {
    if (plant === '#') {
      total += idx
    }
  }
  return total
}

function spread (initialState, rules, generations) {
  /*
    looks like after the 97th iteration,
    the difference in sums is always +81
    so ((generations - 97) * 81) + sum_of_generations_up_to_97
  */

  let remaining = generations
  let bigCompute = false
  if (remaining > 97) {
    bigCompute = true
    remaining = 97
  }
  let state = initialState
  while (remaining--) {
    // for (let i = -8; i < state.size - 8; i++) {
    //   process.stdout.write(state.get(i))
    // }
    // process.stdout.write('\n')
    let nextState = getNextState(state, rules)
    state = nextState
  }

  let sum = sumPlantContainingPots(state)

  if (bigCompute) {
    sum += ((generations - 97) * 81)
  }

  return sum
}

console.log('\tsolution 1:', spread(initialState, rules, 138))
console.log('\tsolution 2:', spread(initialState, rules, 50000000000))
