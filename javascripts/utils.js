Array.prototype.last = function() { return this[this.length - 1]; }; var BindEvent = function(_this, _fn, _args) { var fn = _fn; var args = __A(_args); return function(e) { return fn.apply(_this, args.concat([(e || window.event)])); }; }; var Bind = function(_this, _fn, _args) { var fn = _fn; var args = __A(_args); return function() { return fn.apply(_this, args.concat(__A(arguments))); }; }; var __A = function(_v) { if (!_v) return []; if (_v.toArray && typeof(_v) != "string") return _v.toArray(); var iterable = (typeof _v == "string") ? _v.split(/,/) : _v; var length =  iterable.length; var results = new Array(length); while (length--) results[length] = iterable[length]; return results; }; var OnEvent = new function() { this.__zunkBoxes = { def: [] }; }; OnEvent.clear = function(__box) { for(var b in this.__zunkBoxes) { if(this.__zunkBoxes[b] && this.__zunkBoxes[b].length > 0) { if(__box && b != __box) continue; var item = null; while(item = this.__zunkBoxes[b].pop()) { this.del(item[0], item[1], item[2]); } } } }; OnEvent.add = function(_e, _a, _fn, _box) { var _m = ["addEventListener", "attachEvent"]; if(_box) { if(!this.__zunkBoxes[_box]) this.__zunkBoxes[_box] = []; this.__zunkBoxes[_box].push([_e, _a, _fn]); } else this.__zunkBoxes['def'].push([_e, _a, _fn]); return this.__bindEvent(_m, _e, _a, _fn); }; OnEvent.del = function(_e, _a, _fn) { var _m = ["removeEventListener", "detachEvent"]; return this.__bindEvent(_m, _e, _a, _fn); }; OnEvent.__case_ie = function(_a) { var __map = { blur: "focusout" }; return __map[_a] || _a; }; OnEvent.__bindEvent = function(_m, _e, _a, _fn) { if (_e[_m[0]]) { _e[_m[0]](_a, _fn, false); } else if (_e[_m[0]]) { _e[_m[0]]('on' + this.__case_ie(_a), _fn); } else { _e['on' + _a] = _fn; } }; function setCookie(name,value,days) { if (days) { var date = new Date(); date.setTime(date.getTime()+(days*24*60*60*1000)); var expires = "; expires="+date.toGMTString(); } else var expires = ""; document.cookie = name+"="+value+expires+"; path=/"; }; function getCookie(name) { var nameKey = name + "="; var cookies = document.cookie.split(';'); for(var i=0;i < cookies.length;i++) { var cookie = cookies[i]; while (cookie.charAt(0)==' ') cookie = cookie.substring(1,cookie.length); if (cookie.indexOf(nameKey) == 0) return cookie.substring(nameKey.length,cookie.length); } return null; }; function delCookie(name) { setCookie(name,"",-1); };
