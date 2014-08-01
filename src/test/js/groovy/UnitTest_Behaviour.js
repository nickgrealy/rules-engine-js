
QUnit.module( "Undefined/Null/Blank" );

QUnit.test( "undefined/null should throw an error", function( assert ) {
    var assertErr = function(err){ return err.toString() === 'groovy does not accept an undefined or null parameter!'}
    assert.throws( function(){ $groovy() }, assertErr )
    assert.throws( function(){ $groovy(undefined) }, assertErr )
    assert.throws( function(){ $groovy(null) }, assertErr )
});

QUnit.module( "Arrays" );

var array1 = [5,3,1,2,4,2]

QUnit.test( "min", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.min(), null)
    assert.strictEqual(single.min(), 99)
    assert.strictEqual(valid.min(), 1)
    assert.strictEqual(negs.min(), -3)
    assert.strictEqual(assort.min(function(a,b){ return b > a ? b : a }), 3)
    assert.strictEqual(assort.min('b < a ? b : a'), -1)
});
QUnit.test( "max", function( assert ) {
    var blank = $groovy([]), single = $groovy([99]), 
        valid = $groovy([1,2,3]), negs = $groovy([-1,-2,-3]),
        assort = $groovy([-1,2,3])
    assert.strictEqual(blank.max(), null)
    assert.strictEqual(single.max(), 99)
    assert.strictEqual(valid.max(), 3)
    assert.strictEqual(negs.max(), -1)
    assert.strictEqual(assort.max(function(a,b){ return b > a ? b : a }), 3)
    assert.strictEqual(assort.max('b < a ? b : a'), -1)
});
QUnit.test( "each", function( assert ) {
    var blank = $groovy([]), valid = $groovy([1,2,3])
    // test blank
    var tmp = []
    var addToTmp = function(a,b,c){ return c[c.length] = a*3+b }
    blank.each(addToTmp)
    assert.strictEqual(tmp.join(','), '')
    // test valid
    tmp = []
    valid.each(addToTmp, tmp)
    assert.strictEqual(tmp.join(','), '3,7,11')
    // test closure
    tmp = []
    valid.each('c[c.length] = a*3+b', tmp)
    assert.strictEqual(tmp.join(','), '3,7,11')
});
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
});
QUnit.module( "Objects" );
