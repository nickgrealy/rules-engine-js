/**

Standalone implementation of a rules engine.

Author: Nick Grealy
Date: 04/07/2014

TODO:
- use foreach method

 */
 
var isUndef = function(object){ return typeof object === 'undefined'; };
var isNotUndef = function(object){ return typeof object !== 'undefined'; };
var isFn = function(object){ return typeof object === 'function'; };

var RulesEngine = {

	version  : '1.0.2',
	wildcard : function(){return true},
	all      : function(){return true},
	debug    : false,

    buildEngine: function(inputsMap){
		return this.build(inputsMap.rules, inputsMap.defaultFn, inputsMap.multiMode)
	},
	
    build: function(twoDimRulesArray, defaultFunction, multiMode){
        var thiz = this, logDebug = isNotUndef(console) && thiz.debug
        if (logDebug){ console.log('-> === Building Rules Engine ===') }
        multiMode = isUndef(multiMode) ? false : multiMode
        var rules = this.buildRules(twoDimRulesArray, defaultFunction)
        return {
			version: thiz.version,
			privRules: rules,
            evaluate: function(inputs){
                var logDebug = isNotUndef(console) && thiz.debug
                if (isUndef(inputs) || inputs == null){
                    if (logDebug){ console.error('Cannot evaluate null or undefined input!') }
                    return
                }
                if (logDebug){ console.log('--- Evaluating inputs= '+thiz.objectToString(inputs)+' ---') }
                var returnResponse = null
				var ruleMatched = false
                for (var i = 0; i < rules.length; i++){
                    if (thiz.equals(rules[i].condition, inputs)){    // if we have a match
						ruleMatched = true
                        if (isNotUndef(rules[i].then)){
                            if (isNotUndef(console)){ console.log('-> Matched rule #' + i + ' - inputs=' + thiz.objectToString(inputs)) }
                            var response = rules[i].then(rules[i].params, inputs)
                            if (logDebug){ console.log('-> Found rule match: ' + rules[i].toString() + ' output:' + response) }
                            returnResponse = response
                        } else {
                            if (logDebug){ console.log('Cannot execute undefined function!') }
                        }
                        if (!multiMode){
                            break
                        }
                    }
                }
                if (!ruleMatched){
                    if (isNotUndef(console)){ console.log('-> No rule matched - inputs=' + thiz.objectToString(inputs)) }
                }
                return returnResponse
            }
        };
    },

    buildRules: function(twoDimensionalArray, defaultFunction){
        var thiz = this, logDebug = isNotUndef(console) && thiz.debug
        var rules = []
        if (isUndef(twoDimensionalArray) || twoDimensionalArray == null || isUndef(twoDimensionalArray.length) || twoDimensionalArray.length == 0){
            throw 'twoDimensionalArray must be a two dimensional array!'
        }
        var tmp = twoDimensionalArray[0] // first row is the list of fields
        var nonStrings = tmp.filter(function(a){ return typeof a !== 'string' })
        if (nonStrings.length > 0){
            var mesg = 'Header row must only contain strings! headers=' + tmp.join(',')
            if (logDebug){ console.error(mesg) }
            throw mesg
        }
        var fieldNames = tmp.filter(function(a){ return a.indexOf && a.indexOf('p_') === -1 })
        var inputNames = tmp.map(function(a){ if (a.indexOf && a.indexOf('p_') === 0){ return a.substring(2) } }).filter(isNotUndef) // this performance could be improved
		if (fieldNames.length == 0){
			throw 'Could not find any field names! headerRow=' + tmp.join(',')
		}
        var expectedLength = fieldNames.length + inputNames.length
        for (var i = 1; i < twoDimensionalArray.length; i++){
            if (isNotUndef(twoDimensionalArray[i])){
                var actualLen = twoDimensionalArray[i].length
                if (actualLen != expectedLength && actualLen != expectedLength+1){
                    throw 'Expected length='+expectedLength+' but found length='+twoDimensionalArray[i].length+'! row#='+i
                }
                var tmp = this.buildRule(fieldNames, inputNames, twoDimensionalArray[i], defaultFunction)
                if (logDebug){ console.log(tmp.toString()) }
                if (isNotUndef(tmp) && tmp !== null){
                    rules[rules.length] = tmp
                }
            } else {
                if (logDebug){ console.log('Rejecting undefined row: #' + i + ' headers=' + fieldNames.join(',')) }
            }
        }
        return rules
    },

    buildRule: function(fieldNames, inputNames, conditions, defaultCondition){
        var thiz = this, logDebug = isNotUndef(console) && thiz.debug
        if (isUndef(defaultCondition)){
            if (logDebug){ console.log('-> Found undefined defaultFunction, replacing with placeholder...') }
            defaultCondition = function(){}
        }
        if (isNotUndef(conditions)){
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
            if ((fnlen + inlen) < conditions.length && isFn(conditions[conditions.length-1])){
                thenCondition = conditions[conditions.length-1]
				if (logDebug){ console.log("-> Using override function.") }
            } else {
				if (logDebug){ console.log("-> Using default function - check1=" + thiz.objectToString(conditions)) }
			}
            return {condition: conditionObject, params: inputObject, then: thenCondition, toString: function(){
                return "Rule={ conditions: " + thiz.objectToString(conditionObject) + ", params: " + thiz.objectToString(inputObject) + ", then: "+ typeof thenCondition+" }"
            }}
        }
    },
    
    /* -- N.B. These below methods should be in a common library. -- */
    
    objectToString: function(map){
        var thiz = this, logDebug = isNotUndef(console) && thiz.debug
        var keys = Object.keys(map)
        var string = '('
        if (keys.length > 0){
            string += keys[0]+'='+ (isFn(map[keys[0]]) ? 'function' : map[keys[0]])
        }
        if (keys.length > 1){
            for (var i = 1; i < keys.length; i++){
                string += ','+keys[i]+'='+(isFn(map[keys[i]]) ? 'function' : map[keys[i]])
            }
        }
        string += ')'
        return string
    },

    /* does a deep match, of 1st level fields, of an object */
    equals: function(a, b){
        var thiz = this, logDebug = isNotUndef(console) && thiz.debug
        var keys = Object.keys(a)
        if (logDebug){ console.log('-> Checking keys: ' + keys.join(',')) }
        for (var i = 0; i < keys.length; i++){
            var field = keys[i]
            // check if a is null or undefined, if so, compare using ===
            var aIsNull = isUndef(a[field]) || a[field] === null
            // check if the objects match
            var matches = (aIsNull ? a[field] === b[field] : a[field] == b[field]) 
                || (isFn(a[field]) && a[field](b[field]))   // function
                || (a[field] instanceof Array && b[field] instanceof Array && a[field].compare(b[field]).equal)   // array
            if (!matches){
                if (logDebug){ console.log('-> Rejecting match on field [rule, actual] -> ' + field + ' [' + a[field] + ' != ' + b[field] + ']') }
                return false;
            } else {
                if (logDebug){ console.log('-> Found match on field [rule, actual] -> ' + field + ' [' + a[field] + ' == ' + b[field] + ']') }
            }
        }
        // everything matches, return true!
        return true;
    }
    
};
var _re = RulesEngine
