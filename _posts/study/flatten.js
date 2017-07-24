let arr = [1, 2, 3, [4, 5, [6, 7]]]
console.log('JavaScript基础夯实之数组扁平化:')
console.log(arr)

// way 1

function flattenSimple(arr) {
    let result = []
    for (let i in arr) {
        if (Array.isArray(arr[i])) {
            result = result.concat(flatten(arr[i]))
        } else {
            result.push(arr[i])
        }
    }
    return result
}

console.log('使用递归的方法,获得的结果如下:')
console.log(flattenSimple(arr))
    // way2
console.log('使用reduce函数也是递归的一种实现方式')

//TODO: reduce 方法在使用的时候有一点问题
function flattenByReduce(arr) {
    return arr.reduce((prev, next) => {
        return prev.concat(Array.isArray(next) ? flattenByReduce(next) : next)
    }, [])
}
console.log(flattenByReduce(arr))
    //way3
console.log('如果一个数组的元素全部是数字:')

function flattenByToString(arr) {
    return arr.toString().split(',').map(item => {
        // 这里使用加号做的是数据类型的转换,类似的还有使用
        // + ''
        // !!
        return +item
    })
}

console.log(flattenByToString(arr))

// way4
function flattenByES6(arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
    }
    return arr
}
console.log('使用ES6拓展运算符也可以')
console.log(flattenByES6(arr))

//way 5
// 源码地址 : https://github.com/jashkenas/underscore/blob/master/underscore.js#L528
/**
 * 数组扁平化
 * @param {Array} input 要处理数组
 * @param {boolean} shallow 是否只扁平一层
 * @param {boolran} strict 是否严格处理元素
 * @param {Array} output 这是为了方便递归前面传过来的参数
 */
function flatten(input, shallow, strict, output) {
    // 递归使用到output
    output = output || []
    let idx = output.length
    for (let i in output) {
        // let value = input[i]
        // 如果是数组,就进行处理
        if (Array.isArray(input[i])) {
            if (shallow) {
                let j = 0
                let len = input[i].length
                while (j < len) {
                    output[idx++] = input[i][j++]
                }
            } else {
                // 如果是全部扁平化就进行递归操作
                flatten(input[i], shallow, strict, output)
            }
        }
        // 如果不是数组,则根据 strict 的值判断跳过还是放进output数组
        else if (!strict) {
            output[idx++] = input[i]
        }
    }
    return output
}