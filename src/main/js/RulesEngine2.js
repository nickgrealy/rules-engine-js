// requires Common.js

function RuleClass(conditions, execFns, execVals) {

    var expectedConditions = conditions;
    var arrayOfFn = execFns;
    var arrayOfParams = execVals;

    this.matches = function(actualConditions) {
        return Common.equals(expectedConditions, actualConditions);
    };

    this.execute = function() {
        arrayOfFn.forEach(function(fn, i) {
            fn(arrayOfParams[i])
        });
    }
}

/**
 * Standalone implementation of a rules engine.
 */
var RulesEngine = (function(thiz, Common){
    
    if (typeof Common === 'undefined'){
        throw 'The "Common" library is not loaded!'
    }
    
	thiz.version  = '2.0';
	
	thiz.log = function(message){
	    if (Common.isDef(console)){
	        console.log(message);
	    }
	}
	
    thiz.build = function(matrix, multiMode){
        var thiz = this;
        thiz.log('-> Building Rules Engine');
        return {
			version   : thiz.version,
			multiMode : Common.isUndef(multiMode) ? false : multiMode,
			rules     : thiz.buildRules(matrix),
            evaluate  : function(conditions){
                if (Common.isUndef(conditions) || conditions == null){
                    throw '-> Cannot evaluate null or undefined input!';
                }
				var ruleMatched = false;
				var rules = this.rules;
				for (var i = 0; i < rules.length; i++){
                    var rule = rules[i];
				    if (rule.matches(conditions)){
						thiz.log('-> Matched rule #' + i + ' - conditions=' + Common.objectToString(conditions));
				        ruleMatched = true;
				        rule.execute();
				        console.log(this.multiMode)
				        if (!this.multiMode){
				            break;
				        }
				    }
				}
                if (!ruleMatched){
                    thiz.log('-> No rule matched - conditions=' + Common.objectToString(conditions));
                }
            }
        };
    };

    /** Builds an array of rules from a matrix (i.e. two dimensional array). */
    thiz.buildRules = function(matrix){
        var rules = [];
        var headers = matrix[0];
        var data = matrix.splice(1);
        // iterate over the data...
        Common.forEach(data, function(row, rowIdx){
            var conditions = {}, execFns = [], execVals = [];
            Common.forEach(headers, function(header, colIdx){
                // if header is a function, and an 'execution'...
                if (Common.isFn(header)){
                    execFns.push(header);
                    execVals.push(row[colIdx]);
                } else {
                    // else header is NOT a function, and a 'condition'...
                    conditions[header] = row[colIdx]
                }
            });
            rules.push(new RuleClass(conditions, execFns, execVals));
        });
        return rules;
    };
    
    return thiz;
    
}(RulesEngine || {}, Common));
var _re = RulesEngine;
