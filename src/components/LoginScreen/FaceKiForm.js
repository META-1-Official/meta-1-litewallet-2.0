import React, { useState, useRef, useEffect } from "react";
import { fasEnroll, getFASToken, getUserKycProfile, livenessCheck } from '../../API/API';
import useWidth from '../../lib/useWidth';
import FASClient from '../../modules/biometric-auth/FASClient';

import "./login.css";
import { TASK } from "../../modules/biometric-auth/constants/constants";

export default function FaceKiForm(props) {
  const { email, privKey, accountName, token: fasToken } = props;

  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('');
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [token, setToken] = useState(fasToken);

  const width = useWidth();

  const browserstack_test_accounts = process.env.REACT_APP_BROWSERSTACK_TEST_WALLETS.split(',') ?? [];
  const bypass_wallets = process.env.REACT_APP_BY_PASS_WALLETS.split(',') ?? [];

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
    if (accountName && email && !fasToken && !browserstack_test_accounts.includes(props.accountName)) {
      (async () => {
        const { token } = await getFASToken({
          account: accountName,
          email,
          task: TASK.VERIFY
        });
        if (token) {
          setToken(token);
        } else {
          alert(`Email and wallet name doesn't match`);
          props.setStep('userform');
        }
      })()
    }
  }, [fasToken]);

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
    if (browserstack_test_accounts.includes(props.accountName)) {
      setFaceKISuccess(true);
      props.onSubmit(accountName, email, token);
    }
    else loadVideo(true);
  }, []);

  const loadVideo = async (flag) => {
    const video = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
      .then(stream => {
        if (flag) {
          setActiveDeviceId(stream.getVideoTracks()[0].getSettings().deviceId);
        } else {
          stream.getVideoTracks()[0].stop();
          video.srcObject = null;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return Promise.resolve();
  }

  const isMobile = () => {
    return window.innerWidth < window.innerHeight;
  }

  const videoVerify = async (token) => {
    if (token) {
      fasClient.current.unload();
      setFaceKISuccess(true);
      props.onSubmit(accountName, email, token);
    } else if (bypass_wallets.includes(accountName)) {
      setTimeout(() => {
        setFaceKISuccess(true);
        props.onSubmit(accountName, email);
      }, 2500);
    }
  }

  const onCancel = () => {
    props.setStep('userform');
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
            <div className='child-div' style={{ width: camWidth, height: '100%', color: 'var(--textBrown)' }}>
              {!token ? 'loading ...' : (
                <FASClient
                  ref={fasClient}
                  token={token}
                  username={email}
                  task={fasToken ? TASK.REGISTER : TASK.VERIFY}
                  activeDeviceId={activeDeviceId}
                  onComplete={videoVerify}
                  onCancel={onCancel}
                  bypass={bypass_wallets.includes(props.accountName)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
