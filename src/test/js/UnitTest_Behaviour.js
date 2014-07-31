
/* Constructor Tests - RulesEngine.build(...) */

// rules - test error scenarios

QUnit.module( "--- check headers (first row) are all strings ---" );

QUnit.test( "one string header should work", function( assert ) {
    assert.ok( _re.build([['one']]) )
});
QUnit.test( "one int header should fail", function( assert ) {
    assert.throws(
        function(){ _re.build([[123]]) }, 
        function(err){ return err.toString() === 'Header row must only contain strings! headers=123'}
    )
});
QUnit.test( "one boolean header should fail", function( assert ) {
    assert.throws(
        function(){ _re.build([[false]]) }, 
        function(err){ return err.toString() === 'Header row must only contain strings! headers=false'}
    )
});
QUnit.test( "one boolean header should fail", function( assert ) {
    assert.throws(
        function(){ _re.build([['one', false, 'two']]) }, 
        function(err){ return err.toString() === 'Header row must only contain strings! headers=one,false,two'}
    )
});

QUnit.module( "--- check 2 dimensional array is well formed ---" );

QUnit.test( "one dim array should fail", function( assert ) {
    assert.throws(
        function(){ _re.build([]) }, 
        function(err){ return err.toString() === 'twoDimensionalArray must be a two dimensional array!'}
    )
});
QUnit.test( "undefined should fail", function( assert ) {
    assert.throws(
        function(){ _re.build(); },
        function(err){ return err.toString() === 'twoDimensionalArray must be a two dimensional array!'}
    )
});
QUnit.test( "null should fail", function( assert ) {
    assert.throws(
        function(){ _re.build(null); },
        function(err){ return err.toString() === 'twoDimensionalArray must be a two dimensional array!'}
    )
});
QUnit.test( "Boolean should fail", function( assert ) {
    assert.throws(
        function(){ _re.build(false); },
        function(err){ return err.toString() === 'twoDimensionalArray must be a two dimensional array!'}
    )
});

// validate row lengths
QUnit.test( "check shorter rows throw exception", function( assert ) {
    assert.throws(
        function(){ _re.build([
            ['one','p_one'],
            ['one','p_one'],
            ['one'],
            ['one','p_one'],
        ]); },
        function(err){ return err.toString() === 'Expected length=2 but found length=1! row#=2'}
    )
});
QUnit.test( "check longer rows throw exception", function( assert ) {
    assert.throws(
        function(){ _re.build([
            ['one','p_one'],
            ['one','p_one'],
            ['one','p_one'],
            ['one','p_one',2,3],
        ]); },
        function(err){ return err.toString() === 'Expected length=2 but found length=4! row#=3'}
    )
});
QUnit.test( "check correct length row doesn't throw exception", function( assert ) {
    _re.build([
        ['one','p_one',],
        ['one','p_one'],
        ['one','p_one',],
        ['one','p_one',function(){}]
    ]);
    assert.ok(true)
});

QUnit.test( "check no conditions complains", function( assert ) {
    assert.throws(
        function(){ _re.build([[]]); },
        function(err){ return err.toString() === 'Could not find any field names! headerRow='}
    )
});
QUnit.test( "check single condition works", function( assert ) {
    assert.ok( _re.build([['one']]) )
});
QUnit.test( "check many conditions works", function( assert ) {
    assert.ok( _re.build([['one','two','three']]) )
});

QUnit.test( "check no params works", function( assert ) {
    assert.ok( _re.build([['one']]) )
});
QUnit.test( "check single param works", function( assert ) {
    assert.ok( _re.build([['one','p_one']]) )
});
QUnit.test( "check many params works", function( assert ) {
    assert.ok( _re.build([['one','p_one','p_two']]) )
});
