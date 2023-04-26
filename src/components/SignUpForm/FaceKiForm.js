import React, { useState, useRef, useEffect } from "react";
import { livenessCheck, verify, enroll, remove, getUserKycProfile, postUserKycProfile } from "../../API/API";
import OvalImage from '../../images/oval/oval.png';
import "./SignUpForm.css";
import { Camera } from 'react-camera-pro';
import useWidth from '../../lib/useWidth';

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState('');
  const [numberOfCameras, setNumberOfCameras] = useState(0);

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
    "New Name Generation Fail": "Can not generate new name!",
    noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
    permissionDenied: 'Permission denied. Please refresh and give camera permission.',
    switchCamera:
      'It is not possible to switch camera to different one because there is only one video device accessible.',
    canvas: 'Canvas is not supported.',
  }

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

  const checkAndEnroll = async (photoIndex) => {
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
      alert(errorCase['Not Proper Condition']);
      setVerifying(false);
    } else if (response.data.liveness === 'Genuine') {
      await faceEnroll(file);
    } else {
      await checkAndEnroll(photoIndex + 1);
    }
  }

  const faceEnroll = async (file) => {
    const { privKey, email } = props;

    const response_verify = await verify(file);
    if (response_verify.status === 'Verify OK') {
      const nameArry = response_verify.name.split(',');

      if (nameArry.includes(email)) {
        alert(errorCase['Already Enrolled']);
        setFaceKISuccess(true);
      } else {
        const response_user = await getUserKycProfile(email);
        if (response_user.error === true) {
          alert(errorCase['ESignature Server Error']);
          setVerifying(false);
        } else if (response_user) {
          alert(errorCase['Email Already Used']);
          setVerifying(false);
        } else {
          const newName = response_verify.name + "," + email;

          if (!newName) {
            alert(errorCase['New Name Generation Fail']);
            setVerifying(false);
          } else {
            const response_enroll = await enroll(file, newName);
            if (!response_enroll) {
              alert(errorCase['ESignature Server Error']);
              setVerifying(false);
            } else {
              if (response_enroll.status === 'Enroll OK') {
                await remove(response_verify.name);
                const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
                if (add_response.result) {
                  setFaceKISuccess(true);
                } else {
                  alert(errorCase['ESignature Server Error']);
                  setVerifying(false);
                }
              } else {
                alert(errorCase[response_enroll.status]);
                setVerifying(false);
              }
            }
          }
        }
      }
    } else if (response_verify.status === 'Verify Failed' || response_verify.status === 'No Users') {
      const response_user = await getUserKycProfile(email);
      if (response_user.error === true) {
        alert(errorCase['ESignature Server Error']);
        setVerifying(false);
      } else if (response_user) {
        alert(errorCase['Email Already Used']);
        setVerifying(false);
      } else {
        const response_enroll = await enroll(file, email);
        if (response_enroll.status === 'Enroll OK') {
          const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
          if (add_response.result) {
            alert('Successfully enrolled.');
            setFaceKISuccess(true);
          }
          else {
            await remove(email);
            alert(errorCase['ESignature Server Error']);
            setVerifying(false);
          }
        }
      }
    } else {
      alert('Please try again.');
      setVerifying(false);
    }
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
              <div className='child-div' style={{ width: camWidth, height: camHeight }}>
                <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                <div className="position-head color-black">{!isMobile() ? 'Position your face in the oval' : ''}</div>
                <button className='btn_x'
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
                  <p className={`span-class color-black margin-bottom-zero ${isMobile() ? 'verify-text-font-size' : ''}`}>{faceKISuccess === false ? 'Press verify to begin enrollment' : 'Verification Successful!'}</p>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                    Min camera resolution must be 720p
                  </span>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                    Verifying will take 10 seconds as maximum.
                  </span>
                  <div className="btn-grp">
                    <button className='btn-1' disabled={verifying} onClick={() => checkAndEnroll(0)}>{verifying ? "Verifying..." : "Verify"}</button>
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
    </>
  )
}
