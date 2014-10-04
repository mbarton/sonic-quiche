$(document).foundation();

var engine = new SQEngine();
var editor = new SQEditor({
	editor_id: "editor",
	selector_id: "saved_code",
	events_id: "events",
	play_id: "play",
	stop_id: "stop",
	example_scripts: [
		"examples/thread_test.rb",
		"examples/random_test.rb",
		"examples/lesson1_demo.rb",
		"examples/lesson2_baseline.rb"
	]
});