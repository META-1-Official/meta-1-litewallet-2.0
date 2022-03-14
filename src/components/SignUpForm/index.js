import React, { useState } from "react";
import { UserInformationForm } from "./UserInformationForm.js";
import SubmitForm from "./SubmitForm.js";
import createAccountWithPassword from "../../lib/createAccountWithPassword.js";
import { Button, Grid, Icon } from "semantic-ui-react";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";

import "./SignUpForm.css";

export default function SignUpForm(props) {
  const {
    onRegistration,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
    portfolio,
  } = props;
  const [accountName, setAccountName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);

  const stepFirstSubmit = (
    accName,
    pass,
    newEmail,
    newPhone,
    newLastName,
    newFirstName
  ) => {
    setAccountName(accName);
    setFirstName(newFirstName);
    setPassword(pass);
    setEmail(newEmail);
    setLastName(newLastName);
    setPhone(newPhone);
    setStep(2);
  };

  const stepSecondSubmit = async () => {
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
      localStorage.setItem("login", accountName);
      window.location.reload();
      onRegistration(accountName, password, email);
    } catch (e) {}
  };

  const stepForm =
    step === 1 ? (
      <UserInformationForm
        {...props}
        onSubmit={stepFirstSubmit}
        accountName={accountName}
        lastName={lastName}
        firstName={firstName}
        password={password}
        email={email}
        phone={phone}
      />
    ) : (
      <SubmitForm onSubmit={stepSecondSubmit} password={password} />
    );

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
                onClick={step === 1 ? props.onBackClick : () => setStep(1)}
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
              {stepForm}
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
