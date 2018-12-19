const fs = require('fs')
const path = require('path')
const opcodes = require('../day16/opcodes')
let input = fs.readFileSync(path.join(__dirname, 'day19.txt'), 'utf8')
  .split('\n')

let instructionPointer = parseInt(input.shift().split(' ').pop(), 10)
let instructions = input.map((line) => {
  let split = line.split(' ')
  let opcode = opcodes[split.shift()]
  let values = [null, ...split.map(Number)]
  return { opcode, values }
})

function process (initialRegisters, instructionPointer, instructions) {
  let registers = initialRegisters
  let i = 0
  while (i < instructions.length) {
    registers[instructionPointer] = i
    registers = instructions[i].opcode(registers, instructions[i].values)
    i = registers[instructionPointer]
    i++
  }
  return registers
}


console.log('\tsolution 1:', process([0, 0, 0, 0, 0, 0], instructionPointer, instructions))
console.log('\tsolution 2:', process([1, 0, 0, 0, 0, 0], instructionPointer, instructions))
