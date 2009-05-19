var Sokoban = function(_title) {
	this.title = (/pack_title=([_a-z]+)/i.test(location.search)) ? /pack_title=([_a-z]+)/i.exec(location.search).last() : _title || "yoshio_murase";
	this.stage = (/start_stage=([0-9]+)/i.test(location.search)) ? Number(/start_stage=([0-9]+)/i.exec(location.search).last()) : 1;

	this.warehouses = packs[this.title];

	this.prepareDom();

	this.init();
	this.bindEvent();
};

Sokoban.prototype.prepareDom = function() {
  this.dom = document.getElementById("sokoban");

	this.uri = this.createElement({id: "sokoban_uri"});
	this.dom.appendChild(this.uri);

	var _rail = this.createElement({id: "sokoban_rail"});
	var _content = this.createElement({id: "sokoban_content"});

	this.dom.appendChild(_rail);
	this.dom.appendChild(_content);

	this.estate = this.createElement({id: "sokoban_estate", className: "clearfix"});
	this.board = this.createElement({id: "sokoban_board", className: "clearfix"});
	this.card = this.createElement({id: "sokoban_card", className: "clearfix"});
	this.panel = this.createElement({id: "sokoban_panel", className: "clearfix", innerHTML: this.action_buttons()});
	this.message_board = this.createElement({id: "sokoban_message_board", className: "clearfix"});

	_content.appendChild(this.estate)
	_content.appendChild(this.message_board)

	_rail.appendChild(this.board)
	_rail.appendChild(this.card)
	_rail.appendChild(this.panel)
}

Sokoban.prototype.init = function() {
	this.warehouse = this.warehouses[Number(this.stage) - 1];
	this.clearMap();

	this.renderWarehouse();

	this.sendMessage();
	this.describe();
	this.scoring();
};

Sokoban.prototype.undo = function() {
	if(this.map.history.length > 0) {
		var _history = this.map.history.pop();

		this.map.current = _history;
		this.restore(_history.map);

		this.map.moves = _history.moves;
		this.map.pushes = _history.pushes;
		this.scoring();
	}
};

Sokoban.prototype.reloadStage = function() {
	this.init();
};

Sokoban.prototype.jumpToStage = function(stage) {
	this.stage = Number(stage);
	this.init();
};

Sokoban.prototype.jumpToPack = function(pack) {
	this.title = pack;
	this.warehouses = packs[pack];
	this.jumpToStage(1);
};

Sokoban.prototype.restore = function(map) {
	this.warehouse = map;

	this.renderWarehouse();
};

Sokoban.prototype.clearMap = function(opts) {
	this.map = { goals: [], worker: "", current: { moves: 0, pushes: 0, map: this.warehouse }, history: [{ moves: 0, pushes: 0, map: this.warehouse }], moves: 0, pushes: 0 };
};

Sokoban.prototype.renderWarehouse = function() {
	this.estate.innerHTML = "";

	var _warehouse = __A(this.warehouse);
	for(var y=0; y<_warehouse.length; y++) {
		var _row = this.createElement({className: "row clearfix"});
		this.estate.appendChild(_row);
		for(var x=0; x<_warehouse[y].length; x++) {
			var _id = x + "_" + y;
			var _classes = this.symToClass(_warehouse[y][x]);
			if(/worker/i.test(_classes)) this.map.worker = _id;
			else if(/goal/i.test(_classes)) this.map.goals.push(_id);
			_row.appendChild(this.createElement({ id: _id, className: _classes }));
		}
	}
};

Sokoban.prototype.sendMessage = function(_message) {
	if(!_message) _message = "";
	this.message_board.innerHTML = _message;
};

Sokoban.prototype.describe = function() {
	var _port = (location.port) ? ":" + location.port : "";
	var full_url = location.protocol + "//" + location.hostname + _port + location.pathname;

	this.uri.innerHTML = full_url + "?pack_title=" + this.title + "&start_stage=" + this.stage;

	this.board.innerHTML = "<ul>" +
		"<li><select onchange='s.jumpToPack(this.value)'>" + this.options_for_packs() + "</select></li>" +
		"<li><select onchange='s.jumpToStage(this.value)'>" + this.options_for_stages() + "</select></li>" +
	"</ul>";
};

