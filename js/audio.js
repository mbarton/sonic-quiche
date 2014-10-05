function SQAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var ctx = new AudioContext();
	var samples = {};
	var threads = {};

	function playSample(sample, time) {
		var source = ctx.createBufferSource();
		source.buffer = samples[sample];
		source.connect(ctx.destination);
		source.start(time);
	}

	function handleCommand(thread_id, cmd) {
		switch(cmd.type) {
			case "sample":
				playSample(cmd.sample, threads[thread_id].time);
				break;
			case "sleep":
				threads[thread_id].time = threads[thread_id].time + cmd.length;
				break;
			default:
				EventBus.fire("error", "Unknown audio command " + cmd.type + " [thread " + thread_id + "]");
				break;
		}
	}

	function load() {
		$.get("samples/manifest.json", function(data){
			EventBus.fire("load_progress", {description: "Loading samples...", progress: 0});

			var numSamples = data.samples.length;
			var numLoaded = 0;

			$.each(data.samples, function(_, sampleFile) {
				var request = new XMLHttpRequest();
				request.open('GET', "samples/" + sampleFile, true);
				request.responseType = 'arraybuffer';
				request.onload = function() {
					ctx.decodeAudioData(request.response, function(audioData) {
						var sampleName = sampleFile.replace(".wav", "");
						samples[sampleName] = audioData;

						numLoaded++;
						if(numLoaded == numSamples) {
							EventBus.fire("loaded", {});
						}
					});
				};

				request.send();
			});
		});
	}

	EventBus.on("cmd", function(cmd) {
		if(!(cmd.thread_id in threads)) {
			threads[cmd.thread_id] = {
				time: ctx.currentTime,
				queue: []
			}	
		}

		handleCommand(cmd.thread_id, cmd.data);
	});

	EventBus.on("stopped", function(){
		threads = {};
	});

	return {
		"ctx": ctx,
		"load": load,
		"samples": function() { return samples; }
	}
}