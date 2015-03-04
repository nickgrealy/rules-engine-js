/**

Standalone implementation of a rules engine.

Author: Nick Grealy
Date: 04/07/2014

 */
var isUndef    = function(object){ return typeof object === 'undefined'; };
var isNotUndef = function(object){ return typeof object !== 'undefined'; };
var isFn       = function(object){ return typeof object === 'function';  };

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
                    if (isNotUndef(console)){ console.error('-> Cannot evaluate null or undefined input!') }
                    return
                }
                if (logDebug){ console.log('-> Evaluating inputs= '+thiz.objectToString(inputs)+' ---') }
                var returnResponse = null
				var ruleMatched = false
                for (var i = 0; i < rules.length; i++){
                    var rule = rules[i]
                    if (thiz.equals(rule.condition, inputs)){    // if we have a match
						ruleMatched = true
                        if (isNotUndef(rule.then)){
                            if (isNotUndef(console)){ console.log('-> Matched rule #' + i + ' - inputs=' + thiz.objectToString(inputs)) }
                            var response = rule.then(rule.params, inputs)
                            if (logDebug){ console.log('-> Found rule match: ' + rule.toString() + ' output:' + response) }
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
        var headers = twoDimensionalArray[0] // first row is the list of fields
        var nonStrings = headers.filter(function(a){ return typeof a !== 'string' })
        if (nonStrings.length > 0){
            var mesg = 'Header row must only contain strings! headers=' + headers.join(',')
            if (logDebug){ console.error(mesg) }
            throw mesg
        }
        var fieldNames = headers.filter(function(a){ return a.indexOf && a.indexOf('p_') === -1 })
        var inputNames = headers.map(function(a){ if (a.indexOf && a.indexOf('p_') === 0){ return a.substring(2) } }).filter(isNotUndef) // this performance could be improved
		if (fieldNames.length == 0){
			throw 'Could not find any field names! headerRow=' + headers.join(',')
		}
        var expectedLength = fieldNames.length + inputNames.length
        for (var i = 1; i < twoDimensionalArray.length; i++){
            var row = twoDimensionalArray[i]
            if (isNotUndef(row)){
                var actualLen = row.length
                if (actualLen != expectedLength && actualLen != expectedLength+1){
                    throw 'Expected length='+expectedLength+' but found length='+row.length+'! row#='+i
                }
                var rule = this.buildRule(fieldNames, inputNames, row, defaultFunction)
                if (logDebug){ console.log(rule.toString()) }
                if (isNotUndef(rule) && rule !== null){
                    rules[rules.length] = rule
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
            // build condition and input objects
            var fnlen = fieldNames.length
            var inlen = inputNames.length
            var conditionObject = {}, inputObject = {}
            fieldNames.forEach(function(fld, i){ conditionObject[fld] = conditions[i] })
            inputNames.forEach(function(fld, i){ inputObject[fld] = conditions[i+fnlen] })
            // determine then function
            var thenCondition
            var overrideCondition = conditions[conditions.length-1]
            if ((fnlen + inlen) < conditions.length && isFn(overrideCondition)){
                thenCondition = overrideCondition
				if (logDebug){ console.log("-> Using override function.") }
            } else {
                thenCondition = defaultCondition
				if (logDebug){ console.log("-> Using default function - check1=" + thiz.objectToString(conditions)) }
			}
            return {condition: conditionObject, params: inputObject, then: thenCondition, toString: function(){
                return "Rule={ conditions: " + thiz.objectToString(conditionObject) + ", params: " + thiz.objectToString(inputObject) + ", then: "+ typeof thenCondition+" }"
            }}
        }
    },
    
    /* -- N.B. These below methods should be in a common library. -- */
    
    objectToString: function(object){
        return "("+Object.keys(object).map(
            function(key){ return key+"="+(isFn(object[key]) ? 'function' : object[key]); }
            ).join(",")+")"
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
