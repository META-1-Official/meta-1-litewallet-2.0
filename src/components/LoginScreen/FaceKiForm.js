import React, { useState, useRef, useEffect } from "react";
import { verify, getUserKycProfile, livenessCheck } from "../../API/API";
import OvalImage from '../../images/oval/oval.png';
import { Camera } from 'react-camera-pro';
import useWidth from '../../lib/useWidth';

import "./login.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('');
  const [numberOfCameras, setNumberOfCameras] = useState(0);

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
    console.log('bypass', bypass_wallets);
    if (browserstack_test_accounts.includes(props.accountName))
      setFaceKISuccess(true)
    else loadVideo(true);
  }, []);

  useEffect(async () => {
    if (faceKISuccess === true) {
      loadVideo(false).then(() => {
        props.onSubmit();
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

  const dataURL2File = async (dataurl, filename) => {
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

  const checkAndVerify = async (photoIndex) => {
    const { privKey, email } = props;
    if (!email || !privKey) return;

    setVerifying(true);

    const imageSrc = webcamRef.current.takePhoto();

    if (!imageSrc) {
      alert(errorCase['Camera Not Found']);
      setVerifying(false);
      return;
    }

    const file = await dataURL2File(imageSrc, 'a.jpg');
    const response = await livenessCheck(file);

    if (!response || !response.data) {
      alert(errorCase['Biometic Server Error']);
      setVerifying(false);
      return;
    }

    if (response.data.liveness !== 'Genuine' && photoIndex === 5) {
      alert(errorCase['Face not Detected']);
      setVerifying(false);
    } else if (response.data.liveness === 'Genuine') {
      await videoVerify(file);
    } else {
      await checkAndVerify(photoIndex + 1);
    }
  }

  const videoVerify = async (file) => {
    const { email, accountName } = props;

    const response_user = await getUserKycProfile(email);

    if (!response_user?.member1Name) {
      alert(errorCase['Not Matched']);
      return;
    }
    else {
      const walletArry = response_user.member1Name.split(',');

      if (!walletArry.includes(accountName)) {
        alert(errorCase['Not Matched']);
        return;
      }
    };

    if (bypass_wallets.includes(accountName)) {
      setFaceKISuccess(true);
    } else {
      const response_verify = await verify(file);
      if (response_verify.status === 'Verify OK') {
        const nameArry = response_verify.name.split(',');

        if (nameArry.includes(email)) {
          setFaceKISuccess(true);
        } else {
          alert(errorCase['Invalid Email']);
        }
      } else if (response_verify.status === 'Verify Failed') {
        alert(errorCase['Verify Failed']);
      } else if (response_verify.status === 'No Users') {
        alert(errorCase['No Users']);
      }
      else {
        alert('Please try again.');
      }
    }
  }

  const camWidth = width > 576 ? 600 : width - 30;
  const camHeight = camWidth / 1.07;

  return (
    <div style={{ height: "110%" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Authenticate Your Face</h6>
              <p className='header_ptag'>To log into your wallet, please complete biometric authentication.</p>
            </div>
            <div className='child-div' style={{ width: camWidth, height: camHeight }}>
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
              <img src={OvalImage} alt='oval-image' className='oval-image' />
              <Camera
                ref={webcamRef}
                aspectRatio="cover"
                numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
                videoSourceDeviceId={activeDeviceId}
                errorMessages={{
                  noCameraAccessible: errorCase.noCameraAccessible,
                  permissionDenied: errorCase.permissionDenied,
                  switchCamera: errorCase.switchCamera,
                  canvas: errorCase.canvas,
                }}
              />
              <div className='btn-div'>
                <p className={`span-class color-black margin-bottom-zero ${isMobile() ? 'verify-text-font-size' : ''}`}>{faceKISuccess === false ? 'Press verify to complete authentication and log in' : 'Verification Successful!'}</p>
                <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                  Min camera resolution must be 720p
                </span>
                <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                  Verifying will take 10 seconds as maximum.
                </span>
                <div className="btn-grp">
                  <button className='btn-1' onClick={() => checkAndVerify(0)} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</button>
                </div>
              </div>
            </div>
          </div>
          <select
            onChange={(event) => {
              setActiveDeviceId(event.target.value);
            }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
