import React, { useEffect, useState } from "react";
import MetaLoader from "../../UI/loader/Loader";
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "axios";
import { getUserKycProfile, getESigToken } from "../../API/API";

import {
  Button,
  Message,
  Checkbox,
  Form,
  Popup,
  Grid,
} from "semantic-ui-react";

export default function SubmitForm(props) {
  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const [access, setAccess] = useState(false);
  const [recover, setRecover] = useState(false);
  const [stored, setStored] = useState(false);
  const [living, setLiving] = useState(false);
  const [signed, setSigned] = useState(props.signatureResult === 'success' ? true : false);
  const [paid, setPaid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isAllChecked = access && recover && stored && living && signed;

  useEffect(async () => {
    const response = await getUserKycProfile(props.email);
    if (response && response.status.isPaid === 1 && response.status.isSign === 1) {
      setSigned(true);
      setPaid(true);
    }
  }, [])

  const handleSign = async (e) => {
    if (!signed) {
      const { email, phone, firstName, lastName, accountName, password } = props;

      try {
        const response = await getUserKycProfile(email);
        if (response && response.status.isPaid === 1 && response.status.isSign === 1) {
          alert('You already signed E-Signature');
          setSigned(true);
          return;
        }
      } catch (err) {
        console.log('Error in getting user esignautre profile');
        return;
      }

      try {
        const token = await getESigToken(email);
        if (token) {
          localStorage.setItem('login', accountName);
          localStorage.setItem('password', password);
          localStorage.setItem('firstname', firstName);
          localStorage.setItem('lastname', lastName);
          localStorage.setItem('phone', phone);
          localStorage.setItem('email', email);

          window.location.href = `${process.env.REACT_APP_ESIGNATURE_URL
            }/e-sign?email=${encodeURIComponent(
              email
            )}&firstName=${firstName}&lastName=${lastName}&phoneNumber=${phone}&walletName=${accountName}&token=${token}&redirectUrl=${window.location.origin
            }`;
        } else {
          return;
        }
      } catch (err) {
        console.log('Error in e-sign token generation');
        return;
      }
    }
  }

  return (
    <>
      {signed && <div className="membership_head">
        <p style={{ fontSize: '20px', color: '#00AD6A' }}>
          Congratulations Payment Successful! You are now a META 1 Member! Click Submit to Continue
        </p>
      </div>
      }
      <Grid>
        <Grid.Column style={{ marginTop: "1rem" }} width={16}>
          <Form>
            <Form.Field>
              <label>Passkey</label>
              <div className="ui action input">
                <input value={props.password} type="text" disabled className="dark-wallet-key" />
                <Popup
                  content="Copy to Clipboard."
                  trigger={
                    <div>
                      <CopyToClipboard text={props.password} onCopy={() => { }}>
                        <button
                          name="copyToken"
                          style={{ color: "#240000" }}
                          class="ui yellow right icon button"
                        >
                          <i class="copy icon" />
                        </button>
                      </CopyToClipboard>
                      <span className="copy_text copy_text_passkey">Copy</span>
                    </div>
                  }
                />
              </div>
            </Form.Field>

            <Message
              className={"messageRed"}
              icon="attention"
              header="Important information"
              content="If you forget your passkey phrase you will be unable to access your account and your funds. We cannot reset or restore your passkey! Memorize or write down your username and passkey!"
            />

            <Form.Field>
              <Checkbox
                onChange={(e) => setAccess(!access)}
                checked={access}
                label="I understand that I will lose access to my funds if I lose my passkey"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => setRecover(!recover)}
                checked={recover}
                label="I understand that no one can recover my passkey if I lose or forget it"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => setStored(!stored)}
                checked={stored}
                label="I have written down or otherwise stored my passkey"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => setLiving(!living)}
                checked={living}
                label=" I am a living man or woman hence a living being"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => handleSign(e)}
                checked={signed}
                label=" Sign META Association Membership Agreement"
              />
            </Form.Field>

            {isSubmitted && <MetaLoader size={"small"} />}
            {!isSubmitted && (
              <Button
                className="sbBtn"
                onClick={() => {
                  setIsSubmitted(true);
                  props.onSubmit();
                }}
                disabled={!isAllChecked}
                type="submit"
              >
                Submit
              </Button>
            )}
          </Form>
        </Grid.Column>
      </Grid>
    </>
  );
}
