import React, { useState, useEffect, useContext, useRef } from "react";
import "./SignUpForm.css";
import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";
import countryCodes from '../../utils/countryCode.json'
import { MenuItem, Select } from "@mui/material";

const ALLOW_PHONE_NUMBER_KEY = ["Backspace", "Tab", "ArrowRight", "ArrowLeft"];

const AdditionalInformationForm = (props) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isTouchedCountry, setIsTouchedCountry] = useState(false);
  const [phone, setPhone] = useState(props.phone || "");
  const [email, setEmail] = useState(props.email || "");
  const [phoneFormat, setPhoneFormat] = useState(props.phoneFormat || "");
  const [phoneError, setPhoneError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [country, setCountry] = useState(props.country || "227");
  const [selectedCountryObj, setSelectedCountryObj] = useState(props.selectedCountryObj || {
    "id": 227,    
    "iso2": "US",
    "defaultName": "USA",
    "countryCode": "1",
    "patterns": [
      "XXX XXX XXXX"
    ]
  });

  const phoneRef = useRef();

  useEffect(() => {
    props.tmode === "email" && setPhone(`${selectedCountryObj.countryCode}${phoneFormat.replaceAll(' ', '')}`);
  }, [selectedCountryObj, phoneFormat]);

  const phoneNumberSpacingHandler = () => {
    let pattern = '';
    if (Array.isArray(selectedCountryObj.patterns)) {
      pattern = selectedCountryObj.patterns[0]
    }
    let spaceArr = [];
    let count = 0;
    for (let data of pattern) {
      if (data === " ") {
        spaceArr.push(count);
      }
      count++;
    }
    return spaceArr;
  }

  const phoneNumberChangeHandler = (event) => {
    if (!isNaN(event.target.value.replaceAll(' ', ''))) {
      if (event.target.value === "0") {
        setPhoneError(`Phone number can't start with 0`);
      } else if (event.target.value !== "0" && !event.target.value.includes('.')) {
        setPhoneError('');
        if (event.target.value === "") {
          setPhoneError(`Phone number can't be empty`);
        }
        if (!selectedCountryObj?.patterns) {
          setPhoneFormat(event.target.value);
        } else {
          const spacingArr = phoneNumberSpacingHandler();
          if (event.nativeEvent.inputType !== "deleteContentBackward" && spacingArr.includes(event.target.value.length)) {
            setPhoneFormat(event.target.value + " ");
          } else {
            setPhoneFormat(event.target.value);
          }
          // if (event.target.value.length !== selectedCountryObj?.patterns[0].length) {
          //   setPhoneError(`Phone number should be ${selectedCountryObj.patterns[0].replaceAll(' ', '').length} digits long`);
          // }
        }
      }
    }
  }

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) {
      props.onSubmit(
        phone,
        email
      );
    }
    return () => setIsSubmitted(false);
  }, [
    isSubmitted,
    props,
    phone,
    email
  ]);

  const MobileNumberError = phoneFormat.replaceAll(' ', '');

  useEffect(() => {
    if (!isSelectorOpen && isTouchedCountry) {
      if (phoneRef && phoneRef.current) {
        phoneRef.current.focus();
      }
    }
  }, [isSelectorOpen]);

  return (
    <>
      <h2 className="head-title">Additional Information</h2>
      <p className="disp-section">Congratulations, you successfully passed torus authentication with <b style={{color: '#ffcc00'}}> {props.tmode === 'email' ? props.email : `+${props.phone}`}</b>. 
        This time, we need to ask your {props.tmode === 'email' ? "phone number" : "email address"} for further process. Pleae be careful.
        You will need this {props.tmode === 'email' ? "number" : "email"} for {props.tmode === 'email' ? "sms" : "email"}_passwordless verification when you login.
      </p>
      <Grid>
        <Grid.Column width={16} className="singup-grid">
          <Form autoComplete="off" onSubmit={setIsSubmitted}>
            {props.tmode === "email" ? <Form.Field>
              <label >Phone Number</label>
              <div className="phone-number-div">
                <Select
                  tabIndex={3}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  open={isSelectorOpen}
                  onOpen={() => setIsSelectorOpen(true)}
                  onClose={() => {
                    setIsSelectorOpen(false);
                    setIsTouchedCountry(true);
                  }}
                  value={country}
                  className="country-code"
                  MenuProps={{ classes: { paper: 'options-height' } }}
                  label="Select"
                  onChange={(e) => {
                    const obj = countryCodes.find(data => data.id === Number(e.target.value));
                    setCountry(e.target.value);
                    setSelectedCountryObj(obj);
                    setPhoneFormat('');
                    setPhoneError('');
                  }}
                  style={{ maxHeight: '37px' }}
                >
                  {countryCodes?.map((data, index) => {
                    return <MenuItem key={index} value={data?.id}>
                      <div className="country-select-data">
                        <div>
                          <img className="countryFlag-img" src={`https://flagcdn.com/24x18/${data?.iso2.toLowerCase()}.png`} alt='flag' />
                          <span className={`countryName-span ${!isSelectorOpen ? 'hide-element' : ''}`} >{data.defaultName}</span>
                        </div>
                        <div className="countryCode-span">+{data?.countryCode}</div>
                      </div>
                    </MenuItem>
                  })}
                </Select>
                <input
                  tabIndex={4}
                  ref={phoneRef}
                  value={phoneFormat}
                  type='tel'
                  name="new-password"
                  className="phone-number-input"
                  onChange={(e) => phoneNumberChangeHandler(e)}
                  onKeyDown={(event) => {
                    if (!ALLOW_PHONE_NUMBER_KEY.includes(event.key) && !selectedCountryObj.patterns && phoneFormat.length === 15) {
                      event.preventDefault();
                    } else if (!ALLOW_PHONE_NUMBER_KEY.includes(event.key) && selectedCountryObj?.patterns && phoneFormat.length === selectedCountryObj.patterns[0].length) {
                      event.preventDefault();
                    } else if (event.key === " ") {
                      event.preventDefault();
                    }
                  }}
                  placeholder={Array.isArray(selectedCountryObj?.patterns) && selectedCountryObj?.patterns.length > 0 && selectedCountryObj?.patterns[0] ? selectedCountryObj?.patterns[0] : ''}
                  required
                />
              </div>
              {phoneError && (
                <p style={{ color: "red" }}>{phoneError}</p>
              )}
            </Form.Field> : <Form.Field>
              <label>Email</label>
              <input
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (
                    !/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
                      event.target.value
                    )
                  ) {
                    setEmailError("Invalid Email");
                  } else {
                    setEmailError(null);
                  }
                }}
                value={email}
                type="email"
                placeholder="Email"
                required
              />
              {emailError && (
                <p style={{ color: "red" }}> {emailError}</p>
              )}
            </Form.Field>
            }
            <Form.Field>
              <Button
                tabIndex={6}
                className="yellow"
                style={{ color: "#240000", marginTop: '1em' }}
                type="submit"
                disabled={
                  phoneError || emailError
                }
              >
                Continue
              </Button>
            </Form.Field>
          </Form>
        </Grid.Column>
      </Grid>
    </>
  );
};

export { AdditionalInformationForm };