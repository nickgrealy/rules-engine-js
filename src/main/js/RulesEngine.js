/**

Standalone implementation of a rules engine.

Author: Nick Grealy
Date: 04/07/2014

Example Usage:

var then1 = function(){console.log('exec scenario1'); return 1; },
    then2 = function(){console.log('exec scenario2'); return 2; },
    then3 = function(){console.log('exec scenario3'); return 3; };

var rules = [
  ['outcome',       'documentToProduce'],
  ['Review Held',   'ROA Short Form',       then1],
  ['Review Held',   'ROA Short Formx',      then2],
  ['Review Held',   ,                       then3]
]

var engine = RulesEngine.build(rules)
var result = engine.evaluate({outcome: 'Review Held', documentToProduce: 'ROA Short Formxx'})  // exec scenario1
// result = 1

 */

if (!Array.prototype.compare){
    Array.prototype.compare = function(array2) {
        var inter = []
        var tmp1 = this.slice()
        var tmp2 = array2.slice()
        for (var i = this.length-1; i > -1; i--){
            var idx = tmp2.indexOf(this[i])
            // destructive, only count matches once
            if (idx > -1){
                tmp1.splice(i, 1)
                tmp2.splice(idx, 1)
                inter[inter.length] = this[i]
            }
        }
        var areEqual = tmp1.length == 0 && tmp2.length == 0
        return {intersection: inter, leftComplement: tmp1, rightComplement: tmp2, left: tmp1, right: tmp2, equal: areEqual}
    }
}
 