Sokoban.prototype.scoring = function() {
	this.card.innerHTML = "<dl>" +
		"<dt>moves</dt><dd>" + this.map.moves + "</dd>" +
		"<dt>pushes</dt><dd>" + this.map.pushes + "</dd>" +
	"</dl>";
};

Sokoban.prototype.options_for_stages = function() {
	var options = "";
	for(var i=1;i<=this.warehouses.length;i++)
		options += ((Number(this.stage) == i) ? "<option selected " : "<option ") + "value='" + i + "'> Stage " + i + "</option>";
	return options;
};

Sokoban.prototype.options_for_packs = function() {
	var options = "";
		for(var i in packs) { if(typeof i != "string") continue;
			options += ((this.title == i) ? "<option selected " : "<option ") + "value='" + i + "'> " + i + "</option>";
		}
	return options;
};

Sokoban.prototype.action_buttons = function() {
	return "<ul>" +
		"<li><a href='#reload' onclick='s.reloadStage();return false;'>reload stage</a></li>" +
		"<li><a href='#undo' onclick='s.undo();return false;'>undo</a></li>" +
	"</ul>";
};

Sokoban.prototype.break_event = function(_e) {
	try {
		if (_e.stopPropagation) _e.stopPropagation();
		else _e.returnValue = false;
		if (_e.preventDefault) _e.preventDefault();
		else _e.cancelBubble = true;
	} catch(e) {
		// alert(e.message);
	}
}
Sokoban.prototype.bindEvent = function() {
	OnEvent.add(window.document, "keydown", BindEvent(this, function(_e) {
		OnEvent.add(window, "beforeunload", OnEvent.clear);

		var current_node = _e.target || _e.srcElement;
		if(!/^(textarea|input)$/i.test(current_node.tagName)) {
			var keycode = _e.keycode || _e.keyCode;
			if(/(37|38|39|40)/.test(keycode)) {
				this.break_event(_e);
				this.moveWorker(this.keycodeToDirection(keycode));
			}
			else if(_e.ctrlKey && /90/.test(keycode)) {
				this.break_event(_e);
				this.undo();
			}
		}
	}));
};

Sokoban.prototype.keycodeToDirection = function(_keycode) {
	return { 37: "left", 38: "up", 39: "right", 40: "down" }[Number(_keycode)];
};

Sokoban.prototype.gameHasCleared = function() {
	for(var i=0; i<this.map.goals.length; i++) if(!this.isA(this.map.goals[i], "crate")) return false;
	
	if(Number(this.stage) < this.warehouses.length) this.stageHasCleared();
	else this.packHasCleared();
};

Sokoban.prototype.stageHasCleared = function() {
	var msg = "Stage has cleared. <a href='#next' onclick='s.jumpToStage(" + Number(this.stage + 1) + ");return false'>Next Stage.</a>";
	this.sendMessage(msg);
};

Sokoban.prototype.packHasCleared = function() {
	var msg = "All stages have cleared.";
	this.sendMessage(msg);
};

Sokoban.prototype.moveCrate = function(_worker_xy, _crate_xy, _direction) {
	var _crate_space = this.findSpace(_crate_xy);
	var new_id = this.measureNewId(_crate_xy, _direction);

	if(new_id) {
		this.removeClass(_crate_space, "crate");
		this.addClass(this.findSpace(new_id), "crate");
		this.map.pushes++;
		this.moveWorker(_direction);
		if(this.isA(new_id, "goal")) this.gameHasCleared();
	}
};

Sokoban.prototype.moveWorker = function(_direction) {
	var _worker_space = this.findWorker();
	var new_id = this.measureNewId(this.idToJson(this.map.worker), _direction);

	if(new_id) {
		this.removeClass(_worker_space, "worker");
		this.map.worker = new_id;
		this.addClass(this.findWorker(), "worker");
		this.map.moves++;
		this.scoring();
		this.dumpWarehouse();
	}
};

