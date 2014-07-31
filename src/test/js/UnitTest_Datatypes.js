/**
 *
 * These unit tests, test that valid datatypes are handled correctly.
 *
 */

/* --- Setup --- */

var defaultFunction = function(){
    var args = Array.prototype.slice.call(arguments)
	var response = 'defaultFunction -> arguments: ' + RulesEngine.objectToString(args[0])
    return response
}

var obj1 = {a:1}, obj2 = {b:2}, obj3 = {c:3}, obj4 = {d:4}
var startsWithAA = function(a){return a.c1.toString().indexOf('AA') == 0}
var startsWithBB = function(a){return a.c1.toString().indexOf('BB') == 0}

var rules1 = [
  ['c1',        'c2',       'p_out1',   'p_out2'    ], // Controls / Parameters
  
  ['string1',   'string2',  'aaa',      'bbb'       ], // Strings
  [123,         456,        111,        222         ], // Numbers
  [true,        false,      true,       false       ], // Booleans
  [obj1,        obj2,       obj3,       obj4        ], // Objects
  [[1,2],       [3,4],      [5,6],      [7,8]       ], // Arrays
  [startsWithAA,   startsWithBB,  startsWithAA,  startsWithBB   ], // Function
  /*
  //[undefined,   undefined,  undefined,  undefined   ], // Undefined
  //[null,        null,       null,       null        ], // Null
  //[_RE.WC,        _RE.WC,      _RE.WC,       _RE.WC       ], // Wildcard
  // */
]

var prefix = '[engine1 w/ default function] - '
var engine1 = RulesEngine.build(rules1, defaultFunction)

/* --- Tests --- */

QUnit.test( prefix + "blank object (i.e. no matches)", function( assert ) {
    assert.ok( engine1.evaluate({}) == null )
});

// Strings
QUnit.test( prefix + "Strings that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'string1',c2:'string2'}) == 'defaultFunction -> arguments: (out1=aaa,out2=bbb)' )
});
QUnit.test( prefix + "Strings that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'stringXX',c2:'stringYY'}) == null )
});

// Numbers
QUnit.test( prefix + "Numbers that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:123,c2:456}) == 'defaultFunction -> arguments: (out1=111,out2=222)' )
});
QUnit.test( prefix + "Numbers that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:456,c2:123}) == null )
});

// Booleans
QUnit.test( prefix + "Booleans that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:true,c2:false}) == 'defaultFunction -> arguments: (out1=true,out2=false)' )
});
QUnit.test( prefix + "Booleans that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:false,c2:true}) == null )
});

// Objects
QUnit.test( prefix + "Objects that match (N.B. compare by reference, not deep comparison!)", function( assert ) {
    assert.ok( engine1.evaluate({c1:obj1,c2:obj2}) == 'defaultFunction -> arguments: (out1=[object Object],out2=[object Object])' )
});
QUnit.test( prefix + "Objects that don't match", function( assert ) {
    //_RE.debug = true
    assert.ok( engine1.evaluate({c1:{a:1},c2:{b:2}}) == null ) // (not the same object references)
    //_RE.debug = false
});

/*
// Functions
QUnit.test( prefix + "Functions that match", function( assert ) {
    _RE.debug=true
    assert.ok( engine1.evaluate({c1:'AA1',c2:'BB2'}) == 'defaultFunction -> arguments: (out1=[object Object],out2=[object Object])' )
    _RE.debug=false
});
QUnit.test( prefix + "Functions that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'FOO',c2:'BAR'}) == null )
});

//*/




