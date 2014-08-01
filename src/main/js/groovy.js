
var $util = {
    isset: function(a){ return typeof a !== 'undefined' && a !== null },
    isundef: function(a){ return typeof a === 'undefined' }
}
$funky = function(body) {
    return typeof body === 'string' ? function(a,b,c,d,e,f,g,h,i,j) { return eval(body); } : body
}
$groovy = function(proto){
    if (typeof proto  === 'undefined' || proto === null){
        throw 'groovy does not accept an undefined or null parameter!'
    }
    if (proto == Array || proto == Array.prototype || proto instanceof Array){
        // intersection, leftComplement, rightComplement, make all null safe? (chaining)
        // Array
        var _superSort = proto.sort
        /* iterates over each element in the array */
        proto.each = function(closure){
            var args = arguments, clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                clos(this[i], i, args[1], args[2], args[3], args[4], args[5])
            }
            return this
        }
        /* returns the index of the first object matching the value */
        proto.indexOf = function(value){
            for (var i = 0; i<this.length; i++){
                if (value === this[i]){ return i }
            }
            return -1
        }
        /* returns the index of the last object matching the value */
        proto.lastIndexOf = function(value){
            var last = -1
            for (var i = 0; i<this.length; i++){
                if (value === this[i]){ last = i }
            }
            return last
        }
        /* returns a string representation of the array */
        proto.toString = function(){
            var tmp = '', len = this.length-1
            this.each(function(a,b){ tmp += a + (b < len ? ',' : '') })
            return tmp
        }
        /* pushes the value onto the end of the array */
        proto.push = function(object){
            this[this.length] = object
            return this
        }
        proto.add = proto.push
        proto._maxmin = function(comparer) {
            var v = this[0]
            this.each(function(a){ v = comparer(a, v) })
            return v
        }
        /* returns the minimum object */
        proto.min = function(comparer) {
            var tmp = $util.isset(comparer) ? $funky(comparer) : Math.min
            return this._maxmin(tmp)
        }
        /* returns the maximum object */
        proto.max = function(comparer) {
            var tmp = $util.isset(comparer) ? $funky(comparer) : Math.max
            return this._maxmin(tmp)
        }
        /* collects all objects after modification by the closure */
        proto.collect = function(closure){
            var tmp = $groovy([]), args = arguments, clos = $funky(closure)
            this.each(function(a,b){ 
                tmp.add(clos(a, b, args[1], args[2], args[3], args[4], args[5])) 
            })
            return tmp
        }
        /* collects all entries after modification by the closure */
        proto.collectEntries = function(closure){
            var tmp=$groovy({}), clos = $funky(closure)
            this.each(function(a,b){
                var t1 = clos(a, b)
                tmp[t1[0]] = t1[1]
            })
            return tmp
        }
        /* finds the first object matching the closure */
        proto.find = function(closure){
            var tmp=[], clos = $funky(closure), obj = undefined
            this.each(function(a,i){
                if (clos(a, i)){ obj = $groovy(a) }
            })
            return obj
        }
        /* finds all matching elements */
        proto.findAll = function(closure){
            var tmp=$groovy([]), clos = $funky(closure)
            this.each(function(a,b){
                if (clos(a,b)){
                    tmp.add(a)
                }
            })
            return tmp
        }
        /* sorts the list */
        proto.sort = function(comparer) {
            comparer = $funky(comparer)
            return typeof comparer !== 'undefined' ? _superSort.apply(this, [comparer]) : _superSort.apply(this)
        }
        /* returns the number of elements in the array */ 
        proto.size = function() {
            return this.length
        }
        /* returns true if the array contains the element */
        proto.contains = function(value) {
            return this.indexOf(value) != -1
        }
        /* returns the object at the given index */
        proto.get = function(index) {
            var a = this[index]
            return $util.isundef(a) ? a : $groovy(a)
        }
        /* Iterates through the given Collection, passing in the initial value to the 2-arg closure along with the first item. 
        proto.inject = function(obj, closure){
            closure = $funky(closure)
            for (var i = 0; i < this.length; i++) {
                closure(obj, this[i])
            }
            return $groovy(obj)
        }*/
        /* gets sub array of elements from index to index */
        proto.range = function(from, to) {
            return $groovy(this.slice(from,to+1))
        }
        /* groups array elements by the key the closure returns */
        proto.groupBy = function(closure) {
            var tmp={}, clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                var key = clos(this[i], i)
                var arr = tmp[key] || []
                arr[arr.length] = this[i]
                tmp[key] = arr
            }
            return $groovy(tmp)
        }
        /* flattens a multi dimensional array into a single array */
        proto.flatten = function() {
            var merged = []
            merged = merged.concat.apply(merged, this)
            return $groovy(merged)
        }
        /* adds all elements from an array into this array */
        proto.addAll = function(newArray) {
            for (var i=0;i<newArray.length;i++){
                this[this.length] = newArray[i]
            }
            return this
        }
    } else {
        // Object / Map
        proto.keys = function(){
            var keys = $groovy([])
            for (var key in this){
                if (typeof this[key] !== 'function'){
                    keys.push(key)
                }
            }
            return keys
        }
        proto.toString = function(){
            var tmp = $groovy([]), keys = this.keys(), arr = this
            keys.each(function(a,b){ tmp.add(a+':'+arr[a]) })
            return '{'+tmp.toString()+'}'
        }
    }
    return proto
}
