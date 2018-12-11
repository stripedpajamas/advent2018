function calculateCell (col, row, serialNumber) {
  let rackId = col + 10
  let powerLevel = rackId * row
  powerLevel += serialNumber
  powerLevel *= rackId
  powerLevel = Math.floor(powerLevel / 100) % 10
  powerLevel -= 5
  return powerLevel
}

function getFuelGrid (serialNumber) {
  // make a 301x301 grid
  let grid = []
  for (let row = 0; row <= 300; row++) {
    grid[row] = []
    for (let col = 0; col <= 300; col++) {
      grid[row][col] = calculateCell(col, row, serialNumber)
    }
  }
  return grid
}

function findPowerGroup (grid, size) {
  // looking for a sizexsize group of max power
  let max = -Infinity
  let cell
  for (let row = 1; row <= 300-size; row++) {
    for (let col = 1; col <= 300-size; col++) {
      let power = 0
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          power += grid[row+i][col+j]
        }
      }
      if (power > max) {
        max = power
        cell = [col, row]
      }
    }
  }
  return { cell, power: max }
}

function calculateGroup (grid, row, col, size, computed) {
  if (!computed[row]) computed[row] = {}
  if (!computed[row][col]) computed[row][col] = {}
  if (typeof computed[row][col][size] !== 'undefined') {
    return computed[row][col][size]
  }
  if (size === 1) {
    computed[row][col][size] = grid[row][col]
    return computed[row][col][size]
  }
  let previous = calculateGroup(grid, row, col, size-1, computed)
  // add the difference of the squares
  let total = previous
  for (let c = 0; c < size; c++) {
    total += grid[row + size - 1][col + c]
  }
  for (let r = 0; r < size; r++) {
    total += grid[row + r][col + size - 1]
  }
  total -= grid[row + size - 1][col + size - 1] // corner piece
  // put total into computed
  computed[row][col][size] = total
  return total
}

function findBestSizedGroup (grid) {
  // a data structure of 
  // row -> col -> size -> power
  let computed = {}
  let max = -Infinity
  let cell
  let size
  for (let s = 1; s <= 300; s++) {
    for (let row = 1; row <= 300-s; row++) {
      for (let col = 1; col <= 300-s; col++) {
        let p = calculateGroup(grid, row, col, s, computed)
        if (p > max) {
          max = p
          size = s
          cell = [col, row]
        }
      }
    }
  }
  return { cell, power: max, size }
}

let serialNumber = 5791
let grid = getFuelGrid(serialNumber)

console.log('\tsolution 1:', findPowerGroup(grid, 3))
console.log('\tsolution 2:', findBestSizedGroup(grid))

