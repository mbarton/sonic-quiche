function SQEngine() {
	var worker_template = null;
	var workers = {};
	var code = "";

	function handleEvent(event) {
		switch(event.action) {
			case "complete":
				delete workers[event.thread_id];

				if($.isEmptyObject(workers)) {
					EventBus.fire("stopped");
				}
				break;

			case "worker":
				var newThreadId = event.data;
				if(!(newThreadId in workers)) {
					startWorker(newThreadId);
				}
				break;

			case "log":
			case "warn":
			case "error":
				EventBus.fire(event.action, event.data);
				break;

			default:
				EventBus.fire(event.action, {thread_id: event.thread_id, data: event.data});
		}
	}

	function startWorker(id) {
		var codeBlob = new Blob([code], {type: "application/javascript"});
		workers[id] = new Worker(URL.createObjectURL(codeBlob));
		workers[id].onmessage = function(e) {
			handleEvent(e.data);
		}
		workers[id].postMessage({thread_id: id});
	}

	function play(newCode) {
		stop();

		if(worker_template == null) {
			EventBus.fire("log", "Cannot compile - haven't finished downloading api.rb yet");
		} else {
			EventBus.fire("log", "Compiling script");
			var rawWorkerCode = worker_template.replace("[[code_body]]", newCode);
			code =
				'importScripts("http://cdn.opalrb.org/opal/current/opal.min.js");\n' +
				Opal.compile(rawWorkerCode);
			
			EventBus.fire("log", "Running script");
			EventBus.fire("playing", {});

			console.log(code);
			startWorker(0);
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
		worker_template = code;
	});

	EventBus.on("play", function(code) { play(code); });
	EventBus.on("stop", function(_) { stop(); });

	return {
		"play": play,
		"stop": stop
	}
}