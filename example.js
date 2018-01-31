var fs = require('fs')
var parseBVH = require('./index')

console.log(parseBVH(fs.readFileSync('./example.bvh').toString()))