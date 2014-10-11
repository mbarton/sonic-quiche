$(document).foundation();

var engine = new SQEngine();
var audio = new SQAudio();

var editor = new SQEditor({
	editor_id: "editor",
	selector_id: "saved_code",
	events_id: "events",
	play_id: "play",
	stop_id: "stop",
	example_scripts: [
		"examples/elec_blip.rb",
		"examples/collapsing_amen.rb",
		"examples/thread_test.rb",
		"examples/random_test.rb",
		"examples/lesson1_demo.rb",
		"examples/lesson2_baseline.rb",
		"examples/lesson2_baseline_samples.rb"
	]
});

audio.load();

$(function(){
	$("#hello-modal").foundation("reveal", "open");
});