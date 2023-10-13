import React, { useState, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";

import "./login.css";

export default function PassKeyForm(props) {
  const [passkey, setPasskey] = useState("");

  return (
    <Grid className="migration-page">
      <div className="migration_title">
        Input Your Passkey
      </div>
      <div className="migration_desc">
        To complete the one time biometrics upgrade, please enter your passkey to migrate your 2 Factor Biometric Authentication.
      </div>
      <Grid.Column width={16} className="singup-grid">
        <Form autoComplete="off">
          <div className="field">
            <Grid stackable>
              <Grid.Column>
                <Form.Field>
                  <label>META Legacy Wallet Name</label>
                  <input
                    control={Input}
                    value={props.accountName}
                    type="text"
                    contentEditable={false}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Email Address</label>
                  <input
                    control={Input}
                    value={props.email}
                    type="text"
                    contentEditable={false}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Your Passkey</label>
                  <input
                    control={Input}
                    value={passkey}
                    type="password"
                    placeholder="Enter passkey"
                    onChange={(event) => {
                      setPasskey(event.target.value);
                    }}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
          </div>
          <Form.Field>
            <Button
              className="red"
              style={{ color: "#240000", marginTop: '1em' }}
              onClick={() => props.setStep('userform')}
            >
              Back
            </Button>
            <Button
              className="yellow"
              style={{ color: "#240000", marginTop: '1em' }}
              disabled={props.accountName === "" || passkey === ""}
              onClick={() => props.onSubmit(passkey)}
            >
              Continue
            </Button>
          </Form.Field>
        </Form>
      </Grid.Column>
    </Grid>
  )
}
