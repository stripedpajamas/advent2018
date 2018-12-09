const fs = require('fs')
let input = fs.readFileSync(__dirname + '/day4.txt', 'utf8')
  .split('\n')

/*
Actions:
  0: begin
  1: sleep
  2: wake
*/

function parseInput (input) {
  // create object from each line
  // { time, guardId, action }
  let parsed = input.map((line) => {
    let time = new Date(line.slice(1, 17))
    let split = line.split(' ')
    let guardId = split.length > 5 ? parseInt(split[3].slice(1), 10) : 0
    let action
    switch (split[split.length - 1]) {
      case 'shift':
        action = 0
        break
      case 'asleep':
        action = 1
        break
      case 'up':
        action = 2
        break
      default:
        break
    }
    return { time, guardId, action }
  }).sort((a, b) => a.time - b.time)

  // populate unknown guard ids
  let guardId
  for (let i = 0; i < parsed.length; i++) {
    if (parsed[i].guardId > 0) {
      guardId = parsed[i].guardId
    } else {
      parsed[i].guardId = guardId
    }
  }
  return parsed
}

function getSleepMap (entries) {
  // map of guard id -> { minutes: [0..59], total: Number }
  let sleepMap = {}
  for (let i = 0; i < entries.length; i++) {
    let id = entries[i].guardId
    if (entries[i].action === 1) {
      // fell asleep
      let wokeUp = entries[i+1].time.getMinutes()
      for (let m = entries[i].time.getMinutes(); m < wokeUp; m++) {
        if (!sleepMap[id]) sleepMap[id] = {
          minutes: new Array(60).fill(0),
          total: 0
        }
        sleepMap[id].minutes[m]++
        sleepMap[id].total++
      }
    }
  }
  return sleepMap
}

function getGuardMinuteCombo1 (sleepMap) {
  // guard that slept the most
  let guardId
  let max = 0
  for (let id of Object.keys(sleepMap)) {
    if (sleepMap[id].total > max) {
      max = sleepMap[id].total
      guardId = id
    }
  }
  // find the minute that guard slept the most
  let minute = 0
  for (let m = 0; m < 60; m++) {
    if (sleepMap[guardId].minutes[m] > sleepMap[guardId].minutes[minute]) {
      minute = m
    }
  }
  return guardId * minute
}

function getGuardMinuteCombo2 (sleepMap) {
  // get each guard's most slept on minute (and how long they slept on it)
  let sleepyMinutes = Object.keys(sleepMap).reduce((obj, id) => {
    let minute = 0
    for (let m = 0; m < 60; m++) {
      if (sleepMap[id].minutes[m] > sleepMap[id].minutes[minute]) {
        minute = m
      }
    }
    obj[id] = { minute, slept: sleepMap[id].minutes[minute] }
    return obj
  }, {})
  
  // now get the highest slept on minute
  let minute = 0
  let slept = 0
  let guardId = 0
  Object.keys(sleepyMinutes).forEach((id) => {
    if (sleepyMinutes[id].slept > slept) {
      slept = sleepyMinutes[id].slept
      minute = sleepyMinutes[id].minute
      guardId = id
    }
  })
  return guardId * minute
}

let entries = parseInput(input)
let sleepMap = getSleepMap(entries)
let solution1 = getGuardMinuteCombo1(sleepMap)
let solution2 = getGuardMinuteCombo2(sleepMap)
console.log('solution 1:', solution1)
console.log('solution 2:', solution2)
