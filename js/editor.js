SQEditor = function(config) {
	var editor = ace.edit(config.editor_id);
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/ruby");
	// Opal barfs on tabs so use spaces instead
	editor.getSession().setUseSoftTabs(true);

	editor.on("change", function(){
		localStorage["sq_code"] = editor.getValue();
	});

	var playing = false;

	function loadExampleCode(script) {
		$.get(script, function(script_data) {
			editor.setValue(script_data);
		});
	}

	var loadedExample = false;

	if(localStorage["sq_code"]) {
		editor.setValue(localStorage["sq_code"]);
		loadedExample = true;
	}

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
			$("#play_icon").hide(function(){
				$("#loading_icon").show(function(){
					EventBus.fire("play", editor.getValue());
					playing = true;
				});
			});
		}
	});

	$("#" + config.stop_id).on("click", function() {
		if(playing) {
			$("#play_icon").hide();
			$("#loading_icon").show();
			EventBus.fire("stop", {});
			playing = false;
		}
	});

	EventBus.on("playing", function(_) {
		$("#" + config.play_id).addClass("disabled");
		$("#" + config.stop_id).removeClass("disabled");
		$("#play_icon").show();
		$("#loading_icon").hide();
	});

	EventBus.on("stopped", function(){
		$("#" + config.stop_id).addClass("disabled");
		$("#" + config.play_id).removeClass("disabled");
		$("#play_icon").show();
		$("#loading_icon").hide();
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
			var label = "<span class='label error'><i class='fa fa-exclamation-triangle'></i>&nbsp;" + timeString + "</span>";
		} else if(level == "warn") {
			var label = "<span class='label secondary'><i class='fa fa-exclamation-triangle'></i>&nbsp;" + timeString + "</span>";
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
		_log("warn", data);
	});

	EventBus.on("error", function(data) {
		_log("error", data);
	});

	EventBus.on("load_progress", function(data) {
		$("#progress_description div").html(data.description);
		$("#progress_meter span").css("width", data.progress + "%");
	});

	EventBus.on("loaded", function(_) {
		$("#progress_description").hide();
		$("#progress_meter").hide();
		$("#editor_row").show();
		$("#" + config.play_id).removeClass("disabled");
	});
}