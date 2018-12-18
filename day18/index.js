const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day18.txt'), 'utf8')
  .split('\n').map((row) => row.split(''))

function getAdjacent (row, col, grid) {
  let adjacent = []
  for (let r = row - 1; r < row + 2; r++) {
    if (!grid[r]) continue
    for (let c = col - 1; c < col + 2; c++) {
      if (r === row && c === col) continue
      if (!grid[r][c]) continue
      adjacent.push(grid[r][c])
    }
  }
  return adjacent
}

function getNextValue (current, adjacent) {
  switch (current) {
    case '.': {
      return adjacent.reduce((total, el) => el === '|' ? total + 1 : total, 0) >= 3
        ? '|'
        : '.'
    }
    case '|': {
      return adjacent.reduce((total, el) => el === '#' ? total + 1 : total, 0) >= 3
      ? '#'
      : '|'
    }
    case '#': {
      if (adjacent.includes('#') && adjacent.includes('|')) {
        return '#'
      }
      return '.'
    }
  }
  return current
}

function printGrid (grid) {
  grid.forEach((row) => console.log(row.join('')))
  console.log('')
}

function isEqual(a, b) {
  // equality of two grids
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false
    }
  }
  return true
}

function iterate (input, iterations) {
  let grid = input
  for (let i = 0; i < iterations; i++) {
    let next = new Array(grid.length).fill(1).map(_ => new Array(grid[0].length))
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        next[r][c] = getNextValue(grid[r][c], getAdjacent(r, c, grid))
      }
    }
    grid = next
  }
  return grid
}

function getGridKey (grid) {
  return grid.map(row => row.join()).join()
}

function bigIterate (input, iterations) {
  let seen = new Map()
  let next = iterate(input, 1)
  seen.set(getGridKey(input), 1)
  let nextKey = getGridKey(next)
  let count = 1
  while (!seen.has(nextKey)) {
    count++
    seen.set(nextKey, count)
    next = iterate(next, 1)
    nextKey = getGridKey(next)
  }
  return iterate(next, iterations % count)
}

function getResourceValue (grid) {
  let lumberyards = 0
  let woods = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === '#') lumberyards++
      if (grid[r][c] === '|') woods++
    }
  }
  return lumberyards * woods
}

console.log('\tsolution 1:', getResourceValue(iterate(input, 10)))
console.log('\tsolution 2:', getResourceValue(bigIterate(input, 1000000000)))
