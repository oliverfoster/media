/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   funcName$write : function() {
 *     // this function is not enumerable, writable or configurable
 *   },
 *   propName$set$enum$config: function(value) {
 *     this._propName = value;
 *   },
 *   propName$get: function() {
 *     return this._propName;
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls, fromCls) {
  var create = function(name, func) {
    return function() {
      return this['_'+name] = this['_'+name] || func.bind(this);
    };
  }
  var isForce = !!fromCls;
  fromCls = fromCls || cls;
  var props = {};
  var names = Object.getOwnPropertyNames(fromCls);
  for (var i = 0, l = names.length; i < l; i++) {
    var name = names[i];
    var dollar = name.indexOf("$");
    if (dollar === -1 && !isForce) continue;
    var end;
    var begin;
    if (dollar === -1) {
      end = "";
      begin = name;
    } else {
      end = name.slice(dollar);
      begin = name.slice(0, dollar);
    }
    if (!begin) continue;
    var values = end.split("$");
    var isBind = includes(values, "bind");
    var isGet = includes(values, "get");
    var isSet = includes(values, "set");
    var isValue = includes(values, "value");
    var isEnum = includes(values, "enum");
    var isWriteable = includes(values, "write");
    var isConfigurable = includes(values, "config");
    var defs = 0;
    defs += isGet ? 1 : 0;
    defs += isSet ? 1 : 0;
    defs += isValue ? 1 : 0;
    if (defs > 1) throw "Cannot have two types in one definition.";
    defs += isEnum ? 1 : 0;
    defs += isWriteable ? 1 : 0;
    defs += isConfigurable ? 1 : 0;
    var value;
    if (isBind) {
      isGet = true;
      isWriteable = false;
      value = create(begin, fromCls[name]);
    } else {
      value = fromCls[name];
    }
    var prop = props[begin] = props[begin] || {
      value: value
    };
    if (isGet) prop.get = value;
    if (isSet) prop.set = value;
    if (isEnum) prop.enumerable = true;
    if (isWriteable) prop.writable = true;
    if (isConfigurable) prop.configurable = true;
    if (prop.value && (prop.get || prop.set)) delete prop.value;
    delete fromCls[name];
    delete cls[begin];
  }
  if (!Object.keys(props).length) return cls;
  Object.defineProperties(cls, props);
  return cls;
};
