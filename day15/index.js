const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day15.txt'), 'utf8')
  .split('\n').map((row) => row.split(''))


class Unit {
  constructor ({ type, row, col }) {
    this.power = 3
    this.hp = 200
    this.row = row
    this.col = col
    this.type = type
    this.dead = false
  }
  identifyPossibleTargets (units) {
    // all types that differ from mine
    return units.filter(u => !u.dead && u.type !== this.type)
  }
  getAdjacent (targets, map) {
    // all squares which are adjacent to each target
    // that aren't already occupied by a wall or unit
    let squares = []
    targets.forEach((t) => {
      let target = Array.isArray(t) ? { row: t[0], col: t[1] } : t
      if (map[target.row - 1] && map[target.row - 1][target.col] === '.') {
        squares.push([target.row - 1, target.col])
      }
      if (map[target.row][target.col - 1] === '.') {
        squares.push([target.row, target.col - 1])
      }
      if (map[target.row][target.col + 1] === '.') {
        squares.push([target.row, target.col + 1])
      }
      if (map[target.row + 1] && map[target.row + 1][target.col] === '.') {
        squares.push([target.row + 1, target.col])
      }
    })
    return squares
  }
  getInRange (targets) {
    // determine if any of these targets are next to me
    return targets.reduce((inRange, target) => {
      if (Math.abs(target.row - this.row) === 1 && target.col - this.col === 0) {
        // above or below me
        inRange.push(target)
        return inRange
      }
      if (Math.abs(target.col - this.col) === 1 && target.row - this.row === 0) {
        // beside me
        inRange.push(target)
        return inRange
      }
      return inRange
    }, [])
  }
  getWeakestTarget (targets) {
    let min = Infinity
    let weakest
    targets.forEach((target) => {
      if (target.hp < min) {
        min = target.hp
        weakest = target
      }
    })
    return weakest
  }
  attack (map) {
    let inRange = []
    if (map[this.row - 1] && typeof map[this.row - 1][this.col] === 'object') {
      inRange.push(map[this.row - 1][this.col])
    }
    if (map[this.row + 1] && typeof map[this.row + 1][this.col] === 'object') {
      inRange.push(map[this.row + 1][this.col])
    }
    if (typeof map[this.row][this.col - 1] === 'object') {
      inRange.push(map[this.row][this.col - 1])
    }
    if (typeof map[this.row][this.col + 1] === 'object') {
      inRange.push(map[this.row][this.col + 1])
    }
    inRange = inRange.filter((target) => target.type !== this.type)
    if (!inRange.length) return
    let weakestTarget = this.getWeakestTarget(inRange)
    if (weakestTarget.hp <= 3) {
      // kill this mf
      weakestTarget.dead = true
      map[weakestTarget.row][weakestTarget.col] = '.'
    } else {
      weakestTarget.hp -= 3
    }
  }
  getShortestPath (destination, map) {
    // find shortest path to destination from current position
    // if there is a tie, use reading order to break tie
    // dijkstra's ?
    let startKey = [this.row, this.col].join()
    let unvisited = new Map()
    let visited = new Set()
    let dist = new Map()
    let previous = new Map() // previous node in optimal path
    unvisited.set(startKey, [this.row, this.col])
    previous.set(startKey, null)
    dist.set(startKey, 0)
    while (unvisited.size) {
      // get unvisited node with smallest distance
      let current // [row, col]
      let currentKey
      let smallest = Infinity
      // console.log('unvisited size:', unvisited.size)
      for (let [key, node] of unvisited) {
        if (dist.get(key) < smallest) {
          current = node
          currentKey = key
          smallest = dist.get(key)
        }
      }
      // see if we've reached our destination
      if (current[0] === destination[0] && current[1] === destination[1]) {
        // reverse iterate through previous map
        let path = []
        let n = currentKey
        while (previous.get(n)) {
          path.unshift(n.split(',').map(Number))
          n = previous.get(n)
        }
        return path
      }
      // mark this node as visited
      visited.add(currentKey)
      unvisited.delete(currentKey)
      // touch each of this node's neighbors
      this.getAdjacent([current], map).forEach((neighbor) => {
        // if we've already visited this neighbor, skip it
        let neighborKey = neighbor.join()
        if (visited.has(neighborKey)) return
        let possibleBestDistance = dist.get(currentKey) + 1
        if (possibleBestDistance < (dist.get(neighborKey) || Infinity)) {
          dist.set(neighborKey, possibleBestDistance)
          previous.set(neighborKey, currentKey)
        }
        unvisited.set(neighborKey, neighbor)
      })
    }
  }
  getClosestDestination (destinations, map) {
    // for each destination, get shortest path
    let paths = destinations.map((destination) => this.getShortestPath(destination, map))
    paths = paths.filter(p => !!p)
    paths.sort(([ar, ac], [br, bc]) => {
      if (ar < br) return -1
      if (ar > br) return 1
      if (ac < bc) return -1
      if (ac > bc) return 1
      return 0
    })
    let min = Infinity
    let closestDestination
    for (let path of paths) {
      if (path.length < min) {
        min = path.length
        closestDestination = path
      }
    }
    return closestDestination
  }
  move (destinations, map) {
    let closestDestination = this.getClosestDestination(destinations, map)
    if (!closestDestination) return
    let step = closestDestination[0] // first step in path
    map[step[0]][step[1]] = this
    map[this.row][this.col] = '.'
    this.row = step[0]
    this.col = step[1]
  }
  takeTurn (map, units) {
    let targets = this.identifyPossibleTargets(units)
    if (!targets.length) {
      // combat ends
      return false
    }
    let inRange = this.getInRange(targets)
    if (inRange.length) {
      this.attack(map)
      return true
    }
    let squaresAdjacentToTargets = this.getAdjacent(targets, map)
    if (!squaresAdjacentToTargets.length) {
      // end of turn for this unit
      return true
    }
    this.move(squaresAdjacentToTargets, map)
    this.attack(map)
    return true
  }
}

class Game {
  constructor (map) {
    this.map = this.copyMap(map)
    
    // replace G/E with Units on copy of map
    this.units = []
    this.parseUnits()
    
    this.rounds = 0
  }
  sumHitPoints () {
    return this.map.reduce((sum, row) => sum + row.reduce((rowSum, unit) => {
      if (typeof unit === 'object') return rowSum + unit.hp
      return rowSum
    }, 0), 0)
  }
  parseUnits () {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map.length; c++) {
        if (this.map[r][c] !== '.' && this.map[r][c] !== '#') {
          this.map[r][c] = new Unit({ type: this.map[r][c], row: r, col: c })
          this.units.push(this.map[r][c])
        }
      }
    }
  }
  copyMap (map) {
    let copy = []
    map.forEach((row) => { copy.push(row.slice()) })
    return copy
  }
  print () {
    game.map.forEach((row) => {
      console.log(row.map((val) => (val.type && val.type) || val).join(''))
    })
    console.log('')
  }
  play () {
    let combatOver = false
    while (!combatOver) {
      this.rounds++
      let units = this.units.sort((a, b) => {
        if (a.row < b.row) return -1
        if (a.row > b.row) return 1
        if (a.col < b.col) return -1
        if (a.col > b.col) return 1
        return 0
      })
      for (let unit of units) {
        if (unit.dead) continue
        let keepGoing = unit.takeTurn(this.map, units)
        if (!keepGoing) {
          combatOver = true
          break
        }
      }
      this.units = this.units.filter(u => !u.dead)
    }
    return (this.rounds - 1) * this.sumHitPoints()
  }
}

let game = new Game(input)
console.log('\tsolution 1:', game.play())

