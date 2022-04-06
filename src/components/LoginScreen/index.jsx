import React, { useState, useEffect } from "react";
import { Modal, Input, Button } from "semantic-ui-react";
import "./login.css";
import styles from "./login.module.scss";
import RightSideHelpMenuFirstType from "../RightSideHelpMenuFirstType/RightSideHelpMenuFirstType";

export default function LoginScreen(props) {
  const {
    error,
    onSubmit,
    onSignUpClick,
    portfolio,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
  } = props;
  const [login, setLogin] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const handleSignUpClick = (e) => {
    e.preventDefault();
    onSignUpClick();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (login.length !== 0) {
      onSubmit(login, true);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("mainBlock").style.height = "92vh";
    }, 5);
  }, []);

  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <div className={styles.headerM}>
          <span>META Lite Wallet</span>
        </div>
      </header>
      <div className={styles.mainBlockContent}>
        <div className={styles.leftBlockContent}>
          <div className={styles.createMeta}>
            <h5>
              <strong>
                This section provides access to your META Lite Wallet.
              </strong>
            </h5>
            <span>
              If you have not yet created a META wallet, please click the Get
              Started button to on the right hand side of the screen. Then click
              the 'Create META Wallet' button below to create your wallet
            </span>
            <br />
            <button
              onClick={handleSignUpClick}
              style={{ marginTop: "1rem" }}
              className={styles.Button}
            >
              Create {portfolio != null ? "new" : null} META Wallet
            </button>
          </div>

          {portfolio === null ? (
            <div className={styles.linkMeta}>
              <span>
                For those already having a META Wallet, to enable functionality,
                you must 'link' your wallet by typing in your wallet 'Wallet
                Name' in the box below and clicking the 'Link META Wallet'
                button.
              </span>
              <form className={styles.FormLink}>
                <input
                  className={styles.input}
                  onChange={(e) => {
                    e.preventDefault();
                    setLogin(e.target.value);
                  }}
                  placeholder={"Wallet Name"}
                  value={login}
                  type="text"
                />
                <p
                  className={styles.ErrorP}
                  style={error ? null : { display: "none" }}
                >
                  Invalid Account Name
                </p>
                <button
                  className={styles.Button}
                  style={{ fontSize: "100%", marginTop: "0" }}
                  onClick={handleSubmit}
                  type={"submit"}
                >
                  Link META Wallet
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.linkMeta}>
              <h5>
                <strong>To unlink your wallet, click here</strong>
              </h5>
              <br />
              <button
                className={styles.Button}
                onClick={() => {
                  localStorage.removeItem("login");
                  sessionStorage.setItem("location", "wallet");
                  window.location.reload();
                }}
                type={"button"}
                style={{ marginTop: "0" }}
              >
                Unlink META Wallet
              </button>
            </div>
          )}
        </div>
        <div className={styles.rightBlockContent}>
          <RightSideHelpMenuFirstType
            onClickExchangeEOSHandler={onClickExchangeEOSHandler}
            onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
            portfolio={portfolio}
          />
        </div>
      </div>
    </div>
  );
}

const ModalWalletInstructions = ({ setOpenModal, openModal }) => {
  return (
    <Modal
      style={{ padding: 20 }}
      open={openModal}
      onClose={() => setOpenModal(false)}
    >
      <h3>META Wallet Creation</h3>
      <p>
        The META 1 Coin Digital Wallet can be created and accessed from your
        meta1.vision Dashboard account OR on meta-exchange.io.
      </p>
      <br />
      <h3>GET STARTED: Create a META Lite Wallet on meta1.vision Dashboard</h3>
      <p>
        1. Click the White ‘Create META Wallet’ button to start the process.
        <br />
        2. Fill in your information. Some fields may already be auto-filled.
        Make sure the fields are filled in properly. You may need to clear the
        fields and re-enter correctly.
        <br />
        3. Account Box – Create your wallet name <br />
        Note: the ‘Wallet Account Name’ you choose is visible on the
        meta-exchange.io platform. For optimum security, avoid using your name
        or personal information as a part of your META Wallet Account name (do
        not use an email address or your personal name. Your META Wallet Account
        Name must contain from 4 to 63 characters and must consist of a
        combination of lowercase Latin letters, dashes, or numbers. (No capital
        letters, blank spaces, @, +, !, nor any other non- number/letter
        characters except a dash)
        <br />
        4. Copy the Generated Password / Passphrase (52 characters) Do NOT
        create your own password. You must use the auto generated password and
        properly paste it into the confirm password field; You can click the
        small clipboard under the ‘generated’ password field (lower right side).
        Be sure to properly record and secure both the password ‘KEY’ and
        account name in a safe location.
        <br />
        5. PASTE password phrase into the confirmation box below.
        <br />
        6. Click Submit
        <br />
        7. Confirm and check off ALL 4 Boxes to acknowledge you understand about
        ‘SAVING the Key in a safe place
        <br />
        8. Click Submit
        <br />
        9. Your wallet will now be created, and it will say it is ‘LINKED’ at
        the top of the page.
      </p>
      <br /> <br />
      <p>
        Once you have set up your wallet correctly, and if you have Ready to
        Claim certificates under the ‘Coin Certificate Tab’ they will change to
        Receive and Accept.
      </p>
      <h3>LOADING META 1 COINS INTO YOUR WALLET</h3>
      <p>
        When you are ready to receive your coins, click on the Receive and
        Accept button and confirm you want to accept them into your wallet. Look
        on the META Lite wallet tab to see the newly loaded coins.
      </p>
      <br /> <br />
      <p>
        The META Lite Wallet has the basic essential functionality of the META
        Wallet (accessible on meta-exchange.io). The two versions access the
        same account data on the META Blockchain. Nothing is compromised
        including speed and transactional integrity. Many Coin holders will find
        it easier to work from the meta1.vision Dashboard. But keep in mind that
        META Exchange is a powerful leading edge tool with many features and
        advanced functionality.
      </p>
      <p>
        Your META Wallet can be used for several crypto currencies (select “Show
        All balances” in the META Lite Wallet section for a complete list).{" "}
        <br />
        CREATE MULTIPLE WALLETS - You can create more than one META Wallet.{" "}
        <br />
        First ‘unlink’ your active META Wallet before creating a new one. <br />
        - Click the word ‘here’ in the phrase, “To unlink your wallet, click
        here”, to unlink your wallet. <br />
        Click the ‘Create META Wallet’ button to create an additional wallet.{" "}
        <br />
        You can switch from one wallet to another by using the ‘unlink’ feature
        and then entering your additional wallet name and clicking the ‘Link
        META Wallet’ button. <br />
        And as a general security measure, always double check that you are on
        an official META 1 website. <br />
        And as a general security measure, always double check that you are on
        an official META 1 website. <br />
      </p>
    </Modal>
  );
};

const VideoModal = ({ openVideoModal, setOpenVideoModal }) => {
  return (
    <Modal
      open={openVideoModal}
      onClose={() => setOpenVideoModal(false)}
      className={styles.modalDiv}
      style={{ maxWidth: "90%" }}
    >
      <iframe
        title="vimeo-player"
        src="https://player.vimeo.com/video/693848928?h=31b02d1eee"
        width="640"
        height="360"
        frameborder="0"
        allowfullscreen
        style={{ width: "100%" }}
      ></iframe>
    </Modal>
  );
};
