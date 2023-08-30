import * as React from "react";
import styles from "./Footer.module.scss";

const Footer = (props) => {
  return (
    <>
      <div
        className="modal fade"
        id="terms"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h3
                  style={{ marginBottom: ".4rem" }}
                  className="modal-title"
                  id="exampleModalLabel"
                >
                  META Wallet <span style={{ color: "#fdc000" }}>Creation</span>
                </h3>
                <span>
                  The META1 Coin Digital Wallet can be created and accessed from
                  your meta1.io Dashboard account OR on meta-exchange.io.
                </span>
              </div>
              <button
                style={{ marginBottom: "3rem" }}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className={styles.modalBody + " modal-body"}>
              <h4 style={{ marginLeft: "1.2rem", marginBottom: "1rem" }}>
                GET STARTED: Create a META Lite Wallet on meta1.io Dashboard
              </h4>
              <ol>
                <li>
                  <strong>Click</strong> the{" "}
                  <strong>White ‘Create META Wallet’</strong> button to start
                  the process.
                </li>
                <li>
                  <strong>Fill in your information.</strong> Some fields may
                  already be auto-filled. Make sure the fields are filled in
                  properly. You may need to clear the fields and re-enter
                  correctly.
                </li>
                <li>
                  <strong>Account Box</strong> – Create your{" "}
                  <strong>wallet name</strong>
                  Note: the ‘Wallet Account Name’ you choose{" "}
                  <strong>is visible</strong> on the meta-exchange.io platform.
                  <strong>For optimum security</strong>, avoid using your name
                  or personal information as a part of your META Wallet Account
                  name (do not use an email address or your personal name. Your
                  META Wallet Account Name must contain from 4 to 63 characters
                  and must consist of a combination of lowercase Latin letters,
                  dashes, or numbers. (No capital letters, blank spaces, @, +,
                  !, nor any other non- number/letter characters except a dash)
                </li>
                <li>
                  <strong>
                    Copy the Generated Password / Passphrase (52 characters)
                  </strong>
                  <strong>Do NOT create your own password.</strong> You must use
                  the auto generated password and properly paste it into the
                  confirm password field; You can click the small clipboard
                  under the ‘generated’ password field (lower right side). Be
                  sure to properly record and secure both the password ‘KEY’ and
                  account name in a safe location.
                </li>
                <li>
                  <strong>
                    PASTE password phrase into the confirmation box below.
                  </strong>
                </li>
                <li>
                  <strong>Click Submit</strong>
                </li>
                <li>
                  <strong>Confirm and check off ALL 4 Boxes</strong> to
                  acknowledge you understand about ‘SAVING the Key in a safe
                  place
                </li>
                <li>
                  <strong>Click Submit</strong>
                </li>
                <li>
                  Your wallet will now be created, and it will say it is{" "}
                  <strong>‘LINKED’</strong> at the top of the page.
                </li>
              </ol>
              <div style={{ margin: "1rem 1.2rem" }}>
                Once you have set up your wallet correctly, and if you have{" "}
                <strong>Ready to Claim</strong> certificates under the{" "}
                <strong>‘Coin Certificate Tab’</strong> they will change to{" "}
                <strong>Receive and Accept.</strong>
              </div>
              <h4 style={{ margin: "1rem 1.2rem" }}>
                LOADING META 1 COINS INTO YOUR WALLET
              </h4>
              <div style={{ margin: "1rem 1.2rem" }}>
                When you are ready to receive your coins, click on the{" "}
                <strong>Receive and Accept</strong> button and confirm you want
                to accept them into your wallet. Look on the META Lite wallet
                tab to see the newly loaded coins.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                The META Lite Wallet has the basic essential functionality of
                the META Wallet (accessible on meta-exchange.io). The two
                versions access the same account data on the META Blockchain.
                Nothing is compromised including speed and transactional
                integrity. Many Coin holders will find it easier to work from
                the meta1.io Dashboard. But keep in mind that META Exchange is a
                powerful leading edge tool with many features and advanced
                functionality.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                Your META Wallet can be used for several crypto currencies
                (select “Show All balances” in the META Lite Wallet section for
                a complete list).
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                <strong>CREATE MULTIPLE WALLETS</strong> - You can create more
                than one META Wallet.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                First ‘unlink’ your active META Wallet before creating a new
                one. - Click the word ‘here’ in the phrase, “To unlink your
                account, click here”, to unlink your wallet. Click the{" "}
                <strong>‘Create META Wallet’</strong> button to create an
                additional wallet.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                You can switch from one wallet to another by using the{" "}
                <strong>‘unlink’</strong> feature and then entering your
                additional wallet name and clicking the ‘Link META Wallet’
                button.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                And as a general security measure, always double check that you
                are on an official META 1 website.
              </div>
              <div style={{ margin: "1rem 1.2rem" }}>
                <strong>
                  And as a general security measure, always double check that
                  you are on an official META 1 website.
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="video"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3
                  style={{ marginLeft: "1rem" }}
                  className="modal-title"
                  id="exampleModalLabel"
                >
                  META Wallet{" "}
                  <span style={{ color: "#fdc000" }}>Tutorial Video</span>
                </h3>
              </div>
              <button
                style={{ marginBottom: "3rem" }}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className={"modal-body"} style={{ margin: "0 auto" }}>
              <iframe
                title="vimeo-player"
                src="https://player.vimeo.com/video/693848928?h=31b02d1eee"
                width="750"
                height="450"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="termsCond"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        style={{marginTop: 80}}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ display: "block", textAlign: "center" }}
            >
              <i
                style={{ margin: "0 0 0 97%", fontSize: 30, cursor: 'pointer', color: 'var(--textBrown)' }}
                className="fa fa-times"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
              <h2 style={{ margin: "0", fontSize: "2.5rem", color: "#FFC000" }}>
                Welcome to litewallet.meta1coin.vision
              </h2>
              <h3 style={{ fontSize: "1.7rem", fontWeight: "500", color: "var(--textBrown)" }}>
                By Using The <span style={{ color: "#FFC000" }}>litewallet.meta1coin.vision</span>{" "}
                Website You Are Agreeing To The{" "}
                <strong style={{ fontWeight: "700" }}>Privacy Policy</strong>{" "}
                And Website Use <strong>Terms Below.</strong>
              </h3>
            </div>
            <div className={"modal-body"} style={{ textAlign: "center" }}>
              <h4 style={{ fontSize: "1.5rem", color: "var(--textBrown)" }}>
                <span style={{ color: "#FFC000" }}>Meta 1 Coin</span> Trust
                Privacy Statements
              </h4>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                This website (META1Coin.vision, META1Coin.Com) and all META 1 COIN TRUST
                business are private, protected by the privacy act of 1974.
                Title 5 U.S.C. 552(a), the fourth and fifth Amendments of the
                Constitution for the united States of America, the common law
                privacy rights available in the united States of America and
                every other applicable jurisdiction.
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                The only participants of META 1 Coin Trust and the named
                websites are for Live Natural Man and Women, flesh-and-blood
                Almighty God-created private Humans sui juris sentient being;
                and an Ambassador of God Almighty Domiciled in the ARIZONA
                Republic and on religious sojourn through the UNITED STATES;
                One, who is as a "Non-resident alien" as defined within 26
                U.S.C. 7701(b)(1)(B)], []sic, in regards the UNITED STATES [28
                U.S.C. (A); U.C.C. 9-307(h)] with express, explicit, irrevocable
                reservation of all natural God-given &amp; unalienable Rights;
                including but not limited by F.S.I.A. without prejudice U.C.C.
                1-207;1-308, U.C.C. 1-103.6 (Anderson's UCC) reserved ab initio,
                nunc pro tunc:
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                By accepting to the following terms, you agree to a
                Non-Disclosure Agreement with META 1 Coin TRUST to operate this
                commercial transaction in the Private.
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                * If you need clarification regarding Private transactions and
                status, please contact private@meta1.io
              </p>
              <h3
                style={{
                  background: "#FFC000",
                  padding: "1rem 0",
                  color: "#fff",
                  fontSize: "1.5rem",
                }}
                className="notice-heading"
              >
                Notice
              </h3>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                BE WARNED, NOTICED, AND ADVISED that in addition to the
                constitutional limits on governmental authority included in the
                “Constitution for the united States of America”, the Honorable
                “Bill of Rights”, and/or the “Constitution of the State of
                ARIZONA”, the Undersigned relies upon the rights and defenses
                guaranteed under Uniform Commercial Code(s), common equity law,
                laws of admiralty, and commercial liens and levies pursuant, but
                not limited to, Title 42 U.S.C.A.(Civil Rights), Title 18
                U.S.C.A. (Criminal Codes), Title 28 U.S.C.A. (Civil Codes), to
                which you are bound by office and oath, the “Constitution of the
                State of ARIZONA”, and ARIZONA penal codes, in as much as they
                are in compliance with the “Constitution for the united States
                of America”, Bill of Rights, and/or the “Constitution of the
                State of ARIZONA”, as applicable. There can be no violation of
                any of these laws unless there is a victim consisting of a
                natural flesh and blood man or woman who has been injured. When
                there is no victim, there is no crime committed or law broken.
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                Remember in taking a solemn binding oath(s) to protect and
                defend the original Constitution for the united States of
                America circa and/or the Constitution of the State of ARIZONA
                against all enemies, foreign and domestic. Violation(s) of said
                oath(s) is perjury, being a bad-faith doctrine by constructive
                treason and immoral dishonor. The Undersigned accepts said
                Oath(s) of Office that you have sworn to uphold.
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                This legal and timely notice, declaration, and demand is prima
                facie evidence of sufficient Notice of Grace. The terms and
                conditions of this presentment agreement are a quasi-contract
                under the Uniform Commercial Code and Fair Debt Collections Act.
                These terms and conditions are not subject to any or all
                immunities that you may claim, should you in any way violate The
                Undersigned’s rights or allow violations by others. Your
                corporate commercial acts against The Undersigned or The
                Undersigned’s own and your failures to act on behalf of same,
                where an obligation to act or not to act exists, is ultra vires
                and injurious by willful and gross negligence.
              </p>
              <p style={{ fontSize: "1rem", color: "var(--textBrown)" }}>
                The liability is upon you, and/or your superior, and upon,
                including any and all local, state, regional, federal,
                multijurisdictional, international, and/or corporate agencies,
                and/or persons representing or attached to the foregoing,
                involved directly or indirectly with you via any nexus acting
                with you; and said liability shall be satisfied jointly and/or
                severally at The Undersigned’s discretion.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.mainDiv}>
          <ul>
            <li
              onClick={() => {
                window.open(process.env.REACT_APP_WALLET_FOOTER_HREF);
              }}
            >
              <span>Home</span>
            </li>
            <li
              onClick={() => {
                window.open(`${process.env.REACT_APP_WALLET_FOOTER_HREF}/contactus`);
              }}
            >
              <span>Contact Us</span>
            </li>
            <li
              onClick={() => {
                window.open(`${process.env.REACT_APP_WALLET_FOOTER_SUPPORT_HREF}`);
              }}
            >
              <span>Support</span>
            </li>
            <li
              data-bs-toggle="modal"
              data-bs-target="#termsCond"
              style={{
                width: "26rem",
                textAlign: "left",
                paddingLeft: ".7rem",
              }}
            >
              <span>Terms & Conditions & Privacy</span>
            </li>
          </ul>
        </div>
        <div style={{ padding: ".9rem 0 .9rem 3rem", width: "13rem" }}>
          <span style={{ fontSize: ".7rem" }}>Copyright © 2023 META 1</span>
        </div>
      </div>
    </>
  );
}

export default Footer
