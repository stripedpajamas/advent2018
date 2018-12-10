const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day1.txt'), 'utf8')
  .split('\n').map(Number)

function findRepeat (input) {
  let freqs = new Set()
  let idx = 0
  let sum = 0
  while (true) {
    sum += input[idx++ % input.length]
    if (freqs.has(sum)) return sum
    freqs.add(sum)
  }
}

console.log('\tsolution 1:', input.reduce((t, e) => t + e))
console.log('\tsolution 2:', findRepeat(input))
