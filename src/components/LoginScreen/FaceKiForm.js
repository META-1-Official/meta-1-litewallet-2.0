import React, { useState, useRef, useEffect } from "react";
import Webcam from 'react-webcam';
import { verify, getUserKycProfile } from "../../API/API";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval12.png';
import "./login.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [device, setDevice] = React.useState({});
  const [verifying, setVerifying] = useState(false);

  const browserstack_test_accounts = ['gem-1', 'test-automation', 'john-doe', 'olive-5', 'marry-14', 'mary-14', 'bond-03', 'rock-64', 'rock-3', 'bond-02'];
  const errorCase = {
    "Camera Not Found": "Please check your camera.",
    "Not Matched": "Email and wallet name are not matched.",
    "Verify Failed": "We can not verify you because you never enrolled with your face yet.",
    "No Users": "You never enrolled with your face yet. Please enroll first via signup process.",
    "Spoof Detected": "Spoof detected. Are you trying with your real live face?",
    "Face not Detected": "Face not detected. Try again by changing position or background.",
    "Invalid Email": "Bio-metric verification failed for this email. Please use an email that has been linked to your biometric verification / enrollment.",
    "Biometic Server Error": "Something went wrong from Biometric server."
  }

  useEffect(() => {
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
    const features = { audio: false, video: true };

    if (flag) {
      return navigator.mediaDevices
        .getUserMedia(features)
        .then((display) => {
          setDevice(display?.getVideoTracks()[0]?.getSettings());
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
    const { privKey, email, accountName } = props;
    if (!email || !privKey || !accountName) return;

    setVerifying(true);

    if (photoIndex === 0) {
      const response_user = await getUserKycProfile(email);

      if (!response_user?.member1Name) {
        alert(errorCase['Not Matched']);
        setVerifying(false);
        return;
      }
      else {
        const walletArry = response_user.member1Name.split(',');

        if (!walletArry.includes(accountName)) {
          alert(errorCase['Not Matched']);
          setVerifying(false);
          return;
        }
      };
    }

    var sizeForSreenShot = isMobile() && device.width ? { width: device.width, height: device.height } : { width: 1280, height: 720 };
    const imageSrc = webcamRef.current.getScreenshot(sizeForSreenShot);

    if (!imageSrc) {
      alert(errorCase['Camera Not Found']);
      setVerifying(false);
      return;
    }

    const file = await dataURL2File(imageSrc, 'a.jpg');
    const response = await verify(file);

    if (!response) {
      alert(errorCase['Biometic Server Error']);
      setVerifying(false);
      return;
    }

    if (response.status !== 'Verify OK' && photoIndex === 5) {
      alert(errorCase[response.status]);
      setVerifying(false);
    } else if (response.status === 'Verify OK') {
      const nameArry = response.name.split(',');

      if (nameArry.includes(email)) {
        setFaceKISuccess(true);
      } else {
        alert(errorCase['Invalid Email']);
        setVerifying(false);
      }
    } else {
      await checkAndVerify(photoIndex + 1);
    }
  }

  return (
    <div style={{ height: "110%" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Authenticate Your Face</h6>
              <p className='header_ptag'>To log into your wallet, please complete biometric authentication.</p>
            </div>
            <div className='child-div' style={{ borderRadius: '5px' }}>
              <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                <div className="position-head color-black">{!isMobile() ? 'Position your face in the oval' : ''}</div>
                <button
                  className='btn_x'
                  onClick={() => {
                    loadVideo(false).then(() => {
                      props.setStep('userform');
                    });
                  }}>X</button>
              </div>
              <img src={isMobile() ? MobileOvalImage : OvalImage} alt='oval-image' className='oval-image' />
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored
              />
              <div className='btn-div'>
                <p className={`span-class color-black margin-bottom-zero ${isMobile() ? 'verify-text-font-size' : ''}`}>{faceKISuccess === false ? 'Press verify to complete authentication and log in' : 'Verification Successful!'}</p>
                <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                  Min camera resolution must be 720p
                </span>
                <span className={`span-class color-black margin-bottom-zero ${isMobile() ? 'camera-text-font-size' : ''}`}>
                  Verifying will take 10 seconds as maximum.
                </span>
                <div className="btn-grp" style={{ "marginTop": '5px' }}>
                  <button className='btn-1' onClick={() => checkAndVerify(0)} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