var RulesEngine = {

    wildcard:   function(){return true},
    all:        function(){return true},
    debug:      false,

    build: function(twoDimRulesArray, defaultFunction, multiMode){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        if (logDebug){ console.log('=== Building Rules Engine ===') }
        multiMode = typeof multiMode === 'undefined' ? false : multiMode
        var rules = this.buildRules(twoDimRulesArray, defaultFunction)
        return {
            evaluate: function(inputs){
                var logDebug = typeof console !== 'undefined' && thiz.debug
                if (typeof inputs === 'undefined' || inputs == null){
                    if (logDebug){ console.error('Cannot evaluate null or undefined input!') }
                    return
                }
                if (logDebug){ console.log('--- Evaluating inputs= '+thiz.objectToString(inputs)+' ---') }
                var returnResponse = null
                for (var i = 0; i < rules.length; i++){
                    if (thiz.equals(rules[i].condition, inputs)){    // if we have a match
                        if (typeof rules[i].then !== 'undefined'){
                            var response = rules[i].then(rules[i].params)
                            if (logDebug){ console.log('Found rule match: ' + rules[i].toString() + ' output:' + response) }
                            returnResponse = response
                        } else {
                            if (logDebug){ console.log('Cannot execute undefined function!') }
                        }
                        if (!multiMode){
                            break
                        }
                    }
                }
                if (returnResponse == null){
                    if (logDebug){ console.log('Response was null for inputs: ' + thiz.objectToString(inputs)) }
                }
                return returnResponse
            }
        };
    },

    buildRules: function(twoDimensionalArray, defaultFunction){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var rules = []
        if (typeof twoDimensionalArray === 'undefined' || twoDimensionalArray == null || typeof twoDimensionalArray.length === 'undefined' || twoDimensionalArray.length == 0){
            throw 'twoDimensionalArray must be a two dimensional array!'
        }
        var tmp = twoDimensionalArray[0] // first row is the list of fields
        var nonStrings = thiz.findAll(tmp, function(a){ return typeof a !== 'string' })
        if (nonStrings.length > 0){
            var mesg = 'Header row must only contain strings! headers=' + tmp.join(',')
            if (logDebug){ console.error(mesg) }
            throw mesg
        }
        var fieldNames = thiz.findAll(tmp, function(a){ return a.indexOf && a.indexOf('p_') === -1 })
        var inputNames = thiz.collect(tmp, function(a){ if (a.indexOf && a.indexOf('p_') === 0){ return a.substring(2) } }) // this performance could be improved
		if (fieldNames.length == 0){
			throw 'Could not find any field names! headerRow=' + tmp.join(',')
		}
        var expectedLength = fieldNames.length + inputNames.length
        for (var i = 1; i < twoDimensionalArray.length; i++){
            if (typeof twoDimensionalArray[i] !== 'undefined'){
                var actualLen = twoDimensionalArray[i].length
                if (actualLen != expectedLength && actualLen != expectedLength+1){
                    throw 'Expected length='+expectedLength+' but found length='+twoDimensionalArray[i].length+'! row#='+i
                }
                var tmp = this.buildRule(fieldNames, inputNames, twoDimensionalArray[i], defaultFunction)
                if (logDebug){ console.log(tmp.toString()) }
                if (typeof tmp !== 'undefined' && tmp !== null){
                    rules[rules.length] = tmp
                }
            } else {
                if (logDebug){ console.log('Rejecting undefined row: #' + i + ' headers=' + fieldNames.join(',')) }
            }
        }
        return rules
    },

    buildRule: function(fieldNames, inputNames, conditions, defaultCondition){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        if (typeof defaultCondition === 'undefined'){
            if (logDebug){ console.log('Found undefined defaultFunction, replacing with placeholder...') }
            defaultCondition = function(){}
        }
        if (typeof conditions !== 'undefined'){
            var fnlen = fieldNames.length, inlen = inputNames.length
            var conditionObject = {}
            for (var i = 0; i < fnlen; i++){
                conditionObject[fieldNames[i]] = conditions[i]
            }
            var inputObject = {}
            for (var i = 0; i < inlen; i++){
                inputObject[inputNames[i]] = conditions[i + fnlen]
            }
            var thenCondition = defaultCondition
            if ((fnlen + inlen) < conditions.length && typeof conditions[conditions.length-1] === 'function'){
                thenCondition = conditions[conditions.length-1]
            }
            return {condition: conditionObject, params: inputObject, then: thenCondition, toString: function(){
                return "Rule={ conditions: " + thiz.objectToString(conditionObject) + ", params: " + thiz.objectToString(inputObject) + ", then: "+ typeof thenCondition+" }"
            }}
        }
    },
    
    objectToString: function(map){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var keys = this.getKeys(map)
        var string = '('
        if (keys.length > 0){
            string += keys[0]+'='+ (typeof map[keys[0]] === 'function' ? 'function' : map[keys[0]])
        }
        if (keys.length > 1){
            for (var i = 1; i < keys.length; i++){
                string += ','+keys[i]+'='+(typeof map[keys[i]] === 'function' ? 'function' : map[keys[i]])
            }
        }
        string += ')'
        return string
    },
    
    getKeys: function(obj){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var keys = []
        for(var key in obj){
            if (obj.hasOwnProperty(key)) {
                keys[keys.length] = key
            }
        }
        return keys
    },
    
    /* -- N.B. These below methods should be in a common library. -- */

    /* does a deep match, of 1st level fields, of an object */
    equals: function(a, b){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var keys = thiz.getKeys(a)
        if (logDebug){ console.log('Checking keys: ' + keys.join(',')) }
        for (var i = 0; i < keys.length; i++){
            var field = keys[i]
            // check if a is null or undefined, if so, compare using ===
            var aIsNull = typeof a[field] === 'undefined' || a[field] === null
            // check if the objects match
            var matches = (aIsNull ? a[field] === b[field] : a[field] == b[field]) 
                || (typeof a[field] === 'function' && a[field](b[field]))   // function
                || (a[field] instanceof Array && b[field] instanceof Array && a[field].compare(b[field]).equal)   // array
            if (!matches){
                if (logDebug){ console.log('Rejecting match on field [rule, actual] -> ' + field + ' [' + a[field] + ' != ' + b[field] + ']') }
                return false;
            } else {
                if (logDebug){ console.log('Found match on field [rule, actual] -> ' + field + ' [' + a[field] + ' == ' + b[field] + ']') }
            }
        }
        // everything matches, return true!
        return true;
    },
    
    /* finds all matches - see groovy! */ 
    findAll: function(list, closure){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var tmp=[], clos = closure;
        if (typeof list === 'undefined' || list == null){
            return tmp
        }
        for (var i=0;i<list.length;i++){
            if (clos(list[i])){
                tmp[tmp.length] = list[i];
            }
        }
        return tmp;
    },
    
    /* collects all non-undefined objects */ 
    collect: function(list, closure){
        var thiz = this, logDebug = typeof console !== 'undefined' && thiz.debug
        var tmp=[], clos = closure;
        if (typeof list === 'undefined' || list == null){
            return tmp
        }
        for (var i=0;i<list.length;i++){
            var val = clos(list[i], i)
            if (typeof val !== 'undefined'){ tmp[tmp.length] = val };
        }
        return tmp;
    }
};
var _re = RulesEngine
