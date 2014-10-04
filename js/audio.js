function SQAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var ctx = new AudioContext();
	var samples = {};

	EventBus.on("cmd", function(cmd) {
		console.log(cmd);
	});

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
						samples[sampleFile] = audioData;

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

	return {
		"ctx": ctx,
		"load": load,
		"samples": function() { return samples; }
	}
}