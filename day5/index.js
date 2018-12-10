/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_$" }] */
const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day5.txt'), 'utf8')
  .split('')

function willReact (a, b) {
  if (a === '$' || b === '$') return false
  if (a.toLowerCase() === b.toLowerCase()) {
    if (Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) === 32) {
      // only different case reacts
      return true
    }
  }
  return false
}

function react (s) {
  let len = s.length
  for (let i = 0; i < s.length - 1; i++) {
    let left = i
    let right = i + 1
    while (left >= 0 && right < s.length) {
      if (willReact(s[left], s[right])) {
        s[left] = '$'
        s[right] = '$'
        left--
        right++
      } else {
        break
      }
    }
  }
  let reacted = s.filter(x => x !== '$')
  if (len !== reacted.length) {
    return react(reacted)
  }
  return reacted.length
}

function improveReaction (input) {
  // keep track of what we've tried to remove
  let removed = new Map()
  for (let c of input) {
    let key = c.toLowerCase()
    if (removed.has(key)) continue
    let filtered = input.filter(x => x.toLowerCase() !== key)
    let length = react(filtered)
    removed.set(key, length)
  }
  // get smallest entry
  let min = Infinity
  for (let [_, length] of removed) {
    if (length < min) min = length
  }
  return min
}

console.log('solution 1:', react(input))
console.log('solution 2:', improveReaction(input))
