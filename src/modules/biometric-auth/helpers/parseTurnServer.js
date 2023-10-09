const parseTurnServer = () => {
	const _servers = JSON.parse(process.env.REACT_APP_TURN_SERVERS);
	const servers = [];
	for (const turnServer of _servers) {
		const _s = turnServer.split('@');

		let server = {
			urls: _s[0],
		};

		if (_s.length > 1) {
			server = {
				urls: _s[1],
				username: _s[0].split(':')[0],
				credential: _s[0].split(':')[1],
			};
		}

		servers.push(server);
	}

	return servers;
};

export default parseTurnServer;
