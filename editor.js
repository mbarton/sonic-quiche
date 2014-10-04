SQEditor = function(config) {
	var editor = ace.edit(config.editor_id);
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/ruby");

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
};