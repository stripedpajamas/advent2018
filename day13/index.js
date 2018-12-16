/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_$" }] */
const fs = require('fs')
const path = require('path')
const carTypes = ['^', '>', 'v', '<']
let input = fs.readFileSync(path.join(__dirname, 'day13.txt'), 'utf8')
  .split('\n').map((row) => row.split(''))

class Car {
  /*
    direction:
      0: up
      1: right
      2: down
      3: left
    nextTurn:
      -1: left
      0: straight
      1: right
  */
  constructor (sigil, row, col) {
    switch (sigil) {
      case '^': {
        this.direction = 0
        this.under = '|'
        break
      }
      case '>': {
        this.direction = 1
        this.under = '-'
        break
      }
      case 'v': {
        this.direction = 2
        this.under = '|'
        break
      }
      case '<': {
        this.direction = 3
        this.under = '-'
        break
      }
    }
    this.row = row
    this.col = col
    this.nextTurn = -1
  }
  move (map, [row, col]) {
    let tmp = map[row][col]
    map[row][col] = map[this.row][this.col]
    map[this.row][this.col] = this.under
    this.under = tmp
    this.row = row
    this.col = col
    if (carTypes.includes(tmp)) {
      return true
    }
  }
  tick (map) {
    let next = []
    switch (this.direction) {
      case 0: {
        next = [this.row - 1, this.col]
        break
      }
      case 1: {
        next = [this.row, this.col + 1]
        break
      }
      case 2: {
        next = [this.row + 1, this.col]
        break
      }
      case 3: {
        next = [this.row, this.col - 1]
        break
      }
    }
    switch (map[next[0]][next[1]]) {
      case '\\': {
        if (this.direction % 2 === 0) {
          // i'm moving up or down
          this.direction = (this.direction - 1) % 4
          if (this.direction < 0) this.direction += 4
          break
        }
        // i'm moving left or right
        this.direction = (this.direction + 1) % 4
        break
      }
      case '/': {
        if (this.direction % 2 === 0) {
          // i'm moving up or down
          this.direction = (this.direction + 1) % 4
          break
        }
        // i'm moving left or right
        this.direction = (this.direction - 1) % 4
        if (this.direction < 0) this.direction += 4
        break
      }
      case '+': {
        this.direction = (this.direction + this.nextTurn) % 4
        if (this.direction < 0) this.direction += 4
        this.nextTurn = this.nextTurn === 1 ? -1 : this.nextTurn + 1
        break
      }
    }
    let collision = this.move(map, next)
    return { collision, row: next[0], col: next[1] }
  }
}

function getFirstCollision (input) {
  let map = copyMap(input)
  let cars = getCars(map)
  while (true) {
    for (let car of cars) {
      let { collision, row, col } = car.tick(map)
      if (collision) {
        return { row, col }
      }
    }
  }
}

function getLastCarPosition (input) {
  let map = copyMap(input)
  let cars = getCars(map)
  let carLocations = new Map()
  let allCars = new Set(cars)
  // populate map with where cars are and keep up to date
  for (let car of cars) {
    carLocations.set([car.row, car.col].join(), car)
  }
  while (allCars.size > 1) {
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        let car = carLocations.get([r, c].join())
        if (!car || !allCars.has(car)) continue
        let { collision, row, col } = car.tick(map)
        if (collision) {
          // remove this car and the colliding car
          // console.log('collision at %d,%d', row, col)
          let otherCar = carLocations.get([row, col].join())
          allCars.delete(car)
          allCars.delete(otherCar)
          // console.log('deleted:\n\t', car, '\n\t', otherCar)
          // what was under the other car is the correct road
          map[otherCar.row][otherCar.col] = otherCar.under

          carLocations.delete([row, col].join())
          carLocations.delete([r, c].join())
          // console.log('remaining cars:', allCars.size)
        } else {
          // update the map to where this car now is
          carLocations.delete([r, c].join())
          carLocations.set([row, col].join(), car)
        }
      }
    }
    // for (let car of cars) {
    //   if (!allCars.has(car)) continue
    //   let beforeMovedLocation = [car.row, car.col]
    //   let { collision, row, col } = car.tick(map)
    //   if (collision) {
    //     // remove this car and the colliding car
    //     // console.log('collision at %d,%d', row, col)
    //     let otherCar = carLocations.get([row, col].join())
    //     allCars.delete(car)
    //     allCars.delete(otherCar)
    //     // console.log('deleted:\n\t', car, '\n\t', otherCar)
    //     // what was under the other car is the correct road
    //     map[otherCar.row][otherCar.col] = otherCar.under

    //     carLocations.delete([row, col].join())
    //     carLocations.delete(beforeMovedLocation.join())
    //     // console.log('remaining cars:', allCars.size)
    //   } else {
    //     // update the map to where this car now is
    //     carLocations.delete(beforeMovedLocation.join())
    //     carLocations.set([row, col].join(), car)
    //   }
    // }
  }
  for (let final of allCars) {
    return { row: final.row, col: final.col }
  }
}

function getCars (map) {
  const cars = new Set()
  map.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
      if (carTypes.includes(val)) {
        cars.add(new Car(val, rowIdx, colIdx))
      }
    })
  })
  return cars
}

function copyMap (map) {
  let output = []
  map.forEach((row, rowIdx) => {
    output[rowIdx] = row.slice()
  })
  return output
}

let map = input
console.log('\tsolution 1:', getFirstCollision(map))
// console.log('\tsolution 2:', getLastCarPosition(map))
