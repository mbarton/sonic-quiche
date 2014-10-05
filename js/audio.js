function SQAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var ctx = new AudioContext();
	var samples = {};
	var threads = {};
	var endTime = 0;

	function playSample(sample, time, rate) {
		var source = ctx.createBufferSource();
		source.buffer = samples[sample];
		source.playbackRate.value = rate;
		source.connect(ctx.destination);
		source.start(time);
	}

	function playNote(synth, args) {
		console.log(args);
	}

	function handleCommand(thread_id, cmd) {
		switch(cmd.type) {
			case "sample":
				// The Web Audio API appears to be unable to handle negative rates so we don't support it for now
				var rate = cmd.args.rate || 1.0;

				if(rate <= 0) {
					EventBus.fire("error", "Browsers don't support playing samples backwards yet. Sad soup.");
				} else {
					playSample(cmd.sample, threads[thread_id].time, rate);

					// TODO MRB: This seems to be shorter than how long a sound actually lasts when scaled.
					var scaledDuration = samples[cmd.sample].duration * (2.0 - rate);
					var endTimeAfterSample = threads[thread_id].time + scaledDuration;
					if(endTimeAfterSample > endTime) {
						endTime = endTimeAfterSample;
					}
				}
				break;
			case "note":
				playNote(cmd.synth, cmd.args);
				break;
			case "sleep":
				var newThreadEndTime = threads[thread_id].time + cmd.length;
				threads[thread_id].time = newThreadEndTime;
				if(newThreadEndTime > endTime) {
					endTime = newThreadEndTime;
				}
				break;
			default:
				EventBus.fire("error", "Unknown audio command " + cmd.type + " [thread " + thread_id + "]");
				break;
		}
	}

	function loadSampleAsBuffer(sampleFile, done_callback) {
		var request = new XMLHttpRequest();
		request.open('GET', "samples/" + sampleFile, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			ctx.decodeAudioData(request.response, function(audioData) {
				var sampleName = sampleFile.replace(".wav", "");
				samples[sampleName] = audioData;

				done_callback();
			});
		};

		request.send();
	}

	function load() {
		$.get("samples/manifest.json", function(data){
			EventBus.fire("load_progress", {description: "Loading samples...", progress: 0});

			var numSamples = data.samples.length;
			var numLoaded = 0;

			$.each(data.samples, function(_, sampleFile) {
				loadSampleAsBuffer(sampleFile, function(){
					numLoaded++;
					if(numLoaded == numSamples) {
						EventBus.fire("loaded", {});
					}
				});
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

	EventBus.on("complete", function(){
		var timeUntilEnd = endTime - ctx.currentTime;

		setTimeout(function(){
			EventBus.fire("stopped");
			EventBus.fire("log", "Script finished");
		}, timeUntilEnd * 1000);
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