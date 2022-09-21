import React, { useEffect, useState } from "react";
import { UserInformationForm } from "./UserInformationForm.js";
import SubmitForm from "./SubmitForm.js";
import createAccountWithPassword from "../../lib/createAccountWithPassword.js";
import { Button } from "semantic-ui-react";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";

import { checkOldUser } from "../../API/API";
import OpenLogin from '@toruslabs/openlogin';

import "./SignUpForm.css";
import FaceKiForm from "./FaceKiForm.js";
import MigrationForm from "./MigrationForm.js";

export default function SignUpForm(props) {
  const {
    onRegistration,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
    portfolio,
    isSignatureProcessing,
    signatureResult
  } = props;
  const [accountName, setAccountName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState('userform');
  const [authData, setAuthData] = useState(null);
  const [privKey, setPrivKey] = useState(null);

  useEffect(() => {
    if (isSignatureProcessing) {
      setAccountName(localStorage.getItem('login'));
      setPassword(localStorage.getItem('password'));
      setFirstName(localStorage.getItem('firstname'));
      setLastName(localStorage.getItem('lastname'));
      setPhone(localStorage.getItem('phone'));
      setEmail(localStorage.getItem('email'));
      setStep('signature');
    }
  }, [])

  const openLogin = new OpenLogin({
    clientId: process.env.REACT_APP_TORUS_PROJECT_ID,
    network: process.env.REACT_APP_TORUS_NETWORK,
    uxMode: 'popup',
    whiteLabel: {
      name: 'META1'
    },
  });

  const stepUserInfoSubmit = async (
    accName,
    pass,
    newPhone,
    newLastName,
    newFirstName
  ) => {
    setAccountName(accName);
    setFirstName(newFirstName);
    setPassword(pass);
    setLastName(newLastName);
    setPhone(newPhone);

    const response = await checkOldUser(accName);
    
    if (response?.found === true) {
      setStep('migration');
    }
    else renderTorusStep();
  };

  const stepGoToTorus = (
    accName,
    pass,
    newPhone,
    newLastName,
    newFirstName
  ) => {
    setAccountName(accName);
    setFirstName(newFirstName);
    setPassword(pass);
    setLastName(newLastName);
    setPhone(newPhone);
    renderTorusStep();
  };

  const stepGoToEsignature = () => {
    setStep('submit');
  };

  const stepLastSubmit = async () => {

    try {
      await createAccountWithPassword(
        accountName,
        password,
        false,
        "",
        1,
        "",
        phone,
        email,
        lastName,
        firstName
      );
      localStorage.removeItem('password');
      localStorage.removeItem('firstname');
      localStorage.removeItem('lastname');
      localStorage.removeItem('phone');
      localStorage.removeItem('email');
      onRegistration(accountName, password, email);
    } catch (e) { }
  };

  const renderStep = () => {
    switch (step) {
      case 'userform':
        return <UserInformationForm
          {...props}
          onSubmit={stepUserInfoSubmit}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          phone={phone}
        />
      case 'faceki':
        return <FaceKiForm
          {...props}
          onClick={stepGoToEsignature}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          email={email}
          privKey={privKey}
        />
      case 'migration':
        return <MigrationForm
          {...props}
          onClick={stepGoToTorus}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          email={email}
          privKey={privKey}
        />
      case 'submit':
        return <SubmitForm
          {...props}
          onSubmit={stepLastSubmit}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          privKey={privKey}
          email={email}
          phone={phone} />
      case 'signature':
        return <SubmitForm
          {...props}
          onSubmit={stepLastSubmit}
          accountName={accountName}
          lastName={lastName}
          firstName={firstName}
          password={password}
          privKey={privKey}
          email={email}
          signatureResult={signatureResult}
          phone={phone} />
      default:
        return null;
    }
  }

  const renderTorusStep = async () => {
    if (
      !openLogin
    ) {
      return;
    }

    try {
      await openLogin.init();
      await openLogin.login();
      if (openLogin.privKey) {
        const privKey = openLogin.privKey;
        const data = await openLogin.getUserInfo();

        setAuthData(data);
        setPrivKey(privKey);
        setEmail(data?.email);

        console.log('User logged in');
        setStep('faceki');
      }
    } catch (error) {
      console.log('Error in Torus Render', error);
    }
  }

  return (
    <>
      <div>
        <div
          style={{
            background: "#fff",
            width: "100%",
            height: "3.7rem",
            padding: "1.1rem 2rem",
            boxShadow: "0 9px 10px 0 rgba(0,0,0,0.11)",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "#240000" }}>META Lite Wallet</span>
        </div>
        <div className={"createWalletForm"}>
          <div className={"justFlexAndDirect"}>
            <div className={"regForm"}>
              <Button
                style={{ color: "#fdc000", fontSize: ".9rem" }}
                labelPosition="left"
              >
                <i
                  className="fal fa-arrow-left"
                  style={{ marginRight: ".5rem" }}
                />
                <span
                  style={{
                    borderBottom: "1px solid #fdc000",
                    color: "#fdc000",
                  }}
                >
                  Back
                </span>
              </Button>
              {renderStep()}
            </div>
            <div className={"adaptThing"}>
              <RightSideHelpMenuFirstType
                onClickExchangeEOSHandler={onClickExchangeEOSHandler}
                onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
                portfolio={portfolio}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
