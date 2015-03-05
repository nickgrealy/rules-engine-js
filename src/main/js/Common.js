/** 
 * Common Module - provides a list of common functions.
 */
var Common = (function(thiz){
  
    // private
  
    var defaultInputsSelector = 'textarea, select option:checked, input[type=text], input[type=password], input[type=radio]:checked, input[type=checkbox]:checked';

    // public
  
    /** Returns true if the given object is undefined. */
    thiz.isUndef = function(obj){ return typeof obj === 'undefined'; };
  
    /** Returns true if the given object is not undefined. */
    thiz.isNotUndef = function(obj){ return typeof obj !== 'undefined'; };
  
    /** Returns true if the given object is a function. */
    thiz.isFn = function(obj){ return typeof obj === 'function'; };
  
    /** Gets the value of an object property, given a property path. */
	thiz.getValue = function(obj, path) {
		path = path.split('.');
		for (var i = 0; i < path.length - 1; i++){
		  obj = obj[path[i]];
		}
		return obj[path[i]];
	};
  
    /** Sets the value of an object property, given a property path. */
	thiz.setValue = function(obj, path, value) {
		path = path.split('.');
		for (var i = 0; i < path.length - 1; i++){
		  obj = obj[path[i]];
		}
		obj[path[i]] = value;
	};
  
    /** For each loop for non-array type objects. */
    thiz.forEach = function (array, callback, scope) {
      for (var i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i);
      }
    };
  
    /** Returns a function which performs an attribute update. */
	thiz.setAttributeValueFn = function(attPath, querySelector){
      var thiz = this;
	  return function(value){
		var els = document.querySelectorAll(querySelector);
		thiz.forEach(els, function(el, i){
		  thiz.setValue(el, attPath, value);
		});
	  };
	};
  
    /** Builds a map of input values. */
    thiz.buildValuesMap = function(contextElements, inputsSelector){
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
    
    var objectToString = function(object){
        return "("+Object.keys(object).map(
            function(key){ return key+"="+(thiz.isFn(object[key]) ? 'function' : object[key]); }
            ).join(",")+")";
    };
    
    return thiz;
  
}(Common || {}));
