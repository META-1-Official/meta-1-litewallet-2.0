import React, {useEffect, useRef} from 'react';

const LogComponent = ({logs}) => {
	const endRef = useRef(null);

	const scrollToBottom = () => {
		endRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	// useEffect(scrollToBottom, [logs]);

	return (
		<div>
			<div style={{height: '300px', overflow: 'hidden', textAlign: 'left'}}>
				<div>
					<p>Test Log</p>
				</div>
				{logs.map((log, index) => (
					<div key={index}>
						<p
							style={{
								color:
									log.message.type === 'error'
										? 'red'
										: log.message.type === 'warning'
										? 'orange'
										: 'inherit',
							}}
						>
							[{log.timestamp.toLocaleTimeString()}]:{' '}
							{JSON.stringify(log.message.content)}
						</p>
					</div>
				))}
				<div ref={endRef} />
			</div>
		</div>
	);
};

export default LogComponent;
