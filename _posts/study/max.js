console.log('一共有多少种方法获取最大值咧?')
console.log('1. Math.max')
console.log('but')
console.log(`Math.max(true, 0):${Math.max(true, 0)}`)
console.log(`Math.max('2',true,null):${Math.max('2', true, null)}`)
console.log('then')
console.log(`Math.max(undefined,1):${Math.max(undefined, 1)}`)
console.log(`Math.max({},1):${Math.max({}, 1)}`)
console.log('oops WTF,I also will tell you these:')
console.log(`Math.min():${Math.min()}, and the Math.max():${Math.max()}`)
console.log('Is it funny?')
// 原始的方法
let arr = [1, 2, 3, 546, 567, 67, 78, 4, 45, 4564, 657, 57, 56, 5]
let res = arr[0]
for (let i = 1; i < arr.length; i++) {
  res = Math.max(res, arr[i])
}
console.log('使用最原始的方法去获得最大值')
console.log(res)
// 使用reduce函数试试
let resByReduce = arr.reduce((prev, next) = > {
  return Math.max(prev, next)
}
)
console.log('使用reduce函数获取最大值')
console.log(resByReduce)
// 排序
let arrs = arr
arrs.sort((prev, next) = > {
  return (prev - next
)
})
console.log('使用排序获取最大值')
console.log(arrs[arrs.length - 1])
// apply
console.log('use the apply')
console.log(Math.max.apply(null, arr))
// ES6
console.log('ES6')
console.log(Math.max(...arr)
)