Sokoban.prototype.dumpWarehouse = function() {
	var map = [];
	for(var i=0; i<this.estate.childNodes.length; i++) { if(this.estate.childNodes[i].nodeType != 1) continue;
		var _row = this.estate.childNodes[i];
		var syms = "";
		for(var j=0; j<_row.childNodes.length; j++) { if(_row.childNodes[j].nodeType != 1) continue;
			var _class = (/goal/i.test(_row.childNodes[j].className)) ? "goal " : "";
			_class += _row.childNodes[j].className.replace(/(goal|space|\s)/gi, '');
			syms += this.classToSym(_class);
		}
		if(syms) map.push(syms);
	}

	if(this.map.current) this.map.history.push(this.map.current);
	this.map.current = { moves: this.map.moves, pushes: this.map.pushes, map: map.join(",")};
};


Sokoban.prototype.symToClass = function(_sym) {
	return "space " + { "#": "wall", " ": "", ".": "goal", "@": "worker", "$": "crate", "*": "goal crate", "+": "goal worker" }[_sym];
};

Sokoban.prototype.classToSym = function(_class) {
	return { "wall": "#", "": " ", "goal": ".", "worker": "@", "crate": "$", "goal crate": "*", "goal worker": "+" }[_class.replace(/\s$/, '')];
};

Sokoban.prototype.measureNewId = function(_current_xy, _direction) {
	var future_xy = { x:_current_xy.x, y: _current_xy.y };

	if(_direction == "left") future_xy.x = _current_xy.x - 1;
	else if(_direction == "up") future_xy.y = _current_xy.y - 1;
	else if(_direction == "right") future_xy.x = _current_xy.x + 1;
	else if(_direction == "down") future_xy.y = _current_xy.y + 1;

	switch(this.checkSpace(this.idToString(future_xy))) {
		case "wall":
		case "out":
			break;
		case "crate":
		case "goal crate":
			if(!this.isA(this.idToString(_current_xy), "crate") && this.idToString(_current_xy) != this.idToString(future_xy)) this.moveCrate(_current_xy, future_xy, _direction);
			break;
		default:
			if(this.idToString(_current_xy) != this.idToString(future_xy)) var new_id = this.idToString(future_xy);
			break;
	}

	return new_id;
};

Sokoban.prototype.checkSpace = function(_id) {
	var _space = document.getElementById(_id);
	var _class = (this.isA(_id, "goal")) ? "goal " : "";
	if(!_space) _class += "out"
	else _class += _space.className.replace(/(goal|space|\s)/gi, '');

	return _class.replace(/\s+$/, '');
};

Sokoban.prototype.isA = function(_id, class_name) {
	var _space = document.getElementById(_id);
	return new RegExp(class_name, "i").test(_space.className);
};

Sokoban.prototype.findWorker = function() {
	return document.getElementById(this.map.worker);
};

Sokoban.prototype.findSpace = function(_clue) {
	var _id = (typeof _clue == "string") ? _clue : this.idToString(_clue);
	return document.getElementById(_id);
};

Sokoban.prototype.createElement = function(opts) {
	var _e = document.createElement("div");
	for(var _key in opts) { if(typeof opts == "function") continue;
		_e[_key] = opts[_key]
	}
	return _e;
};

Sokoban.prototype.idToJson = function(_id) {
	var xy = _id.split("_");
	return { x: Number(xy[0]), y: Number(xy[1]) };
};

Sokoban.prototype.idToString = function(_xy) {
	return _xy.x + "_" + _xy.y;
};

Sokoban.prototype.addClass = function(node, class_name) {
	if(node) if(!new RegExp(class_name, "i").test(node.className)) node.className += (node.className ? " " : "") + class_name
};

Sokoban.prototype.removeClass = function(node, class_name) {
	if(node) node.className = node.className.replace(new RegExp("(\s)?" + class_name, "gi"), '')
};
