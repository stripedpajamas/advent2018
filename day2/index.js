const fs = require('fs')
let input = fs.readFileSync(__dirname + '/day2.txt', 'utf8')
  .split('\n')

function getChecksum (input) {
  // get letter counts for each id
  // and make note of any exact 2 or 3 counts
  let twoCounts = 0
  let threeCounts = 0
  input.forEach((id) => {
    let counts = id.split('').reduce((obj, letter) => {
      obj[letter] = (obj[letter] || 0) + 1
      return obj
    }, {})
    let twoFound = false
    let threeFound = false
    for (let count of Object.values(counts)) {
      if (!twoFound && count === 2) {
        twoCounts++
        twoFound = true
      }
      if (!threeFound && count === 3) {
        threeCounts++
        threeFound = true
      }
    }
  })
  return twoCounts * threeCounts
}

function getSimilarIds (input) {
  // for each id, iterate through each letter
  // with the other ids. if a difference is found
  // set a flag and keep going. if another difference
  // is found, skip that pair. 
  for (let i = 0; i < input.length - 1; i++) {
    for (let j = i + 1; j < input.length; j++) {
      let differences = 0
      let differingIdx = 0
      let tooManyDifferences = false
      for (let k = 0; k < input[i].length; k++) {
        if (input[i][k] !== input[j][k]) {
          differences++
          differingIdx = k
        }
        if (differences > 1) {
          tooManyDifferences = true
          break
        }
      }
      if (tooManyDifferences) continue
      if (differences == 1) {
        // our pair -- find common letters
        let result = input[i].split('').slice()
        result.splice(differingIdx, 1)
        return result.join('')
      }
    }
  }
}

console.log('solution 1:', getChecksum(input))
console.log('solution 2:', getSimilarIds(input))


