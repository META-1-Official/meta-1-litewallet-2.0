import React, { useState } from "react";
import MetaLoader from "../../UI/loader/Loader";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isAllChecked = access && recover && stored && living;

  return (
    <Grid>
      <Grid.Column style={{ marginTop: "1rem" }} width={16}>
        <Form>
          <Form.Field>
            <label>Passkey</label>
            <div className="ui action input">
              <input value={props.password} type="text" disabled style={{ opacity: '1' }} />
              <Popup
                content="Copy to Clipboard."
                trigger={
                  <CopyToClipboard text={props.password} onCopy={() => {}}>
                    <button
                      name="copyToken"
                      style={{ color: "#240000" }}
                      class="ui yellow right icon button"
                    >
                      <i class="copy icon" />
                    </button>
                  </CopyToClipboard>
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
  );
}
