import { message } from "antd";
import { camOptions } from "../constants/constants";

const getDevices = async (setDevices, setSelectedDevice, shouldCloseCamera) => {
    try {
        // Request camera permissions by getting a stream and then immediately closing it
        const dummyStream = await navigator.mediaDevices.getUserMedia({
            video: { ...camOptions },
        });

        // localTrackRef.current

        dummyStream
            .getTracks()
            .forEach((track) => (shouldCloseCamera ? track.stop() : null));

        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(
            (device) => device.kind === 'videoinput',
        );
        setDevices(videoDevices);

        console.log('VIDEO DEVICES: ', videoDevices);
        if (videoDevices.length > 0) {
            setSelectedDevice(videoDevices[0].deviceId);
        }
    } catch (error) {
        message.error(`Error accessing camera devices: ${error.toString()}`);
        console.error('Error accessing camera devices:', error);
    }
};

export default getDevices;
