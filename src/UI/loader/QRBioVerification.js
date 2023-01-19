import React, { useState, useRef, useEffect } from "react";
import Webcam from 'react-webcam';
import { liveLinessCheck, setQRPollVerified, findQRPoll } from "../../API/API";
import { isMobile } from "react-device-detect";
import './qrcode.css';

const QRBioVerification = (props) => {
    const webcamRef = useRef(null);
    const [faceKISuccess, setFaceKISuccess] = useState(false);
    const [device, setDevice] = React.useState({});
    const [verifying, setVerifying] = useState(false);
    const [exception, setException] = useState("");
    const qr_hash = localStorage.getItem("qr-hash");
    

    useEffect(async () => {
        var errEx = "";

        if (qr_hash) {
            const poll = await findQRPoll(qr_hash);
            if (poll && poll.error !== true) {
                if (poll.bio_verified === 1){
                    errEx += "Already verified. Please go back to your browser ";
                }
            } else {
                errEx += "Please check the link from QR has been edited. ";
            }
        }

        if (!isMobile) errEx += "Please scan QR via only Mobile ";

        setException(errEx);

        let features = {
            audio: false,
            video: true
        };
        let display = await navigator.mediaDevices.getUserMedia(features);
        setDevice(display?.getVideoTracks()[0]?.getSettings());
    }, []);

    const dataURLtoFile = (dataurl, filename) => {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const check = async () => {
        setVerifying(true);
        const imageSrc = device.width ? webcamRef.current.getScreenshot({ width: device.width, height: device.height }) : webcamRef.current.getScreenshot();

        if (!imageSrc) {
            alert('Check your camera.');
            setVerifying(false);
            return;
        };

        var file = dataURLtoFile(imageSrc, 'a.jpg');
        const response = await liveLinessCheck(file);

        if (!response || response.error === true) {
            alert('Something went wrong from Biometric server.');
            setVerifying(false);
            return;
        }

        if (response.data.liveness !== 'Genuine') {
            alert('Try again by changing position or background.');
            setVerifying(false);
        } else {
            const response_update = await setQRPollVerified(qr_hash, file);

            if (!response_update || response_update.error === true) {
                alert('Try again from QR code scanning.');
                setVerifying(false);
                return;
            }

            localStorage.removeItem('qr-hash');
            localStorage.removeItem('qr-bio');
            setFaceKISuccess(true);
            setVerifying(false);
        }
    }

    return (
        <>
            {
                !faceKISuccess && exception === "" && <div className='qr-code-mob-wrapper' style={{ height: window.innerHeight }}>
                    <h1 className="header-tag">Authenticate Your Face</h1>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ deviceId: device?.deviceId }}
                        mirrored
                        height={"100%"}
                        className="qr-webcam"
                    />
                    <div className='qr-code-mob-btn-div'>
                        <p className={"span-class color-black margin-bottom-zero"}>Press the below button to continue</p>
                        <div className="btn-grp" style={{ "marginTop": '5px' }}>
                            <button className={!faceKISuccess ? 'btn-1' : 'btn-disabled'} onClick={check}>{verifying ? "Liveness Checking..." : "Continue"}</button>
                        </div>
                    </div>
                </div>
            }
            {
                !faceKISuccess && exception !== "" && <div className='qr-code-mob-wrapper' style={{ height: window.innerHeight }}>
                    <p className="header-tag" style={{ height: "100%", fontSize: 30, color: "red" }}>{exception}</p>
                </div>
            }
            {
                faceKISuccess && <div className='qr-code-mob-wrapper' style={{ height: window.innerHeight }}>
                    <p className="header-tag" style={{ height: "100%", fontSize: 30, color: "green" }}>Successfully Passed. Please go back your browser to continue.</p>
                </div>
            }
        </>
    )
}

export default QRBioVerification;
