const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day10.txt'), 'utf8')
  .split('\n').map((line) => {
    let position = line.slice(10, 24).split(', ').map(Number)
    let velocity = line.slice(36, 42).split(',').map(Number)
    return {
      position: { x: position[0], y: position[1] },
      velocity: { x: velocity[0], y: velocity[1] }
    }
  })

function getDimensions (lights) {
  // find smallest and largest x and y
  let { minx, miny, maxx, maxy } = lights.reduce((acc, light) => {
    return {
      minx: Math.min(acc.minx, light.position.x),
      maxx: Math.max(acc.maxx, light.position.x),
      miny: Math.min(acc.miny, light.position.y),
      maxy: Math.max(acc.maxy, light.position.y)
    }
  }, { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity })
  return {
    rows: Math.abs(maxy - miny),
    cols: Math.abs(maxx - minx),
    raw: { minx, miny, maxx, maxy }
  }
}

function fastForward (lights) {
  return lights.map((light) => ({
    ...light,
    position: {
      x: light.position.x + light.velocity.x,
      y: light.position.y + light.velocity.y
    }
  }))
}

function getArea (dimensions) {
  return dimensions.rows * dimensions.cols
}

// consider minx and miny 0, 0 and adjust others accordingly
function shiftLights (lights, minx, miny) {
  return lights.map((light) => ({
    ...light,
    position: { x: light.position.x - minx, y: light.position.y - miny }
  }))
}

function findMessage (lights) {
  // fast forward until dimensions are small
  let originalLights = lights
  let originalDimensions = getDimensions(originalLights)
  let originalArea = getArea(originalDimensions)
  let movedLights = fastForward(originalLights)
  let dimensions = getDimensions(movedLights)
  let area = getArea(dimensions)
  let seconds = 1
  while (originalArea > area) {
    // area should keep getting smaller until smallest
    // and then it will start getting bigger
    seconds++
    originalLights = movedLights
    originalDimensions = dimensions
    originalArea = area
    movedLights = fastForward(movedLights)
    dimensions = getDimensions(movedLights)
    area = getArea(dimensions)
  }
  // now that our moved lights have a larger dimension
  // we should draw the previous iteration (original lights)
  dimensions = originalDimensions
  let grid = []
  for (let row = 0; row < dimensions.rows + 1; row++) {
    grid[row] = []
    for (let col = 0; col < dimensions.cols + 1; col++) {
      grid[row][col] = '.'
    }
  }
  // shift lights down so that minx/miny are 0,0
  let shiftedLights = shiftLights(
    originalLights,
    dimensions.raw.minx,
    dimensions.raw.miny
  )

  shiftedLights.forEach((light) => {
    let x = parseInt(light.position.x)
    let y = parseInt(light.position.y)
    grid[y][x] = '#'
  })

  let display = grid
    .map((row) => `\t${row.join('')}`)
    .join('\n')

  return { display, seconds }
}

let { display, seconds } = findMessage(input)
console.log('\tsolution 1:\n', display)
console.log('\tsolution 2:', seconds)
