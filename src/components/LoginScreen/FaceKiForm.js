import React, { useState, useRef, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { liveLinessCheck, verify, getUserKycProfile } from "../../API/API";
import { Button, Icon, Modal } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval19.png';
import MobileOvalImage from '../../images/oval/oval12.png';
import QRCodeModal from "../../UI/loader/QRCodeModal";
import "./login.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [device, setDevice] = React.useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [mobileScreenSize, setMobileScreenSize] = useState({
    width: '',
    height: ''
  });
  const childDivRef = useRef();

  useEffect(() => {
    loadVideo(true);
  }, []);

  useEffect(() => {
    if (childDivRef?.current?.clientWidth && childDivRef?.current?.clientHeight) {
      setMobileScreenSize({
        width: childDivRef.current.clientWidth,
        height: childDivRef.current.clientHeight
      });
    }
  }, [childDivRef.current]);

  useEffect(async () => {
    if (faceKISuccess === true) {
      loadVideo(false).then(() => {
        props.onSubmit();
      });
    }
  }, [faceKISuccess])

  const loadVideo = async (flag) => {
    const videoTag = document.querySelector('video');
    const features = {audio: false, video: true};

    if (flag) {
      return navigator.mediaDevices
        .getUserMedia(features)
        .then((display) => {
          setDevice(display?.getVideoTracks()[0]?.getSettings());
          isMobileHandler();
          window.addEventListener('resize', isMobileHandler);
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

  const isMobileHandler = () => {
    const { innerWidth: width } = window;
    const isMobile = width <= 767;
    setIsMobile(isMobile);
  }

  const dataURL2File = (dataurl, filename) => {
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

  // const file2Url = file => new Promise((resolve, reject) => {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = () => resolve(reader.result);
  //   reader.onerror = error => reject(error);
  // });

  const videoVerify = async () => {
    const { email, accountName } = props;

    setVerifying(true);
    const response_user = await getUserKycProfile(email);

    if (!response_user?.member1Name) {
      alert('Email and wallet name are not matched.');
      setVerifying(false);
      return;
    }
    else {
      const walletArry = response_user.member1Name.split(',');

      if (!walletArry.includes(accountName)) {
        alert('Email and wallet name are not matched.');
        setVerifying(false);
        return;
      }
    };

    var file = dataURL2File(photo, 'a.jpg');
    const response_verify = await verify(file);

    if (response_verify.status === 'Verify OK') {
      const nameArry = response_verify.name.split(',');

      if (nameArry.includes(email)) {
        setFaceKISuccess(true);
        setVerifying(false);
      } else {
        alert('Bio-metric verification failed for this email. Please use an email that has been linked to your biometric verification / enrollment.');
        setVerifying(false);
      }
    } else if (response_verify.status === 'Verify Failed') {
      alert('We can not verify you because you never enrolled with your face yet.');
      setVerifying(false);
    } else if (response_verify.status === 'No Users') {
      alert('You never enrolled with your face yet. Please enroll first via signup process.');
      setVerifying(false);
    }
    else {
      alert('Please try again.');
      setVerifying(false);
    }
  }

  const takePhoto = async () => {
    // const imageSrc = device.width ? webcamRef.current.getScreenshot({ width: device.width, height: device.height }) : webcamRef.current.getScreenshot();
    const imageSrc = webcamRef.current.getScreenshot({ width: 1270, height: 720 });

    if (!imageSrc) {
      alert('Check your camera.');
      return;
    };

    var file = dataURL2File(imageSrc, 'a.jpg');
    const response = await liveLinessCheck(file);

    if (!response || response.error === true) {
      alert('Something went wrong from Biometric server.');
      return;
    }

    if (response.data.liveness !== 'Genuine') {
      alert('Try again by changing position or background.');
      return;
    } else {
      setPhoto(imageSrc);
    }
  }

  const resetPhoto = async () => {
    setPhoto(null);
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
              <div className='child-div' ref={childDivRef} >
                {photo === null && <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                  <div className="position-head color-black">{!isMobile ? 'Position your face in the oval' : ''}</div>
                  <button className='btn_x' onClick={() => props.setStep('userform')}>X</button>
                </div>}
                {!isMobile && photo === null && <img src={OvalImage} alt='oval-image' className='oval-image' />}
                {photo === null && <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={isMobile ? {
                    width: mobileScreenSize.width - 10,
                    height: mobileScreenSize.height - 10,
                  } : { deviceId: device?.deviceId }}
                  width={isMobile ? mobileScreenSize.width - 20 : 550}
                  height={isMobile ? mobileScreenSize.height - 50 : device?.aspectRatio ? 550 / device?.aspectRatio : 385}
                  mirrored
                />}
                {photo && <img
                  src={photo}
                  className="photo"
                  style={{
                    width: isMobile ? mobileScreenSize.width - 20 : 550,
                    height: isMobile ? mobileScreenSize.height - 50 : device?.aspectRatio ? 550 / device?.aspectRatio : 385
                  }}
                />}
                <div className='btn-div'>
                  <p className={`span-class color-black margin-bottom-zero ${isMobile ? 'verify-text-font-size' : ''}`}>{faceKISuccess === false ? 'Press verify to complete authentication and log in' : 'Verification Successful!'}</p>
                  <span className={`span-class color-black margin-bottom-zero ${isMobile ? 'camera-text-font-size' : ''}`}>
                    Min camera resolution must be 720p
                  </span>
                  <div className="btn-grp" style={{ "marginTop": '5px' }}>
                    <button className='btn-1' onClick={photo ? resetPhoto : takePhoto} style={{ "marginRight": '20px' }}>{photo ? "Reset Photo" : "Take Photo"}</button>
                    {photo && <button className='btn-1' onClick={videoVerify} >{verifying ? "Verifying..." : "Verify"}</button>}
                    <button className='btn-1' style={{ "marginLeft": '20px' }} onClick={() => setQrOpen(true)}>Take Photo via Mobile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {qrOpen && <QRCodeModal
        open={qrOpen}
        setOpen={(val) => setQrOpen(val)}
        acc={props.accountName}
        email={props.email}
        setPhoto={(val) => setPhoto(val)}
        mode={'login'}
      />
      }
    </>
  )
}
