import React, { useState, useEffect } from "react";
import MetaLoader from "../../UI/loader/Loader";
import { validateSignature } from "../../API/API";
import { Button, Form, Grid, Input, Popup } from "semantic-ui-react";

import "./SignUpForm.css";

export default function MigrationForm(props) {
  const [passkey, setPasskey] = useState("");

  const handleClick = async () => {
    const response = await validateSignature(props.accountName, passkey);
    if (response?.isValid === true) {
      props.onClick(
        props.accountName,
        props.password,
        props.phone,
        props.lastName,
        props.firstName
      );
    }
    else {
      alert("Private Key is invalid");
      return;
    }
  }

  return (
    <Grid className="migration-page">
      <Grid.Column width={16} className="singup-grid">
        <Form autoComplete="off">
          <div className="field">
            <Grid stackable>
              <Grid.Column>
                <Form.Field>
                  <label>Meta Wallet Name</label>
                  <input
                    control={Input}
                    value={props.accountName}
                    type="text"
                    contentEditable={false}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Your Private Passkey</label>
                  <input
                    control={Input}
                    value={passkey}
                    type="text"
                    placeholder="Enter your owner private key"
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
              className="yellow"
              style={{ color: "#240000", marginTop: '1em' }}
              disabled={
                props.accountName === "" ||
                passkey === ""
              }
              onClick={handleClick}
            >
              Import Wallet
            </Button>
          </Form.Field>
        </Form>
      </Grid.Column>
    </Grid>
  )
}
