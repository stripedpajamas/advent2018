function getRecipeGenerator () {
  let recipes = [3, 7]
  let a = 0
  let b = 1
  return () => {
    let sum = recipes[a] + recipes[b]
    if (sum >= 10) {
      recipes.push(Math.floor(sum / 10))
    }
    recipes.push(sum % 10)
    a = (a + recipes[a] + 1) % recipes.length
    b = (b + recipes[b] + 1) % recipes.length
    return recipes
  }
}

function getTenAfterK (k) {
  let recipeGenerator = getRecipeGenerator()
  let recipes = recipeGenerator()
  while (recipes.length < k + 10) {
    // this mutates recipes directly so i don't need to reassign
    recipeGenerator()
  }
  return recipes.slice(k, k + 10)
}

function isTail (arr, pattern) {
  if (arr.length < pattern.length) return -1
  let pIdx = 0
  let start
  if (arr[arr.length - pattern.length] === pattern[0]) {
    start = arr.length - pattern.length
  } else if (arr[arr.length - pattern.length - 1] === pattern[0]) {
    start = arr.length - pattern.length - 1
  } else {
    return -1
  }
  for (let i = start; i < start + pattern.length; i++) {
    if (arr[i] !== pattern[pIdx++]) {
      return -1
    }
  }
  return start
}

function getLengthBeforePattern (pattern) {
  let recipeGenerator = getRecipeGenerator()
  let recipes = recipeGenerator()
  let patternStart = isTail(recipes, pattern)
  while (patternStart < 0) {
    recipeGenerator()
    patternStart = isTail(recipes, pattern)
  }
  return patternStart
}

let k = 503761
console.log('\tsolution 1:', getTenAfterK(k).join(''))
console.log('\tsolution 2:', getLengthBeforePattern([5,0,3,7,6,1]))
