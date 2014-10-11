function SQAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var ctx = new AudioContext();
	var samples = {};
	var threads = {};
	var nodes = {};

	// http://en.wikipedia.org/wiki/Piano_key_frequencies
	var NODE_FREQS = {};
	for(var i = 1; i <= 88; i++) {
		var exp = (i - 49) / 12;
		NODE_FREQS[i] = Math.pow(2, exp) * 440;
	}

	function playSample(node_id, sample, time, rate, start, finish) {
		var sampleDuration = samples[sample].duration;
		var actualFinish = sampleDuration;
		if(finish > 0) { actualFinish = finish; }
		if(actualFinish > sampleDuration) { actualFinish = sampleDuration; }

		// TODO MRB: This seems to be shorter than how long a sound actually lasts when scaled.
		var scaledDuration = (actualFinish - start) * (2.0 - rate);
		var endTimeAfterSample = time + scaledDuration;

		var source = ctx.createBufferSource();
		nodes[node_id] = {
			source: source,
			endTime: endTimeAfterSample
		}

		source.buffer = samples[sample];
		source.playbackRate.value = rate;
		source.connect(ctx.destination);
		source.start(time, start, (actualFinish - start));
	}

	function playNote(synth, note, noteLength, time, args) {
		var osc = ctx.createOscillator();
		osc.connect(ctx.destination);
		osc.frequency.value = NODE_FREQS[note];
		osc.type = synth;
		osc.start(time);
		osc.stop(time + noteLength);

		console.log(note);
		console.log(synth);
		console.log(args);
	}

	function handleCommand(thread_id, cmd) {
		switch(cmd.type) {
			case "sample":
				var rate = cmd.args.rate || 1.0;
				var start = cmd.args.start || 0.0;
				if(start < 0.0) { start = 0.0; }
				var finish = cmd.args.finish || -1;
				if(finish < 0.0) { finish = 0.0; }

				// The Web Audio API appears to be unable to handle negative rates so we don't support it for now
				if(rate <= 0) {
					EventBus.fire("error", "Browsers don't support playing samples backwards yet. Sad soup.");
				} else {
					playSample(cmd.node_id, cmd.sample, threads[thread_id].time, rate, start, finish);
				}
				break;
			case "note":
				playNote(cmd.synth, cmd.note, cmd.noteLength, threads[thread_id].time, cmd.args);
				break;
			case "sleep":
				var newThreadEndTime = threads[thread_id].time + cmd.length;
				threads[thread_id].time = newThreadEndTime;
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
		var endTime = 0;
		$.each(nodes, function(_, node) {
			if(node.endTime > endTime) {
				endTime = node.endTime;
			}
		});

		var timeUntilEnd = endTime - ctx.currentTime;

		setTimeout(function(){
			EventBus.fire("stopped");
			EventBus.fire("log", "Script finished");
		}, timeUntilEnd * 1000);
	});

	EventBus.on("stop", function(){
		$.each(nodes, function(_, node) {
			node.source.stop(0);
		});
	});

	EventBus.on("stopped", function(){
		threads = {};
		// GC can go a-reaping from here. TODO MRB: allow nodes to be reaped once they are done
		nodes = {};
	});

	return {
		"ctx": ctx,
		"load": load,
		"freqs": NODE_FREQS,
		"samples": function() { return samples; },
		"nodes": function(){ return nodes; }
	}
}