import React, { useState, useEffect, useContext, useRef } from "react";
import { key, ChainValidation } from "meta1-vision-js";
import AccountApi from "../../lib/AccountApi";
import "./SignUpForm.css";
import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";
import { checkOldUser } from "../../API/API";

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
  const [firstName, setFirstName] = useState(props.firstName || "");
  const [lastName, setLastName] = useState(props.lastName || "");
  const [searchAccount, setSearchAccount] = useState([["PM", ""]]);
  const [touchedAccountName, setTouchedAccountName] = useState(false);
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
    lastName,
  ]);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;
  const isMobileTabIndex = width <= 767;

  return (
    <>
      <h2 className="head-title">Create META Wallet</h2>
      <Grid>
        <Grid.Column width={16} className="singup-grid">
          <Form autoComplete="off" onSubmit={setIsSubmitted}>
            <div className="field">
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
                  <Form.Field>
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
                  </Form.Field>
                </Grid.Column>
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
                  accountNameErrors ||
                  (searchAccount.length > 0 ? searchAccount[0][0] === accountName : false) ||
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