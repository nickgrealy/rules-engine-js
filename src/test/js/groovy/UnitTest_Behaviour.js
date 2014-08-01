
QUnit.module( "Undefined/Null/Blank" );

QUnit.test( "undefined/null should throw an error", function( assert ) {
    var assertErr = function(err){ return err.toString() === 'groovy does not accept an undefined or null parameter!'}
    assert.throws( function(){ $groovy() }, assertErr )
    assert.throws( function(){ $groovy(undefined) }, assertErr )
    assert.throws( function(){ $groovy(null) }, assertErr )
});

QUnit.module( "Arrays" );

var array1 = [5,3,1,2,4,2]

QUnit.test( "each", function( assert ) {
    var blank = $groovy([]), valid = $groovy([1,2,3])
    // test blank
    var tmp = []
    var addToTmp = function(a,b,c){ return c[c.length] = a*3+b }
    blank.each(addToTmp).toString()
    assert.strictEqual(tmp.join(','), '')
    // test valid
    tmp = []
    valid.each(addToTmp, tmp).toString()
    assert.strictEqual(tmp.join(','), '3,7,11')
    // test closure
    tmp = []
    valid.each('c[c.length] = a*3+b', tmp).toString()
    assert.strictEqual(tmp.join(','), '3,7,11')
})
QUnit.test( "indexOf", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c','b'])
    assert.strictEqual(blank.indexOf('b'), -1)
    assert.strictEqual(valid.indexOf('b'), 1)
    assert.strictEqual(valid.indexOf('x'), -1)
})
QUnit.test( "lastIndexOf", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c','b'])
    assert.strictEqual(blank.lastIndexOf('b'), -1)
    assert.strictEqual(valid.lastIndexOf('b'), 3)
    assert.strictEqual(valid.lastIndexOf('x'), -1)
})
QUnit.test( "toString", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.toString(),    '')
    assert.strictEqual(single.toString(),   '99')
    assert.strictEqual(valid.toString(),    '1,2,3')
    assert.strictEqual(negs.toString(),     '-1,-2,-3')
    assert.strictEqual(assort.toString(),   '-1,2,3')
})
QUnit.test( "push", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.push(55).toString(),    '55')
    assert.strictEqual(single.push(55).toString(),   '99,55')
    assert.strictEqual(valid.push(55).toString(),    '1,2,3,55')
    assert.strictEqual(negs.push(55).toString(),     '-1,-2,-3,55')
    assert.strictEqual(assort.push(55).toString(),   '-1,2,3,55')
})
QUnit.test( "add", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.add(55).toString(),    '55')
    assert.strictEqual(single.add(55).toString(),   '99,55')
    assert.strictEqual(valid.add(55).toString(),    '1,2,3,55')
    assert.strictEqual(negs.add(55).toString(),     '-1,-2,-3,55')
    assert.strictEqual(assort.add(55).toString(),   '-1,2,3,55')
})

QUnit.test( "min", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.min(), undefined)
    assert.strictEqual(single.min(), 99)
    assert.strictEqual(valid.min(), 1)
    assert.strictEqual(negs.min(), -3)
    assert.strictEqual(assort.min(function(a,b){ return b > a ? b : a }), 3)
    assert.strictEqual(assort.min('b < a ? b : a'), -1)
})
QUnit.test( "max", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.max(), undefined)
    assert.strictEqual(single.max(), 99)
    assert.strictEqual(valid.max(), 3)
    assert.strictEqual(negs.max(), -1)
    assert.strictEqual(assort.max(function(a,b){ return b > a ? b : a }), 3)
    assert.strictEqual(assort.max('b < a ? b : a'), -1)
})
QUnit.test( "collect", function( assert ) {
    var blank = $groovy([]), valid = $groovy([1,2,3])
    var returnMap1 = function(a,b){ return a*3+b }
    var returnMap2 = function(a,b,c){ return a*3+b+c }
    // blank
    assert.strictEqual(blank.collect(returnMap1).join(','), '')
    assert.strictEqual(blank.collect('a*3+b').join(','), '')
    // one param
    assert.strictEqual(valid.collect(returnMap1).join(','), '3,7,11')
    assert.strictEqual(valid.collect('a*3+b').join(','), '3,7,11')
    // two params
    assert.strictEqual(valid.collect(returnMap2,3).join(','), '6,10,14')
    assert.strictEqual(valid.collect('a*3+b+c',3).join(','), '6,10,14')
})
QUnit.test( "collectEntries", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c'])
    assert.strictEqual(blank.collectEntries(function(a,b){ return [a, b] }).toString(), '{}')
    assert.strictEqual(valid.collectEntries(function(a,b){ return [a, b] }).toString(), '{a:0,b:1,c:2}')
    assert.strictEqual(blank.collectEntries('[a,b]').toString(), '{}')
    assert.strictEqual(valid.collectEntries('[a,b]').toString(), '{a:0,b:1,c:2}')
})
QUnit.test( "find", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c'])
    assert.strictEqual(blank.find(function(a,b){ return b == 0 }), undefined)
    assert.strictEqual(valid.find(function(a,b){ return b == 0 }), 'a')
    assert.strictEqual(blank.find('b == 0'), undefined)
    assert.strictEqual(valid.find('b == 0'), 'a')
})
QUnit.test( "findAll", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c'])
    assert.strictEqual(blank.findAll(function(a,b){ return b < 2 }).toString(), '')
    assert.strictEqual(valid.findAll(function(a,b){ return b < 2 }).toString(), 'a,b')
    assert.strictEqual(blank.findAll('b < 2').toString(), '')
    assert.strictEqual(valid.findAll('b < 2').toString(), 'a,b')
})
QUnit.test( "sort", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c'])
    assert.strictEqual(blank.size(), 0)
    assert.strictEqual(valid.size(), 3)
})
QUnit.test( "size", function( assert ) {
    var blank = $groovy([]), alpha = $groovy(['b','c','a']), valid = $groovy([1,2,-3])
    assert.strictEqual(blank.sort().toString(), '')
    assert.strictEqual(alpha.sort().toString(), 'a,b,c')
    assert.strictEqual(valid.sort().toString(), '-3,1,2')
    assert.strictEqual(blank.sort('a<b').toString(), '')
    assert.strictEqual(alpha.sort('a<b').toString(), 'c,b,a')
    assert.strictEqual(valid.sort('a<b').toString(), '2,1,-3')
})
QUnit.test( "contains", function( assert ) {
    var blank = $groovy([]), alpha = $groovy(['c','a','b']), numbers = $groovy([2,3,-1])
    assert.strictEqual(blank.contains(undefined), false)
    assert.strictEqual(blank.contains(null), false)
    assert.strictEqual(blank.contains('a'), false)
    assert.strictEqual(alpha.contains(2), false)
    assert.strictEqual(alpha.contains('a'), true)
    assert.strictEqual(numbers.contains(2), true)
    assert.strictEqual(numbers.contains('a'), false)
})
QUnit.test( "get", function( assert ) {
    var blank = $groovy([]), valid = $groovy(['a','b','c'])
    assert.strictEqual(blank.get(0), undefined)
    assert.strictEqual(valid.get(-1), undefined)
    assert.strictEqual(valid.get(0), 'a')
    assert.strictEqual(valid.get(2), 'c')
    assert.strictEqual(valid.get(3), undefined)
})
// addAll, flatten, groupBy, range

QUnit.module( "Objects" );

// keys, toString



