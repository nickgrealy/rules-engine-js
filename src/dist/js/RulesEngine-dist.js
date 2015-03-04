// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of O with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
if (!Array.prototype.compare){
    Array.prototype.compare = function(array2) {
        var inter = []
        var tmp1 = this.slice(0)
        var tmp2 = array2.slice(0)
        for (var i = tmp1.length-1; i > -1; i--){
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
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
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
