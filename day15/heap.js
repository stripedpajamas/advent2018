class BinHeap {
  constructor (compare) {
    this.compare = compare
    this.heap = []
  }
  insert (node) {
    
  }
}

let heap = new BinHeap((a, b) => a-b)
heap.insert(5)
heap.insert(2)
heap.insert(3)
console.log(heap.min())
console.log(heap.min())
console.log(heap.min())

module.exports = BinHeap
