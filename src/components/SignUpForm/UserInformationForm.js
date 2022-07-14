import React, { useState, useEffect, useContext } from "react";
import { key, ChainValidation } from "meta1-vision-js";
import AccountApi from "../../lib/AccountApi";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./SignUpForm.css";

import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";

const useDebounce = (value, timeout) => {
  const [state, setState] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setState(value), timeout);

    return () => clearTimeout(handler);
  }, [value, timeout]);

  return state;
};

const UserInformationForm = (props) => {
  const [generatedPassword, setGeneratedPassword] = useState("");
  useEffect(() => {
    if (generatedPassword === "") {
      setGeneratedPassword(`P${key.get_random_key().toWif().toString()}`);
    }
  }, [generatedPassword]);

  const [accountName, setAccountName] = useState(props.accountName || "");
  const debouncedAccountName = useDebounce(accountName, 100);
  const [accountNameErrors, setAccountNameErrors] = useState(null);
  const [email, setEmail] = useState(props.email || "");
  const [firstName, setFirstName] = useState(props.firstName || "");
  const [lastName, setLastName] = useState(props.lastName || "");
  const [phone, setPhone] = useState(props.phone || "");
  const [password, setPassword] = useState("");
  const [searchAccount, setSearchAccount] = useState([["PM", ""]]);
  const [touchedAccountName, setTouchedAccountName] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);
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
  useEffect(() => {
    const error = ChainValidation.is_account_name_error(debouncedAccountName);
    const error1 = isVowelsNotExistAndHasNumber(debouncedAccountName);
    if (error) {
      if (!error1) {
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
    } else if (!error1) {
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
        email,
        phone,
        lastName,
        firstName
      );
    }
    return () => setIsSubmitted(false);
  }, [
    firstName,
    isSubmitted,
    accountName,
    generatedPassword,
    props,
    email,
    lastName,
    phone,
  ]);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;
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
                      value={firstName}
                      onChange={(event) => {
                        setFirstName(event.target.value);
                        if (!/^[A-Za-z]{0,63}$/.test(event.target.value)) {
                          setFirstNameError(
                            "Your First Name must not contain special characters"
                          );
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
                  <Form.Field>
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
                </Grid.Column>

                <Grid.Column width={isMobile ? 16 : 8}>
                  <Form.Field>
                    <label>Last Name</label>
                    <input
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value);
                        if (!/^[A-Za-z]{0,63}$/.test(event.target.value)) {
                          setLastNameError(
                            "Your Last Name must not contain special characters"
                          );
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
                  </Form.Field>
                  <Form.Field>
                    <label>Phone Number</label>
                    <input
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (
                          !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g.test(
                            event.target.value
                          )
                        ) {
                          setPhoneError("Invalid Phone");
                        } else {
                          setPhoneError(null);
                        }
                      }}
                      title="+1-234-567-8900"
                      placeholder="Phone Number"
                      pattern="+[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      type="tel"
                      required
                    />
                    {phoneError && (
                      <p style={{ color: "red" }}> {phoneError}</p>
                    )}
                  </Form.Field>
                </Grid.Column>
              </Grid>
            </div>

            <Form.Field>
              <label>Account Name</label>
              <input
                control={Input}
                value={accountName}
                type="text"
                error={accountNameErrors}
                placeholder="Account Name"
                onChange={({ target }) => {
                  setAccountName(target.value.toLocaleLowerCase());
                  setTouchedAccountName(true);
                }}
              />
              {accountName && accountNameErrors?.content && touchedAccountName ? (
                <p style={{ color: "red" }}> {accountNameErrors?.content}</p>
              ) : null}
            </Form.Field>

            <Form.Field>
              <label>Copy Wallet Passkey</label>
              <div className="ui action input">
                <input value={generatedPassword} type="text" disabled className="dark-wallet-key" />
                <CopyToClipboard text={generatedPassword} onCopy={() => {}}>
                  <div
                    name="copyToken"
                    className="ui yellow right icon button brown"
                  >
                    <i className="fal fa-copy" />
                  </div>
                </CopyToClipboard>
              </div>
            </Form.Field>

            <Form.Field>
              <label>Passkey Confirmation</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Field>
            {searchAccount.length > 0 && searchAccount[0][0] === accountName && (
              <p style={{ color: "red" }}>Account is already used </p>
            )}
            <div>
                <span style={{ fontFamily: 'inherit', color: 'red' }}>Please make sure you have copied and SAVED your Passkey in another location (such as a word document or to your note pad) before clicking on the Submit Button. If you have not saved this Passkey, it can NOT be recovered.</span>
            </div>
            <Form.Field>
              <Button
                // onClick={() => setIsSubmitted(true)}
                className="yellow"
                style={{ color: "#240000", marginTop:'1em' }}
                type="submit"
                disabled={
                  firstName === "" ||
                  lastName === "" ||
                  email === "" ||
                  phone === "" ||
                  accountNameErrors ||
                  password !== generatedPassword ||
                  (searchAccount.length > 0 ? searchAccount[0][0] === accountName : false) ||
                  emailError ||
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
