/**
 *
 * These unit tests, test that valid datatypes are handled correctly.
 *
 */

/* ====== Start Setup ====== */

var defaultFunction = function(){
    var args = Array.prototype.slice.call(arguments)
	var response = 'defaultFunction -> arguments: ' + RulesEngine.objectToString(args[0])
    return response
}

var obj1 = {a:1}, obj2 = {b:2}, obj3 = {c:3}, obj4 = {d:4}
var startsWithAA = function(a){ return a && a.indexOf && a.indexOf('AA') == 0 }
var startsWithBB = function(a){ return a && a.indexOf && a.indexOf('BB') == 0 }

var rules1 = [ /* Test Simple Datatypes */
  ['c1',            'c2',           'p_out1',       'p_out2'        ], // Controls / Parameters
  // ---------------------------------------------------------------|
  ['string1',       'string2',      'aaa',          'bbb',          ], // Strings
  [123,             456,            111,            222,            ], // Numbers
  [true,            false,          true,           false,          ], // Booleans
  [obj1,            obj2,           obj3,           obj4,           ], // Objects
  [[1,2],           [3,4],          [5,6],          [7,8],          ], // Arrays
  [startsWithAA,    startsWithBB,   startsWithAA,   startsWithBB,   ], // Functions
  [undefined,       undefined,      undefined,      undefined,      ], // Undefined
  [null,            null,           null,           null,           ], // Null
]

var rules2 = [ /* Test Undefined/Null/Blanks */
  ['c1',            'c2',           'p_out1',       'p_out2'        ],
  // ---------------------------------------------------------------|
  ['string1',       'string2',      'aaa',          'bbb'           ],
]

var rules3 = [ /* Test wildcards */
  ['c1',            'c2',           'p_out1',       'p_out2'        ],
  // ---------------------------------------------------------------|
  ['string1',       'string2',      'aaa',          'bbb'           ],
  [_RE.WC,          _RE.WC,         'WC1',          'WC2'           ], // Wildcard
]

var thenOverride1 = function(a){ return 'one' }
var thenOverride2 = function(a){ return 'two' }

var rules4 = [ /* Test override 'then' functions */
  ['scenario',  'p_out1'    ],
  // -----------------------|
  ['one',       'param1',   ],
  ['two',       'param2',   thenOverride2],
]

var engine1 = RulesEngine.build(rules1, defaultFunction)
var engine2 = RulesEngine.build(rules2, defaultFunction)
var engine3 = RulesEngine.build(rules3, defaultFunction)

// test default and override "then" functions
var engine4 = RulesEngine.build(rules4)
var engine5 = RulesEngine.build(rules4, thenOverride1)

/* ====== End of setup ====== */

QUnit.module( "--- Undefined/Null/Blank ---" );

QUnit.test( "undefined object should log error", function( assert ) {
    assert.ok( engine2.evaluate() == null )
});
QUnit.test( "null object should log error", function( assert ) {
    assert.ok( engine2.evaluate(null) == null )
});
QUnit.test( "blank object should not match anything", function( assert ) {
    assert.ok( engine2.evaluate({}) == null )
});

QUnit.module( "--- Simple Datatypes ---" );

// Strings
QUnit.test( "Strings that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'string1',c2:'string2'}) == 'defaultFunction -> arguments: (out1=aaa,out2=bbb)' )
});
QUnit.test( "Strings that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'stringXX',c2:'stringYY'}) == null )
});

// Numbers
QUnit.test( "Numbers that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:123,c2:456}) == 'defaultFunction -> arguments: (out1=111,out2=222)' )
});
QUnit.test( "Numbers that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:456,c2:123}) == null )
});

// Booleans
QUnit.test( "Booleans that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:true,c2:false}) == 'defaultFunction -> arguments: (out1=true,out2=false)' )
});
QUnit.test( "Booleans that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:false,c2:true}) == null )
});

// Objects
QUnit.test( "Objects that match (N.B. compare by reference, not deep comparison!)", function( assert ) {
    assert.ok( engine1.evaluate({c1:obj1,c2:obj2}) == 'defaultFunction -> arguments: (out1=[object Object],out2=[object Object])' )
});
QUnit.test( "Objects that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:{a:1},c2:{b:2}}) == null ) // (not the same object references)
});

// Functions
QUnit.test( "Functions that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'AA1',c2:'BB2'}) == 'defaultFunction -> arguments: (out1=function,out2=function)' )
});
QUnit.test( "Functions that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:'FOO',c2:'BAR'}) == null )
});

// Undefined
QUnit.test( "Undefined that match", function( assert ) {
    assert.ok( engine1.evaluate({}) == 'defaultFunction -> arguments: (out1=undefined,out2=undefined)' )
});
QUnit.test( "Undefined that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c2:'BAR'}) == null )
});

// Null */
QUnit.test( "Null that match", function( assert ) {
    assert.ok( engine1.evaluate({c1:null,c2:null}) == 'defaultFunction -> arguments: (out1=null,out2=null)' )
});
QUnit.test( "Null that don't match", function( assert ) {
    assert.ok( engine1.evaluate({c1:null,c2:'bar'}) == null )
});

// Wildcard - (N.B. wildcard is simply a function, that always evaluates to true!)
QUnit.test( "Wildcards (always match)", function( assert ) {
    assert.ok( engine3.evaluate({c1:'foo',c2:null}) == 'defaultFunction -> arguments: (out1=WC1,out2=WC2)' )
});
// No negative scenario because wildcards (by their nature) always match!

QUnit.module( "--- 'Then' Functions ---" );

QUnit.test( "No default, no override", function( assert ) {
    assert.ok( engine4.evaluate({scenario:'one'}) == null )
});
QUnit.test( "No default w/ override", function( assert ) {
    assert.ok( engine4.evaluate({scenario:'two'}) == 'two' )
});
QUnit.test( "Default, no override", function( assert ) {
    assert.ok( engine5.evaluate({scenario:'one'}) == 'one' )
});
QUnit.test( "Default w/ override", function( assert ) {
    assert.ok( engine5.evaluate({scenario:'two'}) == 'two' )
});



