const fs = require('fs')
let input = fs.readFileSync(__dirname + '/day3.txt', 'utf8')
  .split('\n')

function parseInput (input) {
  // #123 @ 1,3: 4x4
  // make a map of cloth sections
  return input.reduce((output, line) => {
    let parts = line.split(' ')
    let id = parseInt(parts[0].slice(1), 10)
    let starts = parts[2].split(',')
    let colStart = parseInt(starts[0], 10)
    let rowStart = parseInt(starts[1].slice(0, -1), 10)
    let ends = parts[3].split('x')
    let colEnd = colStart + parseInt(ends[0], 10)
    let rowEnd = rowStart + parseInt(ends[1], 10)
    output.set(id, { rowStart, rowEnd, colStart, colEnd })
    return output
  }, new Map())
}

function getCloth () {
  let cloth = []
  for (let i = 0; i < 1000; i++) {
    cloth[i] = []
    for (let j = 0; j < 1000; j++) {
      cloth[i][j] = 0
    }
  }
  return cloth
}

function findOverlaps (sections) {
  let cloth = getCloth()
  // for each section, increment the counter on that square inch
  for (let [_, section] of sections) {
    for (let row = section.rowStart; row < section.rowEnd; row++) {
      for (let col = section.colStart; col < section.colEnd; col++) {
        cloth[row][col]++
      }
    }
  }
  // now that cloth has been updated, count >= 2 squares
  let total = 0
  for (let row = 0; row < cloth.length; row++) {
    for (let col = 0; col < cloth[0].length; col++) {
      if (cloth[row][col] >= 2) total++
    }
  }
  return total
}

function findNonOverlapper (sections) {
  let cloth = getCloth()
  // put all ids in a set of possible answers
  let ids = new Set()
  for (let [id] of sections) {
    ids.add(id)
  }
  for (let [id, section] of sections) {
    for (let row = section.rowStart; row < section.rowEnd; row++) {
      for (let col = section.colStart; col < section.colEnd; col++) {
        if (cloth[row][col] > 0) {
          // this is an overlap, so remove it from possibilities
          // as well as what it overlapped with
          ids.delete(id)
          ids.delete(cloth[row][col])
        }
        cloth[row][col] = id
      }
    }
  }
  // set should only have one entry now
  for (let id of ids) {
    return id
  }
}

let parsed = parseInput(input)

console.log('solution 1:', findOverlaps(parsed))
console.log('solution 2:', findNonOverlapper(parsed))
