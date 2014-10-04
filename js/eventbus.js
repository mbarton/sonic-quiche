EventBus = (function(){
	subscribers = {}
	nextId = 0;

	function on(action, callback) {
		var id = nextId;
		nextId++;

		var newSubscribers = [{
			id: nextId,
			subscriber: callback
		}]

		if(action in subscribers) {
			newSubscribers = newSubscribers.concat(subscribers[action]);
		}

		subscribers[action] = newSubscribers;

		return id;
	}

	function remove(action, id) {
		if(action in subscribers) {
			var newSubscribers = [];
			$.each(subscribers[action], function(_, entry) {
				if(entry.id != id) {
					newSubscribers.push(entry);
				}
			});

			subscribers[action] = newSubscribers;
		}
	}

	function fire(action, data) {
		if(action in subscribers) {
			$.each(subscribers[action], function(_, entry) {
				entry.subscriber(data);
			});
		}
	}

	return {
		"on": on,
		"fire": fire
	}
})();