import {useCallback, useEffect, useState} from 'react';

const useDevices = (activeDeviceId) => {
	const [devices, setDevices] = useState([]);
	const [selectedDevice, setSelectedDevice] = useState(activeDeviceId || null);

	const handleDevices = useCallback(
		(mediaDevices) =>
			setDevices(mediaDevices.filter(({kind}) => kind === 'videoinput')),
		[setDevices]
	);

	useEffect(() => {
		navigator.mediaDevices.enumerateDevices().then(handleDevices);
	}, [handleDevices]);

	useEffect(() => {
		if (devices.length > 0) {
			setSelectedDevice(devices[0].deviceId);
		}
	}, [devices]);

	return [devices, selectedDevice, setSelectedDevice];
};

export default useDevices;
