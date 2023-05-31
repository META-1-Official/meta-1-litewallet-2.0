import React, { useEffect, useState } from "react";
import MetaLoader from "../../UI/loader/Loader";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getUserKycProfile, getESigToken } from "../../API/API";

import {
  Button,
  Message,
  Checkbox,
  Form,
  Popup,
  Grid,
  Icon,
} from "semantic-ui-react";

export default function SubmitForm(props) {
  const [access, setAccess] = useState(localStorage.getItem('access') === 'true' ? true : false);
  const [recover, setRecover] = useState(localStorage.getItem('recover') === 'true' ? true : false);
  const [stored, setStored] = useState(localStorage.getItem('stored') === 'true' ? true : false);
  const [living, setLiving] = useState(localStorage.getItem('living') === 'true' ? true : false);
  const [signed, setSigned] = useState(props.signatureResult !== 'success' ? false : true);
  const [paid, setPaid] = useState(props.signatureResult !== 'success' ? false : true);
  const [subscription, setSubscription] = useState(localStorage.getItem('subscription') === 'false' ? false : true);

  const {isSubmitted, setIsSubmitted, email} = props;
  const { phone, firstName, lastName, accountName, password } = props;

  const isAllChecked = access && recover && stored && living && signed && paid;

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserKycProfile(email);
      if (response && response?.status?.isPayed === true ) setPaid(true);
      if (response && response?.status?.isPaidByCrypto === true ) setPaid(true);
      if (response && response?.status?.isSign === true) setSigned(true);
      if (response && response?.status?.isSign === true && response?.status?.isPayed === true) {
        props.setStep('signature');
      }
    }

    fetchData();
  }, [])

  const handleSign = async (e) => {
    if (signed && paid) {
      alert ('You already signed and paid with the current email');
    }
    else {
      try {
        const response = await getUserKycProfile(email);
        if (response && response?.status?.isSign === 1) {
          alert('You already signed E-Signature');
          setSigned(true);
          return;
        }
      } catch (err) {
        console.log('Error in getting user esignautre profile');
        return;
      }

      try {
        const token = await getESigToken(email, 'testkey');
        if (token.error === true) {
          return;
        } else if (token) {
          localStorage.setItem('e-signing-user', accountName);
          localStorage.setItem('password', password);
          localStorage.setItem('firstname', firstName);
          localStorage.setItem('lastname', lastName);
          localStorage.setItem('phone', phone);
          localStorage.setItem('email', email);
          localStorage.setItem('access', access);
          localStorage.setItem('recover', recover);
          localStorage.setItem('stored', stored);
          localStorage.setItem('living', living);
          localStorage.setItem('subscription', subscription);

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

  const handleClick = () => {
    setIsSubmitted(true);
    props.onSubmit();
  }

  return (
    <>
      {signed && paid && <div className="membership_head">
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
                          className="ui yellow right icon button"
                        >
                          <i className="copy icon" />
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
            >
              <Icon name='attention' />
              <div>
                <Message.Header className="important_msg_header">Important information</Message.Header>
                If you forget your passkey you will NOT be able to access your wallet or your funds. We are NO LONGER able to restore, reset, or redistribute lost coins, or help with lost passkeys. Please MAKE SURE you  copy your wallet name and passkey on to your computer and then transfer it to an offline storage location for easy access like a USB drive! Check our passkey storage tips knowledge article for more info
                <a target="__blank" href={`${process.env.REACT_APP_WALLET_FOOTER_SUPPORT_HREF}/password-storage-tips`}> here</a>
              </div>
            </Message>

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
                label="I have copied and stored my passkey"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => setLiving(!living)}
                checked={living}
                label="I am a living man or woman hence a living being"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => handleSign(e)}
                checked={signed && paid}
                label="Sign META Association Membership Agreement"
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                onChange={(e) => {
                  setSubscription(!subscription);
                  localStorage.setItem('subscription', !subscription);
                }}
                checked={subscription}
                label="I consent to receive emails about member events, platform news and other information from META Membership Association"
              />
            </Form.Field>

            {isSubmitted && <MetaLoader size={"small"} />}
            {!isSubmitted && (
              <Button
                className="sbBtn"
                onClick={handleClick}
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
