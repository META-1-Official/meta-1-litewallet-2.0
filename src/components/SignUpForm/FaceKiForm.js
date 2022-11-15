import React, { useState, useRef } from "react";
import MetaLoader from "../../UI/loader/Loader";
import Webcam from 'react-webcam';
import { liveLinessCheck, verify, enroll, remove, getUserKycProfile, postUserKycProfile } from "../../API/API";
import { Button } from "semantic-ui-react";
import OvalImage from '../../images/oval/oval10.png';
import OvalImageMobile from '../../images/oval/oval11.png';
import "./SignUpForm.css";

export default function FaceKiForm(props) {
  const webcamRef = useRef(null);
  const [faceKISuccess, setFaceKISuccess] = useState(false);
  const { innerWidth: width } = window;
  const isMobile = width <= 678;
  const [device, setDevice] = React.useState({});

  React.useEffect(
    async () => {
      let features = {
        audio: false,
        video: {
          width: { ideal: 1800 },
          height: { ideal: 900 }
        }
      };
      let display = await navigator.mediaDevices.getUserMedia(features);
      setDevice(display?.getVideoTracks()[0]?.getSettings());
    },
    []
  );

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

  const videoEnroll = async () => {
    const { privKey, email } = props;
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      alert('Check your camera');
      return;
    };

    var file = dataURLtoFile(imageSrc, 'a.jpg');

    const response = await liveLinessCheck(file);

    if (response.data.liveness !== 'Genuine') {
      if (response.data.box.h > 120)
        alert('You are too close to the camera.')
      else {
        alert('Please check your background and try again.')
      }
    } else {
      const response_verify = await verify(file);
      if (
        response_verify.status === 'Verify OK'
      ) {
        const nameArry = response_verify.name.split(',');

        if (nameArry.includes(email)) {
          alert('You already enrolled and verified successfully.');
          setFaceKISuccess(true);
          return;
        }

        const newName = response_verify.name + "," + email;
        const response_remove = await remove(response_verify.name);

        if (!response_remove) {
          alert('Something went wrong.')
        } else {
          const response_enroll = await enroll(file, newName);
          if (response_enroll.status === 'Enroll OK') {
            const add_response = await postUserKycProfile(email, `usr_${email}_${privKey}`);
            if (add_response.result) {
              alert('Successfully enrolled.');
              setFaceKISuccess(true);
            }
            else {
              alert('Something went wrong.');
            }
          }
        }
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
            alert('Something went wrong.');
          }
        }
      }
    }
  }

  return (
    <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
      <div className='under-div'>
        <div className='header_tag'>
          <div className="webcam_div">
            <div className='header_p'>
              <h6 style={{ fontSize: '24px' }}>Bio-Metric 2 Factor Authentication</h6>
              <p className='header_ptag'>Next, we will setup your Biometric two factor authentication, to ensure the security of your wallet</p>
            </div>
            <div className='child-div'>
              <div style={{ width: '100%', display: 'flex', height: '30px', zIndex: '5' }}>
                <div className="position-head color-black">Position your face in the oval</div>
                <button className='btn_x' onClick={() => props.setStep('userform')}>X</button>
              </div>
              {!isMobile && <img src={OvalImage} alt='oval-image' className='oval-image' />}
              {isMobile && <img src={OvalImageMobile} alt='oval-image' className='oval-image' />}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ deviceId: device?.deviceId }}
                width={500}
                height={device?.aspectRatio ? 500 / device?.aspectRatio : 385}
                mirrored
              />
              <div className='btn-div'>
                <p className='span-class color-black'>{faceKISuccess === false ? 'Press verify to begin enrollment' : 'Verification Successful!'}</p>
                <div className="btn-grp">
                  <button className={!faceKISuccess ? 'btn-1' : 'btn-1 btn-disabled'} disabled={faceKISuccess === true} onClick={videoEnroll}>Verify</button>
                  <Button
                    onClick={() => props.onClick()}
                    className={faceKISuccess ? 'btn-2' : 'btn-disabled'}
                    disabled={faceKISuccess === false}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
