/* 447 players; last marble is worth 71510 points */

// initial array solution that is too slow
function play (players, marbles) {
  // initialize board and scores
  let circle = [0]
  let scores = new Array(players).fill(0)
  let remaining = marbles - 1
  let current = 0 // current index
  let currentPlayer = 0
  while (remaining > -1) {
    let next = marbles - remaining
    if (next % 23 === 0) {
      scores[currentPlayer] += next
      // 7 previous gets spliced and added to score
      let sevenPrevious = (current - 7) % circle.length
      while (sevenPrevious < 0) sevenPrevious += circle.length
      let value = Number(circle.splice(sevenPrevious, 1))
      scores[currentPlayer] += value
      current = sevenPrevious
    } else {
      if (circle.length < 2) {
        circle.push(next)
        current++
      } else {
        // place next marble between marbles that are 1 and 2 away
        let twoAway = (current + 2) % circle.length
        if (twoAway === 0) {
          circle.push(next)
          current += 2
        } else {
          circle.splice(twoAway, 0, next)
          current = twoAway
        }
      }
    }
    remaining--
    currentPlayer = (currentPlayer + 1) % players
  }
  // return highscore
  return Math.max(...scores)
}

// a linked list based solution :)
class Node {
  constructor (val) {
    this.val = val
    this.prev = this.next = null
  }
}

function playOptimized (players, marbles) {
  // initialize board and scores
  let current = new Node(0)
  // make it circular :)
  current.next = current.prev = current
  let scores = new Array(players).fill(0)
  let remaining = marbles - 1
  let currentPlayer = 0
  while (remaining > -1) {
    let nextVal = marbles - remaining
    if (nextVal % 23 === 0) {
      scores[currentPlayer] += nextVal
      // 7th previous gets added to score
      let previous = current
      for (let i = 0; i < 7; i++) {
        previous = previous.prev
      }
      scores[currentPlayer] += previous.val
      // and removed
      previous.prev.next = previous.next
      current = previous.next
    } else {
      // place next marble between marbles that are 1 and 2 away
      let oneAway = current.next
      let twoAway = oneAway.next
      let newNode = new Node(nextVal)
      // link everything up
      oneAway.next = newNode
      newNode.prev = oneAway
      newNode.next = twoAway
      twoAway.prev = newNode
      // newly placed node becomes current
      current = newNode
    }
    remaining--
    currentPlayer = (currentPlayer + 1) % players
  }
  // return highscore
  return Math.max(...scores)
}

console.log('\tsolution 1:', play(447, 71510))
console.log('\tsolution 2:', playOptimized(447, 7151000))
