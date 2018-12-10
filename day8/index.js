const fs = require('fs')
const path = require('path')
let input = fs.readFileSync(path.join(__dirname, 'day8.txt'), 'utf8')
  .split(' ').map(Number)

class Node {
  constructor (c, m) {
    this.numChildren = c
    this.numMeta = m
    this.children = []
    this.meta = []
  }
}

function parseInput (arr, idx, parent) {
  let nextIdx = idx
  while (parent.children.length < parent.numChildren) {
    // we need another child
    let child = new Node(arr[nextIdx], arr[nextIdx + 1])
    parent.children.push(child)
    nextIdx = parseInput(arr, nextIdx + 2, child)
  }
  while (parent.meta.length < parent.numMeta) {
    // we need some more meta
    parent.meta.push(arr[nextIdx])
    nextIdx++
  }
  return nextIdx
}

function createNodes (input) {
  let root = new Node(input[0], input[1])
  parseInput(input, 2, root)
  return root
}

function sumMeta (root) {
  let children = root.children.map(sumMeta).reduce((t, e) => t + e, 0)
  let self = root.meta.reduce((t, e) => t + e, 0)
  return children + self
}

function valueNode (root) {
  if (!root) return 0
  if (!root.children.length) {
    // if no children, count meta
    return root.meta.reduce((t, e) => t + e, 0)
  }
  // have children, consider meta as indexes
  return root.meta.reduce((t, m) => {
    return t + valueNode(root.children[m - 1])
  }, 0)
}

let root = createNodes(input)

console.log('\tsolution 1:', sumMeta(root))
console.log('\tsolution 2:', valueNode(root))
