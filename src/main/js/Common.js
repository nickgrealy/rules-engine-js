/** 
 * Common Module - provides a list of common functions.
 */
var Common = (function(thiz) {

    // public

    /** Returns true if the given object is undefined. */
    thiz.isUndef = function(obj) {
        return typeof obj === 'undefined';
    };

    /** Returns true if the given object is not undefined. */
    thiz.isDef = function(obj) {
        return typeof obj !== 'undefined';
    };

    /** Returns true if the given object is a function. */
    thiz.isFn = function(obj) {
        return typeof obj === 'function';
    };

    /** Returns true if the given object is a function. */
    thiz.isNotFn = function(obj) {
        return typeof obj !== 'function';
    };

    /** Gets the value of an object property, given a property path. */
    thiz.getValue = function(obj, path) {
        path = path.split('.');
        for (var i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]];
        }
        return obj[path[i]];
    };

    /** Sets the value of an object property, given a property path. */
    thiz.setValue = function(obj, path, value) {
        path = path.split('.');
        for (var i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]];
        }
        obj[path[i]] = value;
    };

    /** For each loop for non-array type objects. */
    thiz.forEach = function(array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, array[i], i);
        }
    };

    /** Converts an object to a JSON-like string. */
    thiz.objectToString = function(object) {
        return "(" + Object.keys(object).map(
            function(key) {
                return key + "=" + (thiz.isFn(object[key]) ? 'function' : object[key]);
            }
        ).join(",") + ")";
    };

    /** does a deep match, of 1st level fields, of an object */
    thiz.equals = function(a, b) {
        var logDebug = thiz.isDef(console) && thiz.debug;
        var keys = Object.keys(a);
        if (logDebug) {
            console.log('-> Checking keys: ' + keys.join(','));
        }
        for (var i = 0; i < keys.length; i++) {
            var field = keys[i];
            // check if a is null or undefined, if so, compare using ===
            var aIsNull = thiz.isUndef(a[field]) || a[field] === null;
            // check if the objects match
            var matches = (aIsNull ? a[field] === b[field] : a[field] == b[field]) || (thiz.isFn(a[field]) && a[field](b[field])) || (a[field] instanceof Array && b[field] instanceof Array && a[field].compare(b[field]).equal); // array
            if (!matches) {
                if (logDebug) {
                    console.log('-> Rejecting match on field [rule, actual] -> ' + field + ' [' + a[field] + ' != ' + b[field] + ']');
                }
                return false;
            } else {
                if (logDebug) {
                    console.log('-> Found match on field [rule, actual] -> ' + field + ' [' + a[field] + ' == ' + b[field] + ']');
                }
            }
        }
        // everything matches, return true!
        return true;
    };
    
    /** Transposes a 2d array. */
    thiz.transpose = function(a) {
        return Object.keys(a[0]).map(
            function(c) {
                return a.map(function(r) {
                    return r[c];
                });
            }
        );
    };

    return thiz;

}(Common || {}));

/**
 * Contains tools for building rules.
 */
var RulesTools = (function(thiz, Common) {
    
    if (typeof Common === 'undefined'){
        throw 'The "Common" library is not loaded!'
    }

    // private

    var defaultInputsSelector = 'textarea, select option:checked, input[type=text], input[type=password], input[type=radio]:checked, input[type=checkbox]:checked';
    
    // public
    
	thiz.wildcard = function(){return true;};
	thiz.all      = function(){return true;};
	thiz.any      = function(){return true;};
	
    /** Returns a function which performs an attribute update. */
    thiz.setHTMLElementPropertyValueFn = function(attPath) {
        var thiz = this;
        return function(querySelector){
            return function(value) {
                // TODO: can these be defined (once) higher up?
                var els = document.querySelectorAll(querySelector);
                var setPropFn = function(el, i) {
                    Common.setValue(el, attPath, value);
                };
                Common.forEach(els, setPropFn);
            };
        };
    };
	
    /** Returns a function which performs an attribute update. */
    thiz.applyHTMLElementFunctionFn = function(funcName) {
        var thiz = this;
        return function(querySelector){
            return function(arrayParams) {
                if (Common.isDef(arrayParams)){
                    // TODO: can these be defined (once) higher up?
                    var els = document.querySelectorAll(querySelector);
                    var applyFuncFn = function(el, i) {
                        el[funcName].apply(el, arrayParams);
                    };
                    Common.forEach(els, applyFuncFn);
                }
            };
        };
    };

    /** Builds a map of input values. */
    thiz.buildValuesMap = function(contextElements, inputsSelector) {
        inputsSelector = typeof inputsSelector === 'undefined' ? defaultInputsSelector : inputsSelector;
        var map = {};
        /*
        var elements = dojo.query(contextElements).query(inputsSelector)
        
        elements.forEach(function(el){
            // get name OR id of element OR parent
			try {
				var id = 
					typeof el.name !== 'undefined' && el.name != '' ? el.name : 
					typeof el.id !== 'undefined' && el.id != '' ? el.id :
					dojo.query(el).parent("*[id]")[0].id;
				var newval = BTUtilsExt.getValue2(el);
				var oldval = map[id];
				// if multiple values, add to existing array, otherwise set to newval
				if (typeof oldval === 'undefined'){
					map[id] = newval
				} else if (BTUtilsExt.isArray(oldval)){
					oldval[oldval.length] = newval
				} else {
					map[id] = [oldval, newval]
				}
			} catch (err){
				if (typeof console !== 'undefined'){ console.log('Warn: ' + err); }
			}
        })
            */
        return map;
    };

    thiz.innerHTML = thiz.setHTMLElementPropertyValueFn('innerHTML');
    thiz.value = thiz.setHTMLElementPropertyValueFn('value');
    thiz.placeholder = thiz.setHTMLElementPropertyValueFn('placeholder');
    thiz.display = thiz.setHTMLElementPropertyValueFn('style.display');
    thiz.width = thiz.setHTMLElementPropertyValueFn('style.width');
    thiz.height = thiz.setHTMLElementPropertyValueFn('style.height');
    thiz.required = thiz.setHTMLElementPropertyValueFn('required');
    
    thiz.focus = thiz.applyHTMLElementFunctionFn('focus');

    thiz.showHideClear = function(querySelector, doClearFlag) {
        var doClear = Common.isDef(doClearFlag) ? doClearFlag : false;
        var setDisplay = thiz.display(querySelector);
        var setValue = thiz.value(querySelector);
        return function(value){
            if (Common.isDef(value)){
                var isShow = value == 'show';
                setDisplay(isShow ? 'inline-block' : 'none');
                if (doClearFlag && !isShow){
                    // TODO Ensure setValue works on all child input types
                    setValue('');
                }
            }
        };
    };
    
    return thiz;

}(RulesTools || {}, Common));