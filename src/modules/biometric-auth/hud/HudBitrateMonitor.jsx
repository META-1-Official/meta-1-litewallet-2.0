import React, {useImperativeHandle, useState} from 'react';
import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';
import '../css/bitrate-monitor.css'; // Add your CSS file for additional styling

const HudBitrateMonitor = React.forwardRef((props, ref) => {
	const [upBitrate, setUpBitrate] = useState(0);
	const [downBitrate, setDownBitrate] = useState(0);
	const [downBps, setDownBps] = useState(0);
	const [upBps, setUpBps] = useState(0);

	useImperativeHandle(ref, () => ({
		setPc: (pc) => {
			let lastBytesSent = 0;
			let lastBytesReceived = 0;
			let lastTimestamp = Date.now();

			setInterval(async () => {
				const stats = await pc.getStats();
				let bytesSent = 0;
				let bytesReceived = 0;

				stats.forEach((report) => {
					if (report.type === 'outbound-rtp') {
						bytesSent += report.bytesSent;
					} else if (report.type === 'inbound-rtp') {
						bytesReceived += report.bytesReceived;
					}
				});

				const now = Date.now();
				const elapsedTime = (now - lastTimestamp) / 1000; // Convert to seconds

				const bitrateSent = (8 * (bytesSent - lastBytesSent)) / elapsedTime; // in bits per second
				const bitrateReceived =
					(8 * (bytesReceived - lastBytesReceived)) / elapsedTime; // in bits per second

				setDownBps(bitrateReceived.toFixed(2));
				setUpBps(bitrateSent.toFixed(2));

				// console.log(`Send bitrate: ${bitrateSent.toFixed(2)} bps`);
				// console.log(`Receive bitrate: ${bitrateReceived.toFixed(2)} bps`);

				lastBytesSent = bytesSent;
				lastBytesReceived = bytesReceived;
				lastTimestamp = now;

				stats.forEach((report) => {
					if (
						report.type === 'candidate-pair' &&
						report.state === 'succeeded'
					) {
						// console.log("report", report)
						setUpBitrate(
							typeof report.availableOutgoingBitrate !== 'undefined'
								? report.availableOutgoingBitrate
								: 0
						);
						setDownBitrate(
							typeof report.availableIncomingBitrate !== 'undefined'
								? report.availableIncomingBitrate
								: 0
						); // Note: Not all browsers support incoming bitrate
					}
				});
			}, 1000);
		},
	}));

	const formatBitrate = (bitrate) => {
		if (bitrate > 1000000) return (bitrate / 1000000).toFixed(2) + ' Mbps';
		if (bitrate > 1000) return (bitrate / 1000).toFixed(2) + ' kbps';
		return bitrate + ' bps';
	};

	const getColor = (bitrate) => {
		return 'white';
		// if (bitrate > 5000000) return 'darkgreen';
		// if (bitrate > 0) return 'orange';
		// return 'darkred';
	};

	return (
		<div className="bitrate-monitor">
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					fontSize: '8px',
				}}
			>
				<div>
					<div style={{fontSize: '10px', marginBottom: '2px'}}>ABW</div>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<div style={{color: getColor(upBitrate)}}>
							{formatBitrate(upBitrate)} <ArrowUpOutlined />
						</div>
						<div
							style={{
								color: getColor(downBitrate),
								marginLeft: '-3px',
								marginRight: '7px',
							}}
						>
							<ArrowDownOutlined /> {formatBitrate(downBitrate)}
						</div>
					</div>
				</div>
				<div>
					<div style={{fontSize: '10px', marginBottom: '2px'}}>CBW</div>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<div style={{color: getColor(upBps)}}>
							{formatBitrate(upBps)} <ArrowUpOutlined />
						</div>
						<div style={{color: getColor(downBps), marginLeft: '-3px'}}>
							<ArrowDownOutlined /> {formatBitrate(downBps)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

export default HudBitrateMonitor;
