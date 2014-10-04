SQEditor = function(config) {
	var editor = ace.edit(config.editor_id);
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/ruby");
	// Opal barfs on tabs so use spaces instead
	editor.getSession().setUseSoftTabs(true);

	var playing = false;

	function loadExampleCode(script) {
		$.get(script, function(script_data) {
			editor.setValue(script_data);
		});
	}

	var loadedExample = false;
	$.each(config.example_scripts, function(_, script) {
		if(!loadedExample) {
			loadExampleCode(script);
			loadedExample = true;
		}

		$("#" + config.selector_id).append("<li><a href='#'>" + script + "</a></li>");
	});

	$("#" + config.selector_id + " li a").on("click", function() {
		loadExampleCode($(this).html());
	});

	$("#" + config.play_id).on("click", function() {
		if(!playing) {
			EventBus.fire("play", editor.getValue());
			playing = true;
		}
	});

	$("#" + config.stop_id).on("click", function() {
		if(playing) {
			EventBus.fire("stop", {});
			playing = false;
		}
	});

	EventBus.on("playing", function(_) {
		$("#" + config.play_id).addClass("disabled");
		$("#" + config.stop_id).removeClass("disabled");
	});

	EventBus.on("stopped", function(){
		$("#" + config.stop_id).addClass("disabled");
		$("#" + config.play_id).removeClass("disabled");
		playing = false;
	});

	function formatTimePart(n) {
		if(n < 10) {
			return "0" + n;
		} else {
			return "" + n;
		}
	}

	function _log(level, data) {
		var now = new Date();

		var timeString = formatTimePart(now.getHours()) + ":" + formatTimePart(now.getMinutes()) + ":" + formatTimePart(now.getSeconds());

		if(level == "error") {
			var label = "<span class='label error'>" + timeString + "<i class='fa fa-exclamation-triangle'></i></span>";
		} else if(level == "warn") {
			var label = "<span class='label secondary'>" + timeString + "<i class='fa fa-exclamation-triangle'></i></span>";
		} else {
			var label = "<span class='label secondary'>" + timeString + "</span>";
		}

		$("#" + config.events_id).prepend(
			"<div class='row'>" + 
			"	<div class='small-3 columns'>" +
			label +
			"	</div>" +
			"	<div class='small-9 columns'>" + data + "</div>" +
			"</div>");
	}

	EventBus.on("log", function(data) {
		_log("info", data);
	});

	EventBus.on("warn", function(data) {
		_log("info", data);
	});

	EventBus.on("error", function(data) {
		_log("error", data);
	});
}