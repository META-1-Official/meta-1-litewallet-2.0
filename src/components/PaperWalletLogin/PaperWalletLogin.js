/* eslint-disable array-callback-return */
import React, { useEffect, useState } from "react";
import { generateKeyFromPassword } from "../../lib/createAccountWithPassword";
import { Button, Form, FormField } from "semantic-ui-react";
import useDebounce from "../../lib/useDebounce";
import { PrivateKey, ChainStore } from "meta1-vision-js";
import { createPaperWalletAsPDF } from "./CreatePdfWallet";
import Meta1 from "meta1-vision-dex";
import "./style.css";
import { useSelector } from "react-redux";
import { portfolioReceiverSelector } from "../../store/meta1/selector";
import { accountsSelector } from "../../store/account/selector";

export default function PaperWalletLogin({ accountName }) {
  const accountNameState = useSelector(accountsSelector);
  const [account, setAccount] = useState(accountNameState);
  const [password, setPassword] = useState("");
  const [readyToCreate, setReadyToCreate] = useState(false);
  const [accountChecked, setAccountChecked] = useState(true);
  const [check, setCheck] = useState(false);
  const debouncedAccount = useDebounce(account, 500);
  const portfolioReceiverState =  useSelector(portfolioReceiverSelector);
  const acc = ChainStore.getAccount(account, false);
  useEffect(() => {
    if (account?.length > 0) {
      async function fetchAccount(debouncedAccount) {
        // Сделать запрос к АП
        try {
          const res = await portfolioReceiverState.fetch(debouncedAccount);
          if (!res) {
            setAccountChecked(false);
            return;
          }
          setAccountChecked(true);
        } catch (e) {
          setAccountChecked(false);
        }
      }

      if (debouncedAccount) {
        fetchAccount(debouncedAccount);
      } else {
        setAccountChecked(false);
      }
    }
  }, [debouncedAccount, account]);

  const handleSubmit = () => {
    setReadyToCreate(true);
  };

  const handleCreatePaperWallet = async () => {
    try {
      await Meta1.login(accountNameState, password);
      const keys = getPrivateKeys();
      setCheck(false);
      createPaperWalletAsPDF(
        accountNameState,
        keys['owner'],
        keys['active'],
        keys['memo']
      );
    } catch (e) {
      setCheck(true);
    }
  };

  const getPrivateKeys = () => {
    let passwordKeys = {};

    let fromWif;
    try {
      fromWif = PrivateKey.fromWif(password);
    } catch (err) {
      console.log('Err in validate', err);
    }
    
    if (fromWif) {
      const key = {
        privKey: fromWif,
        pubKey: fromWif.toPublicKey().toString()
      };

      if (acc)
        ['active', 'owner', 'memo'].forEach((role) => {
          if (acc) {
            if (role === 'memo') {
                if (acc.getIn(['options', 'memo_key']) == key.pubKey)
                  passwordKeys[role] = key;
                else {
                  passwordKeys[role] = {
                    pubKey: acc.getIn(['options', 'memo_key'])
                  };
                }
            } else {
              acc.getIn([role, 'key_auths']).forEach((auth) => {
                if (auth.get(0) == key.pubKey)
                  passwordKeys[role] = key;
                else {
                  passwordKeys[role] = {
                    pubKey: auth.get(0)
                  };
                }
              });
            }
          }
      });
    } else {
      passwordKeys['active'] = generateKeyFromPassword(
        account,
        "active",
        password
      );
      passwordKeys['owner'] = generateKeyFromPassword(
        account,
        "owner",
        password
      );
      passwordKeys['memo'] = generateKeyFromPassword(
        account,
        "memo",
        password
      );
    }

    return passwordKeys;
  }

  return (
    <div className="login-width">
      <Form onSubmit={handleSubmit} autoComplete="off">
        <FormField>
          <label basic className="paper_wallet_login_label">
            Login With
          </label>
          <input disabled value={"Account Name (Cloud Wallet)"} />
        </FormField>
        <FormField>
          <label basic className="paper_wallet_login_label">
            Account Name
          </label>
          <input
            value={accountNameState}
            disabled
            placeholder={"Account Name"}
          />
        </FormField>
        <FormField>
          <label basic className="paper_wallet_login_label">
          Passkey
          </label>
          <div className="pwd_input_wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{marginRight: '5px'}}
            />
            <Button
              color="yellow"
              onClick={(e) => setPassword("")}
              disabled={!password}
            >
              {" "}
              Clear
            </Button>
          </div>
          {check !== false && <p style={{ color: "red" }}>Invalid Passkey</p>}
        </FormField>
        <Button
          color="yellow"
          type="submit"
          fluid
          onClick={handleCreatePaperWallet}
          disabled={!password}
        >
          {" "}
          Create Paper Wallet
        </Button>
      </Form>
    </div>
  );
}
