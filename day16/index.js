const fs = require('fs')
const path = require('path')
const opcodes = require('./opcodes')
let input1 = fs.readFileSync(path.join(__dirname, 'day16_1.txt'), 'utf8')
  .split('\n')
let input2 = fs.readFileSync(path.join(__dirname, 'day16_2.txt'), 'utf8')
  .split('\n').map((line) => line.split(' ').map(Number))


function getDescriptions (input) {
  let descriptions = []
  let current = {}
  for (let line of input1) {
    if (line[0] === 'B') {
      current.before = line
        .slice(9, line.length - 1)
        .split(', ')
        .map(Number)
      continue
    }
    if (line[0] === 'A') {
      current.after = line
        .slice(9, line.length - 1)
        .split(', ')
        .map(Number)
      descriptions.push(current)
      current = {}
      continue
    }
    if (line.length > 4) {
      current.opcode = line
        .split(' ')
        .map(Number)
      continue
    }
  }
  return descriptions
}

function countBehaviors (descriptions, opcodes) {
  let total = 0
  descriptions.forEach((description) => {
    let localTotal = 0
    Object.keys(opcodes).forEach((opcode) => {
      let res = opcodes[opcode](description.before, description.opcode)
      if (res.every((el, idx) => el === description.after[idx])) {
        localTotal++
      }
    })
    if (localTotal >= 3) total++
  })
  return total
}

function determineOpcodes (descriptions, opcodes) {
  let codeMap = new Map() // # -> opcode
  let usedOpcodes = new Set()
  while (codeMap.size < 16) {
    descriptions.forEach((description) => {
      if (codeMap.has(description.opcode[0])) return
      let matches = new Set()
      Object.keys(opcodes).forEach((opcode) => {
        if (usedOpcodes.has(opcode)) return
        let res = opcodes[opcode](description.before, description.opcode)
        if (res.every((el, idx) => el === description.after[idx])) {
          matches.add(opcode)
        }
      })
      if (matches.size === 1) {
        // found a definite match
        let opcode = [...matches][0]
        codeMap.set(description.opcode[0], opcode)
        usedOpcodes.add(opcode)
      }
    })
  }
  return codeMap
}

function runTests (instructions, codeMap, opcodes) {
  let registers = [0, 0, 0, 0]
  instructions.forEach((inst) => {
    let opcode = codeMap.get(inst[0])
    registers = opcodes[opcode](registers, inst)
  })
  return registers
}

let descriptions = getDescriptions(input1)
console.log('\tsolution 1:', countBehaviors(descriptions, opcodes))
let codeMap = determineOpcodes(descriptions, opcodes)
console.log('\tsolution 2:', runTests(input2, codeMap, opcodes))
