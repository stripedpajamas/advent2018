module.exports = {
  addr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] + registers[b]
    return output
  },
  addi (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] + b
    return output
  },
  mulr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] * registers[b]
    return output
  },
  muli (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] * b
    return output
  },
  banr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] & registers[b]
    return output
  },
  bani (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] & b
    return output
  },
  borr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] | registers[b]
    return output
  },
  bori (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] | b
    return output
  },
  setr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a]
    return output
  },
  seti (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = a
    return output
  },
  gtir (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = a > registers[b]
      ? 1
      : 0
    return output
  },
  gtri (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] > b
      ? 1
      : 0
    return output
  },
  gtrr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] > registers[b]
      ? 1
      : 0
    return output
  },
  eqir (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = a === registers[b]
      ? 1
      : 0
    return output
  },
  eqri (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] === b
      ? 1
      : 0
    return output
  },
  eqrr (registers, [_, a, b, c]) {
    let output = registers.slice()
    output[c] = registers[a] === registers[b]
      ? 1
      : 0
    return output
  },
}
