import React, { useState, useEffect, useContext, useRef } from "react";
import { key, ChainValidation } from "meta1-vision-js";
import AccountApi from "../../lib/AccountApi";
import "./SignUpForm.css";
import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";
import countryCodes from '../../utils/countryCode.json'
import { MenuItem, Select } from "@mui/material";
import { checkOldUser } from "../../API/API";

const useDebounce = (value, timeout) => {
  const [state, setState] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setState(value), timeout);

    return () => clearTimeout(handler);
  }, [value, timeout]);

  return state;
};
const ALLOW_PHONE_NUMBER_KEY = ["Backspace" , "Tab", "ArrowRight", "ArrowLeft"];

const UserInformationForm = (props) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isTouchedCountry, setIsTouchedCountry] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("");
  const phoneRef = useRef();
  useEffect(() => {
    if (generatedPassword === "") {
      setGeneratedPassword(`P${key.get_random_key().toWif().toString()}`);
    }
  }, [generatedPassword]);

  const [accountName, setAccountName] = useState(props.accountName || "");
  const debouncedAccountName = useDebounce(accountName, 100);
  const [accountNameErrors, setAccountNameErrors] = useState(null);
  const [firstName, setFirstName] = useState(props.firstName || "");
  const [lastName, setLastName] = useState(props.lastName || "");
  const [phone, setPhone] = useState(props.phone || "");
  const [phoneFormat, setPhoneFormat] = useState(props.phoneFormat || "");
  const [searchAccount, setSearchAccount] = useState([["PM", ""]]);
  const [touchedAccountName, setTouchedAccountName] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
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

  useEffect(() => {
    setPhone(`+${selectedCountryObj.countryCode}${phoneFormat.replaceAll(' ', '')}`)
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

  useEffect(() => {
    if (accountName) {
      AccountApi.lookupAccounts(accountName, 1)
        .then((res) => setSearchAccount(res))
        .catch((err) => console.log(err));
    }
  }, [accountName]);
  
  const hasNumber = (myString) => {
    return /\d/.test(myString);
  }
  const isVowelsNotExistAndHasNumber = (str) => {
    if (hasNumber(str)) {
      if (str.includes("-")) {
        return true;
      }
      return false;
    } else {
      return false;
    }
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
          if (event.target.value.length !== selectedCountryObj?.patterns[0].length) {
            setPhoneError(`Phone number should be ${selectedCountryObj.patterns[0].replaceAll(' ', '').length} digits long`);
          }
        }
      }
    }
  }

  useEffect(async () => {
    const error = ChainValidation.is_account_name_error(debouncedAccountName);
    const error1 = isVowelsNotExistAndHasNumber(debouncedAccountName);
    const res_old = await checkOldUser(debouncedAccountName);

    if (error) {
      if (res_old?.found !== true && !error1) {
        setAccountNameErrors({
          content:
            "Please enter a wallet nickname (not your personal name) containing at least one dash, a number",
          pointing: "below",
        });
      } else {
        setAccountNameErrors({
          content: error,
          pointing: "below",
        });
      }
    } else if (res_old?.found !== true && !error1) {
      setAccountNameErrors({
        content:
          "Please enter a wallet nickname (not your personal name) containing at least one dash, a number",
        pointing: "below",
      });
    } else {
      setAccountNameErrors(null);
    }
  }, [debouncedAccountName]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) {
      props.onSubmit(
        accountName,
        generatedPassword,
        phone,
        lastName,
        firstName,
        phoneFormat,
        country,
        selectedCountryObj
      );
    }
    return () => setIsSubmitted(false);
  }, [
    firstName,
    isSubmitted,
    accountName,
    generatedPassword,
    props,
    lastName,
    phone,
  ]);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;
  const isMobileTabIndex = width <= 767;

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
      <h2 className="head-title">Create META Wallet</h2>
      <Grid>
        <Grid.Column width={16} className="singup-grid">
          <Form autoComplete="off" onSubmit={setIsSubmitted}>
            <div className="field">
              <Grid stackable>
                <Grid.Column width={isMobile ? 16 : 8}>
                  <Form.Field>
                    <label>First Name</label>
                    <input
                      tabIndex={1}
                      value={firstName}
                      onChange={(event) => {
                        setFirstName(event.target.value);
                        if (!/^[A-Za-z]{0,63}$/.test(event.target.value)) {
                          if (event.target.value.includes(' ')) {
                            setFirstNameError(
                              "Whitespace character is not allowed."
                            );
                          } else if (/\d/.test(event.target.value)) {
                            setFirstNameError(
                              "Numbers are not allowed."
                            );
                          } else {
                            setFirstNameError(
                              "Your First Name must not contain special characters."
                            );
                          }
                        } else {
                          setFirstNameError(null);
                        }
                      }}
                      placeholder="First Name"
                      required
                    />
                    {firstNameError && (
                      <p style={{ color: "red" }}> {firstNameError}</p>
                    )}
                  </Form.Field>
                  {!isMobile ? <Form.Field>
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
                          if ( !ALLOW_PHONE_NUMBER_KEY.includes(event.key) && !selectedCountryObj.patterns && phoneFormat.length === 15 ) {
                            event.preventDefault();
                          } else if ( !ALLOW_PHONE_NUMBER_KEY.includes(event.key) && selectedCountryObj?.patterns && phoneFormat.length === selectedCountryObj.patterns[0].length ) {
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
                    <label>Last Name</label>
                    <input
                      tabIndex={2}
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value);
                        if (!/^[A-Za-z]{0,63}$/.test(event.target.value)) {
                          if (event.target.value.includes(' ')) {
                            setLastNameError(
                              "Whitespace character is not allowed."
                            );
                          } else if (/\d/.test(event.target.value)) {
                            setLastNameError(
                              "Numbers are not allowed."
                            );
                          } else {
                            setLastNameError(
                              "Your Last Name must not contain special characters."
                            );
                          }
                        } else {
                          setLastNameError(null);
                        }
                      }}
                      placeholder="Last Name"
                      required
                    />
                    {lastNameError && (
                      <p style={{ color: "red" }}> {lastNameError}</p>
                    )}
                  </Form.Field>}
                </Grid.Column>
                <Grid.Column width={isMobile ? 16 : 8}>
                  {!isMobile ? <Form.Field>
                    <label>Last Name</label>
                    <input
                      tabIndex={2}
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value);
                        if (!/^[A-Za-z]{0,63}$/.test(event.target.value)) {
                          if (event.target.value.includes(' ')) {
                            setLastNameError(
                              "Whitespace character is not allowed."
                            );
                          } else if (/\d/.test(event.target.value)) {
                            setLastNameError(
                              "Numbers are not allowed."
                            );
                          } else {
                            setLastNameError(
                              "Your Last Name must not contain special characters."
                            );
                          }
                        } else {
                          setLastNameError(null);
                        }
                      }}
                      placeholder="Last Name"
                      required
                    />
                    {lastNameError && (
                      <p style={{ color: "red" }}> {lastNameError}</p>
                    )}
                  </Form.Field> : <Form.Field>
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
                        name="new-password"
                        type='tel'
                        className="phone-number-input"
                        onChange={(e) => phoneNumberChangeHandler(e)}
                        onKeyDown={(event) => {
                          if ( !ALLOW_PHONE_NUMBER_KEY.includes(event.key) && !selectedCountryObj.patterns && phoneFormat.length === 15 ) {
                            event.preventDefault();
                          } else if ( !ALLOW_PHONE_NUMBER_KEY.includes(event.key) && selectedCountryObj?.patterns && phoneFormat.length === selectedCountryObj.patterns[0].length ) {
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
                  </Form.Field>}
                </Grid.Column>
              </Grid>
            </div>

            <Form.Field>
              <label>Wallet Name</label>
              <input
                tabIndex={5}
                control={Input}
                value={accountName}
                type="text"
                name="new-password"
                error={accountNameErrors}
                placeholder="Wallet Name"
                onChange={({ target }) => {
                  setAccountName(target.value.toLocaleLowerCase());
                  setTouchedAccountName(true);
                }}
              />
              {accountName && accountNameErrors?.content && touchedAccountName ? (
                <p style={{ color: "red" }}> {accountNameErrors?.content}</p>
              ) : null}
              {searchAccount.length > 0 && searchAccount[0][0] === accountName && (
                <p style={{ color: "red" }}>Account is already used </p>
              )}
            </Form.Field>
            <Form.Field>
              <Button
                tabIndex={6}
                className="yellow"
                style={{ color: "#240000", marginTop: '1em' }}
                type="submit"
                disabled={
                  firstName === "" ||
                  lastName === "" ||
                  phone === "" ||
                  phone === undefined ||
                  MobileNumberError === "" ||
                  accountNameErrors ||
                  (searchAccount.length > 0 ? searchAccount[0][0] === accountName : false) ||
                  phoneError ||
                  firstNameError ||
                  lastNameError
                }
              >
                Submit
              </Button>
            </Form.Field>
          </Form>
        </Grid.Column>
      </Grid>
    </>
  );
};

export { UserInformationForm };