import React, { useState, useRef, useEffect } from "react";
import { fasEnroll, getFASToken, getUserKycProfile, livenessCheck } from '../../API/API';
import useWidth from '../../lib/useWidth';
import FASClient from '../../modules/biometric-auth/FASClient';

import "./login.css";
import { TASK } from "../../modules/biometric-auth/constants/constants";

export default function FaceKiForm(props) {
  const { email, privKey, accountName } = props;

  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('');
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [token, setToken] = useState(null);

  const width = useWidth();

  const browserstack_test_accounts = ['gem-1', 'test-automation', 'john-doe', 'olive-5', 'marry-14', 'mary-14', 'bond-03', 'rock-64', 'rock-3', 'antman-kok357', 'bond-02', 'user-x01', 'jin124'];
  const bypass_wallets = process.env.REACT_APP_FACEKI_SKIP_WALLETS.split(',');
  const errorCase = {
    "Camera Not Found": "Please check your camera.",
    "Not Matched": "Email and wallet name are not matched.",
    "Verify Failed": "We can not verify you because you never enrolled with your face yet.",
    "No Users": "You never enrolled with your face yet. Please enroll first via signup process.",
    "Spoof Detected": "Spoof detected. Are you trying with your real live face?",
    "Face not Detected": "Try again by changing position or background.",
    "Invalid Email": "Bio-metric verification failed for this email. Please use an email that has been linked to your biometric verification / enrollment.",
    "Biometic Server Error": "Something went wrong from Biometric server.",
    noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
    permissionDenied: 'Permission denied. Please refresh and give camera permission.',
    switchCamera:
      'It is not possible to switch camera to different one because there is only one video device accessible.',
    canvas: 'Canvas is not supported.',
  }

  useEffect(() => {
    (async () => {
      const { token } = await getFASToken(email, TASK.VERIFY);
      setToken(token);
    })()
  }, []);

  const fasClient = useRef();
  useEffect(() => {
    if (token) {
      console.log('Loading fas');
      if (fasClient.current) {
        fasClient.current.load();
      }
    }
  }, [token]);

  useEffect(() => {
    if (browserstack_test_accounts.includes(props.accountName))
      setFaceKISuccess(true)
    else loadVideo(true);
  }, []);

  useEffect(() => {
    if (faceKISuccess === true) {
        props.onSubmit();
    }
  }, [faceKISuccess])

  const loadVideo = async (flag) => {
    const videoTag = document.querySelector('video');

    if (flag) {
      return navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((i) => i.kind == 'videoinput');
          setDevices(videoDevices);
          setActiveDeviceId(videoDevices[0]?.deviceId);
        })
        .finally(() => {
          return true;
        });
    } else {
      try {
        for (const track of videoTag.srcObject.getTracks()) track.stop();
        videoTag.srcObject = null;
      } catch (err) {
        console.log('[loadVideo]', err);
      }

      return Promise.resolve();
    }
  }

  const isMobile = () => {
    return window.innerWidth < window.innerHeight;
  }

  const videoVerify = async (token) => {
    const { message } = await fasEnroll(email, privKey, token);

    if (message === "Successfully Enrolled") {
      setFaceKISuccess(true);
    } else {
      alert(errorCase['Verify Failed']);
      alert('Please try again.');
    }
  }

  const camWidth = width > 576 ? 600 : width - 30;
  const camHeight = camWidth / 1.07;

  if (browserstack_test_accounts.includes(props.accountName)) return null;

  return (
    <div style={{ height: "110%" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Authenticate Your Face</h6>
              <p className='header_ptag'>To log into your wallet, please complete biometric authentication.</p>
            </div>
            <div className='child-div' style={{ width: camWidth, height: '100%' }}>
              <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                <div className="position-head color-black">Position your face in the oval</div>
                <button
                  className='btn_x'
                  onClick={() => {
                    loadVideo(false).then(() => {
                      props.setStep('userform');
                    });
                  }}>X</button>
              </div>
              {!token ? 'loading ...' : (
                <FASClient
                  ref={fasClient}
                  token={token}
                  username={email}
                  task={TASK.VERIFY}
                  activeDeviceId={activeDeviceId}
                  onComplete={videoVerify}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
