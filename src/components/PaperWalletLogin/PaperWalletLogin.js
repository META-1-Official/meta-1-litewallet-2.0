/* eslint-disable array-callback-return */
import React, { useEffect, useState } from "react";
import { generateKeyFromPassword } from "../../lib/createAccountWithPassword";
import { Button, Form, FormField } from "semantic-ui-react";
import useDebounce from "../../lib/useDebounce";
import { PrivateKey } from "meta1-vision-js";
import { createPaperWalletAsPDF } from "./CreatePdfWallet";
import Meta1 from "meta1-vision-dex";
import "./style.css";
import { useSelector } from "react-redux";
import { portfolioReceiverSelector } from "../../store/meta1/selector";

export default function PaperWalletLogin({ accountName }) {
  const [account, setAccount] = useState(localStorage.getItem("login") || accountName);
  const [password, setPassword] = useState("");
  const [readyToCreate, setReadyToCreate] = useState(false);
  const [accountChecked, setAccountChecked] = useState(true);
  const [check, setCheck] = useState(false);
  const debouncedAccount = useDebounce(account, 500);
  const portfolioReceiverState =  useSelector(portfolioReceiverSelector);
  useEffect(() => {
    if (account?.length > 0) {
      async function fetchAccount(debouncedAccount) {
        // Сделать запрос к АП
        try {
          await portfolioReceiverState.fetch(debouncedAccount);
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

  // getting the privateKey
  const getPrivateKey = (password) => PrivateKey.fromSeed(password).toWif();

  const handleSubmit = () => {
    setReadyToCreate(true);
  };

  // Generate owner, memo and active Key
  let { privKey: owner_private } = generateKeyFromPassword(
    account,
    "owner",
    password
  );
  let { privKey: active_private } = generateKeyFromPassword(
    account,
    "active",
    password
  );
  let { privKey: memo_private } = generateKeyFromPassword(
    account,
    "memo",
    password
  );

  const handleCreatePaperWallet = async () => {
    try {
      await Meta1.login(localStorage.getItem("login"), password);
      createPaperWalletAsPDF(
        localStorage.getItem("login"),
        owner_private,
        active_private,
        memo_private
      );
    } catch (e) {
      setCheck(true);
    }
  };

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
            value={localStorage.getItem("login") || accountName}
            disabled
            placeholder={"Account Name"}
          />
        </FormField>
        <FormField>
          <label basic className="paper_wallet_login_label">
          Passkey
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
