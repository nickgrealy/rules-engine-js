
/**
 * Test multiple datatype combinations
 * Test ordering of rules (i.e. two rules that match, make sure first rule is executed only)
 */

// Setup
 
var flagF1, flagF2, flagF3
var f1 = function(){ flagF1 = true; return 'f1'}
var f2 = function(){ flagF2 = true; return 'f2'}
var f3 = function(){ flagF3 = true; return 'f3'}
function reset(){ flagF1 = false; flagF2 = false; flagF3 = false}
reset()

var rules21 = [ /* Rule matching / ordering */
  ['c1',    'c2',   ],
  // ---------------|
  ['AA',    _re.all,    f1],
  [_re.all, _re.all,    f2],
  ['BB',    _re.all,    f3],
]

var rules22 = [ /* Combined datatypes */
  ['c1',    'c2',   ],
  // ---------------|
  ['AA',    111,    f1],
  [true,    [4,3],  f2],
]

var engine21 = _re.build(rules21, undefined, true) // rule matching / ordering
var engine22 = _re.build(rules22) // combined datatypes

// Setup end


QUnit.module( "--- Single Rule Matching (and multi data types) ---" );

QUnit.test( "only first matching rule should match", function( assert ) {
    assert.ok( engine22.evaluate({c1:'AA',c2:111}) == 'f1' )
    assert.ok( flagF1 == true )
    assert.ok( flagF2 == false )
    reset()
    assert.ok( engine22.evaluate({c1:'AA',c2:'111'}) == 'f1' )
    assert.ok( flagF1 == true )
    assert.ok( flagF2 == false )
    reset()
    assert.ok( engine22.evaluate({c1:true,c2:[3,4]}) == 'f2' )
    assert.ok( flagF1 ==  false)
    assert.ok( flagF2 == true )
    reset()
    assert.ok( engine22.evaluate({c1:true,c2:[4,3]}) == 'f2' )
    assert.ok( flagF1 ==  false)
    assert.ok( flagF2 == true )
    reset()
});

QUnit.module( "--- Multi Rule Matching ---" );

QUnit.test( "all matching rules should match", function( assert ) {
    assert.ok( engine21.evaluate({c1:'AA',c2:111}) == 'f2' )
    assert.ok( flagF1 == true )
    assert.ok( flagF2 == true )
    assert.ok( flagF3 == false )
    reset()
    assert.ok( engine21.evaluate({c1:'AA',c2:'111'}) == 'f2' )
    assert.ok( flagF1 == true )
    assert.ok( flagF2 == true )
    assert.ok( flagF3 == false )
    reset()
    assert.ok( engine21.evaluate({c1:true,c2:[3,4]}) == 'f2' )
    assert.ok( flagF1 == false)
    assert.ok( flagF2 == true )
    assert.ok( flagF3 == false )
    reset()
    assert.ok( engine21.evaluate({c1:true,c2:[4,3]}) == 'f2' )
    assert.ok( flagF1 == false)
    assert.ok( flagF2 == true )
    assert.ok( flagF3 == false )
    reset()
});