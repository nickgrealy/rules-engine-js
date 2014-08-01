
var $util = {
    isset: function(a){ return typeof a !== 'undefined' && a !== null }
}
$funky = function(body) {
    return typeof body === 'string' ? function(a,b,c,d,e,f,g,h,i,j) { return eval(body); } : body
}
$groovy = function(proto){
    if (typeof proto  === 'undefined' || proto === null){
        throw 'groovy does not accept an undefined or null parameter!'
    }
    if (proto == Array || proto == Array.prototype || proto instanceof Array){
        // foreach (synonym of each?), intersection, leftComplement, rightComplement, make all null safe? (chaining)
        // Array
        var _superSort = proto.sort
        proto.each = function(closure){
            var args = arguments, clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                clos(this[i], i, args[1], args[2], args[3], args[4], args[5])
            }
        }
        proto.collect = function(closure){
            var tmp=[], args = arguments, clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                tmp[tmp.length] = clos(this[i], i, args[1], args[2], args[3], args[4], args[5])
            }
            return $groovy(tmp)
        }
        proto.collectEntries = function(closure){
            var tmp={}, clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                var t1 = clos(this[i], i)
                tmp[t1[0]] = t1[1]
            }
            return $groovy(tmp)
        }
        proto.find = function(closure){
            var tmp=[], clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                if (clos(this[i], i)){
                    return $groovy(this[i])
                }
            }
            return null
        }
        proto.findAll = function(closure){
            var tmp=[], clos = $funky(closure)
            for (var i=0;i<this.length;i++){
                if (clos(this[i])){
                    tmp[tmp.length] = this[i]
                }
            }
            return $groovy(tmp)
        }
        proto.min = function(comparer) {
            if (this.length === 0) return null
            if (this.length === 1) return this[0]
            comparer = $util.isset(comparer) ? $funky(comparer) : Math.min
            var v = this[0]
            for (var i = 1; i < this.length; i++) {
                v = comparer(this[i], v);        
            }
            return v
        }
        proto.max = function(comparer) {
            if (this.length === 0) return null
            if (this.length === 1) return this[0]
            comparer = $util.isset(comparer) ? $funky(comparer) : Math.max
            var v = this[0]
            for (var i = 1; i < this.length; i++) {
                    v = comparer(this[i], v);        
            }
            return v
        }
        proto.sort = function(comparer) {
            comparer = $funky(comparer)
            return typeof comparer !== 'undefined' ? _superSort.apply(this, [comparer]) : _superSort.apply(this)
        }
        proto.size = function() {
            return this.length
        }
        proto.contains = function(value) {
            for (var i = 1; i < this.length; i++) {
                if (this[i] == value) { return true; }
            }
            return false
        }
        proto.get = function(index) {
            return -1 < index < this.length ? $groovy(this[index]) : null
        }
        proto.inject = function(obj, closure){
            closure = $funky(closure)
            for (var i = 0; i < this.length; i++) {
                closure(obj, this[i])
            }
            return $groovy(obj)
        }
        proto.range = function(from, to) {
            return $groovy(this.slice(from,to+1))
        }
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
        proto.flatten = function() {
            var merged = []
            merged = merged.concat.apply(merged, this)
            return $groovy(merged)
        }
        proto.addAll = function(newArray) {
            for (var i=0;i<newArray.length;i++){
                this[this.length] = newArray[i]
            }
            return this
        }
    } else {
        // Object / Map
        proto.keys = function(){
            var keys = []
            for (var key in this){
                if (typeof(this[key]) !== 'function'){
                    keys.push(key)
                }
            }
            return $groovy(keys)
        }
    }
    return proto
}