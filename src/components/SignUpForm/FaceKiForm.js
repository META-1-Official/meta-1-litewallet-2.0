import React, { useState, useRef, useEffect } from "react";
import { fasEnroll, getFASToken, fasMigrationStatus } from '../../API/API';
import "./SignUpForm.css";
import useWidth from '../../lib/useWidth';
import { TASK } from '../../modules/biometric-auth/constants/constants';
import FASClient from '../../modules/biometric-auth/FASClient';

export default function FaceKiForm(props) {
  const { email, privKey, accountName, token: fasToken } = props;

  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('');
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [task, setTask] = useState(TASK.REGISTER);
  const [token, setToken] = useState(fasToken);

  const width = useWidth();

  const errorCase = {
    "Already Enrolled": "You already enrolled and verified successfully.",
    "Camera Not Found": "Please check your camera.",
    "Spoof Detected": "Spoof detected. Are you trying with your real live face?",
    "Face not Detected": "Face not detected. Try again by changing position or background.",
    "Not Proper Condition": "Try again by changing position or background.",
    "Biometic Server Error": "Something went wrong from Biometric server.",
    "ESignature Server Error": "Something went wrong from ESignature server.",
    "Email Already Used": "This email already has been used for another user.",
    "Successfully Enrolled": "You successfully enrolled your face",
    "Please try again.": "Please try again.",
    "Internal Error": "Internal Error",
    "New Name Generation Fail": "Can not generate new name!",
    noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
    permissionDenied: 'Permission denied. Please refresh and give camera permission.',
    switchCamera:
      'It is not possible to switch camera to different one because there is only one video device accessible.',
    canvas: 'Canvas is not supported.',
  }

  useEffect(() => {
    if (!fasToken) {
      (async () => {
        const { doesUserExistsInFAS } = await fasMigrationStatus(email);
        setTask(doesUserExistsInFAS ? TASK.VERIFY : TASK.REGISTER);

        const { token } = await getFASToken({
          account: doesUserExistsInFAS ? accountName : null,
          email,
          task: doesUserExistsInFAS ? TASK.VERIFY : TASK.REGISTER
        });
        setToken(token);
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
    loadVideo(true);
  }, []);

  useEffect(async () => {
    if (faceKISuccess === true) {
      loadVideo(false).then(() => {
        props.onClick();
      });
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

  const faceEnroll = async (token) => {
    fasClient.current.unload()
    setVerifying(true);
    if (task === TASK.VERIFY) {
      console.log(errorCase['Already Enrolled']);
      localStorage.setItem('fastoken', token);
      setFaceKISuccess(true);
      setVerifying(false);
    } else {
      const response = await fasEnroll(email, privKey, token);

      if (!response) {
        console.log(errorCase['Biometic Server Error']);
        setVerifying(false);
      } else {
        console.log(errorCase[response.message]);
        if (response.message === 'Successfully Enrolled') {
          localStorage.setItem('fastoken', token);
          setFaceKISuccess(true);
        }
        setVerifying(false);
      }
    }
  }

  const onFailure = () => {
    fasClient.current.unload()
    alert('Email is already enrolled, please verify yourself');
    // setTask(TASK.REGISTER);
  }

  const onCancel = () => {
    fasClient.current.unload()
    loadVideo(false).then(() => {
      props.setStep('userform');
    });
  }

  const camWidth = width > 576 ? 600 : width - 30;
  const camHeight = camWidth / 1.07;

  return (
    <>
      <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
        <div className='under-div'>
          <div className='header_tag'>
            <div className="webcam_div">
              <div className='header_p'>
                <h6 style={{ fontSize: '24px' }}>Bio-Metric 2 Factor Authentication</h6>
                <p className='header_ptag'>Next, we will setup your Biometric two factor authentication, to ensure the security of your wallet</p>
              </div>
              <div className='child-div' style={{ width: camWidth, height: '100%', color: 'var(--textBrown)' }}>
                {(!token || !task)? 'loading ...' : (
                  <FASClient
                    ref={fasClient}
                    token={token}
                    username={email}
                    task={task}
                    activeDeviceId={activeDeviceId}
                    onComplete={faceEnroll}
                    onFailure={onFailure}
                    onCancel={onCancel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
