const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day15.txt'), 'utf8')
  .split('\n').map((row) => row.split(''))


class Unit {
  constructor ({ type, row, col, power }) {
    this.power = power
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
    if (weakestTarget.hp <= this.power) {
      // kill this mf
      weakestTarget.dead = true
      map[weakestTarget.row][weakestTarget.col] = '.'
    } else {
      weakestTarget.hp -= this.power
    }
  }
  getSets (map) {
    let alreadyQueued = []
    let alreadyDiscovered = []
    let previous = []
    for (let r = 0; r < map.length; r++) {
      alreadyQueued[r] = []
      alreadyDiscovered[r] = []
      previous[r] = []
    }
    return { previous, alreadyQueued, alreadyDiscovered }
  }
  getClosestDestination (destinations, map) {
    // bfs
    let { alreadyQueued, alreadyDiscovered, previous } = this.getSets(map)
    let queue = [[this.row, this.col]]
    alreadyQueued[this.row][this.col] = true
    previous[this.row][this.col] = null
    while (queue.length) {
      let current = queue.shift()
      for (let destination of destinations) {
        if (current[0] === destination[0] && current[1] === destination[1]) {
          // we have arrived at something we wanted to get to
          let path = [current]
          let node = current
          while (previous[node[0]][node[1]] !== null) {
            path.unshift(previous[node[0]][node[1]])
            node = previous[node[0]][node[1]]
          }
          path.shift() // take this node out of path
          return path
        }
      }
      for (let neighbor of this.getAdjacent([current], map)) {
        if (alreadyDiscovered[neighbor[0]][neighbor[1]]) continue
        if (alreadyQueued[neighbor[0]][neighbor[1]]) continue

        queue.push(neighbor)
        alreadyQueued[neighbor[0]][neighbor[1]] = true
        previous[neighbor[0]][neighbor[1]] = current
      }
      alreadyDiscovered[current[0]][current[1]] = true
    }
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
  constructor (map, elfPower) {
    this.map = this.copyMap(map)
    
    // replace G/E with Units on copy of map
    this.units = []
    if (elfPower) {
      this.safeElves = true
      this.elfPower = elfPower
    }
    this.parseUnits()
    
    this.rounds = 0
  }
  sumHitPoints () {
    return this.units.reduce((total, unit) => total + (unit.dead ? 0 :unit.hp), 0)
  }
  parseUnits () {
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map.length; c++) {
        if (this.map[r][c] !== '.' && this.map[r][c] !== '#') {
          this.map[r][c] = new Unit({
            type: this.map[r][c],
            row: r,
            col: c,
            power: this.safeElves && this.map[r][c] === 'E'
              ? this.elfPower
              : 3
          })
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
    this.map.forEach((row) => {
      console.log(row.map((val) => (val.type && val.type) || val).join(''))
    })
    console.log('')
  }
  play () {
    let combatOver = false
    console.log('elf count:', this.units.filter(x => x.type === 'E').length)
    while (!combatOver) {
      this.print()
      this.rounds++
      this.units.sort((a, b) => {
        if (a.row < b.row) return -1
        if (a.row > b.row) return 1
        if (a.col < b.col) return -1
        if (a.col > b.col) return 1
        return 0
      })
      for (let unit of this.units) {
        if (unit.dead) {
          if (this.safeElves && unit.type === 'E') {
            return -1
          }
          continue
        }
        let keepGoing = unit.takeTurn(this.map, this.units)
        if (!keepGoing) {
          combatOver = true
          break
        }
      }
      let newUnits = []
      for (let unit of this.units) {
        if (!unit.dead) {
          newUnits.push(unit)
        } else {
          if (this.safeElves && unit.type === 'E') {
            return -1
          }
        }
      }
      this.units = newUnits
    }
    this.print()
    console.log('final elf count:', this.units.filter(x => x.type === 'E').length)
    console.log('# of rounds:', this.rounds)
    return (this.rounds - 1) * this.sumHitPoints()
  }
}

function findSafeElfPower (input) {
  let power = 4
  let game = new Game(input, power)
  let result = game.play()
  while (result < 0) {
    power++
    console.log('trying power %d', power)
    game = new Game(input, power)
    result = game.play()
  }
  return result
}

console.log('\tsolution 1:', new Game(input).play())
console.log('\tsolution 2:', findSafeElfPower(input))

