function SQEngine() {
	var apiHeader = null;
	var nextId = 0;
	var workers = {};

	function handleEvent(data) {
		switch(data.action) {
			case "complete":
				delete workers[data.data];

				if($.isEmptyObject(workers)) {
					EventBus.fire("stopped");
				}
				break;

			default:
				EventBus.fire(data.action, data.data);
				break;
		}
	}

	function startWorker(code, id) {
		var codeBlob = new Blob([code], {type: "application/javascript"});
		workers[id] = new Worker(URL.createObjectURL(codeBlob));
		workers[id].onmessage = function(e) {
			handleEvent(e.data);
		}
	}

	function play(code) {
		if(apiHeader == null) {
			EventBus.fire("log", "Cannot compile - haven't finished downloading api.rb yet");
		} else {
			var id = nextId;
			nextId++;		

			EventBus.fire("log", "Compiling script");
			
			var prefix = "importScripts('http://cdn.opalrb.org/opal/current/opal.min.js');\n" + 
			             "try {\n";
			var suffix = "} catch(err) {\n" +
						 '	postMessage({ action:"error", data: err.toString() });\n' +
						 "}\n" +
			             'postMessage({ action: "complete", data: ' + id + '});';

			var program = prefix + "\n" + Opal.compile(apiHeader + "\n" + code) + "\n" + suffix;
			
			EventBus.fire("log", "Running script");
			EventBus.fire("playing", {});

			// console.log(program);
			startWorker(program, id);
		}
	}

	function stop() {
		$.each(workers, function(_, worker) {
			worker.terminate();
		});

		workers = {}

		EventBus.fire("stopped", {});
	}

	$.get("api.rb", function(code) {
		apiHeader = code;
	});

	EventBus.on("play", function(code) { play(code); });
	EventBus.on("stop", function(_) { stop(); });

	return {
		"play": play,
		"stop": stop
	}
}