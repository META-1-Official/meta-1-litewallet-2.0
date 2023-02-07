import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { livenessCheck, verify, getUserKycProfile } from "../../API/API";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval19.png';
import QRCodeModal from "../../UI/loader/QRCodeModal";
import { isMobile } from "react-device-detect";
import "./login.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [device, setDevice] = React.useState({});
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadVideo(true);
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

    var sizeForSreenShot = isMobile && device.width ? { width: device.width, height: device.height } : { width: 1280, height: 720 };
    const imageSrc = webcamRef.current.getScreenshot(sizeForSreenShot);

    if (!imageSrc) {
      alert('Please check your camera.');
      setVerifying(false);
      return;
    }

    const file = await dataURL2File(imageSrc, 'a.jpg');
    const response = await livenessCheck(file);

    if (!response || !response.data) {
      alert('Something went wrong from Biometric server.');
      setVerifying(false);
      return;
    }

    if (response.data.liveness !== 'Genuine' && photoIndex === 5) {
      alert('Try again by changing position or background.');
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
      alert('Email and wallet name are not matched.');
      return;
    }
    else {
      const walletArry = response_user.member1Name.split(',');

      if (!walletArry.includes(accountName)) {
        alert('Email and wallet name are not matched.');
        return;
      }
    };

    const response_verify = await verify(file);
    if (response_verify.status === 'Verify OK') {
      const nameArry = response_verify.name.split(',');

      if (nameArry.includes(email)) {
        setFaceKISuccess(true);
      } else {
        alert('Bio-metric verification failed for this email. Please use an email that has been linked to your biometric verification / enrollment.');
      }
    } else if (response_verify.status === 'Verify Failed') {
      alert('We can not verify you because you never enrolled with your face yet.');
    } else if (response_verify.status === 'No Users') {
      alert('You never enrolled with your face yet. Please enroll first via signup process.');
    }
    else {
      alert('Please try again.');
    }
  }

  return (
    <>
      <div style={{ height: "110%" }} className={"totalSumBlock"}>
        <div className='under-div'>
          <div className='header_tag'>
            <div className="webcam_div">
              <div className='header_p'>
                <h6 style={{ fontSize: '24px' }}>Authenticate Your Face</h6>
                <p className='header_ptag'>To log into your wallet, please complete biometric authentication.</p>
              </div>
              <div className='child-div' style={{ borderRadius: '5px', padding: '1px' }}>
                <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                  <div className="position-head color-black">{!isMobile ? 'Position your face in the oval' : ''}</div>
                  <button className='btn_x' onClick={() => props.setStep('userform')}>X</button>
                </div>
                <img src={isMobile ? MobileOvalImage : OvalImage} alt='oval-image' className='oval-image' />
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored
                />
                <div className='btn-div'>
                  <p className={`span-class color-black margin-bottom-zero ${isMobile ? 'verify-text-font-size' : ''}`}>{faceKISuccess === false ? 'Press verify to complete authentication and log in' : 'Verification Successful!'}</p>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
                    Min camera resolution must be 720p
                  </span>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
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
      {/* qrOpen && <QRCodeModal
        open={qrOpen}
        setOpen={(val) => setQrOpen(val)}
        acc={props.accountName}
        email={props.email}
        setPhoto={(val) => setPhoto(val)}
      />*/}
    </>
  )
}
