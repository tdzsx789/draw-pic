const portPool = [];

onconnect = function (e) {
	const port = e.ports[0];
	portPool.push(port);

	port.onmessage = function (e) {
		if (e.data === 'TO BE CLOSED') {
			const index = portPool.findIndex(p => p === port);
			portPool.splice(index, 1);
		}
		boardcast(e.data, port);
	}
}

function boardcast(message, sendPort) {
	portPool.forEach(port => {
		if (port === sendPort) return;
		port.postMessage(message);
	})
}
