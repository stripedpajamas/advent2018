/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_$" }] */
const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day6.txt'), 'utf8')
  .split('\n').map(line => line.split(', ').map(Number))

function getGrid (input) {
  // [col, row]
  let top = 0
  let bottom = 0
  let left = 0
  let right = 0
  input.forEach((location) => {
    top = Math.min(top, location[1])
    bottom = Math.max(bottom, location[1])
    left = Math.min(left, location[0])
    right = Math.max(right, location[0])
  })
  return { top, bottom, left, right }
}

function distance ([ar, ac], [br, bc]) {
  return Math.abs(ar - br) + Math.abs(ac - bc)
}

function getDistanceMap (grid, points) {
  // a map of every point to the location it is closest to
  let distanceMap = new Map()
  for (let row = grid.top; row <= grid.bottom; row++) {
    for (let col = grid.left; col <= grid.right; col++) {
      let thisPoint = [col, row]
      let thisPointKey = thisPoint.join()
      // skip our parent points
      if (points.has(thisPointKey)) continue
      // get distance from this point to all parent points
      // select the minimum
      let min = Infinity
      let closest
      for (let [key, point] of points) {
        let dist = distance(thisPoint, point)
        if (dist < min) {
          min = dist
          closest = key
        }
      }
      // now that we have a min, figure out if any were tied
      let tie = false
      for (let [key, point] of points) {
        let dist = distance(thisPoint, point)
        if (dist === min && key !== closest) {
          tie = true
          break
        }
      }
      // we don't handle ties
      if (tie) continue
      distanceMap.set(thisPointKey, closest)
    }
  }
  return distanceMap
}

function findLargestArea (distanceMap, grid) {
  let areas = new Map()
  let boundaries = [grid.top, grid.bottom, grid.left, grid.right]
  for (let [_, parentKey] of distanceMap) {
    let current = areas.get(parentKey) || 1
    areas.set(parentKey, current + 1)
  }
  // remove parents that are infinite
  for (let [childKey, parentKey] of distanceMap) {
    let [col, row] = childKey.split(',').map(Number)
    if (boundaries.includes(row) || boundaries.includes(col)) {
      areas.delete(parentKey)
    }
  }
  // get largest area in areas
  let max = 0
  for (let [_, area] of areas) {
    if (area > max) max = area
  }
  return max
}

function findRegionSize (grid, points) {
  let total = 0
  for (let row = grid.top; row <= grid.bottom; row++) {
    for (let col = grid.left; col <= grid.right; col++) {
      let thisPoint = [col, row]
      let allDistances = 0
      for (let [_, point] of points) {
        allDistances += distance(thisPoint, point)
      }
      if (allDistances < 10000) total++
    }
  }
  return total
}

let points = new Map()
input.forEach((loc) => points.set(loc.join(), loc))
let grid = getGrid(input)
let distanceMap = getDistanceMap(grid, points)
console.log('\tsolution 1:', findLargestArea(distanceMap, grid))
console.log('\tsolution 2:', findRegionSize(grid, points))
