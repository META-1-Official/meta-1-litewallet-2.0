import React, { useState } from 'react';
import styles from './loginProviders.module.scss';
import arrow from '../../images/arrow.jpg';
import closeBtn from '../../images/close.png';
import { providers } from "./providers";
// import CountryNumber from "./GetCountry/countryNumber";
import { Modal } from "semantic-ui-react";
import { WALLET_ADAPTERS } from "@web3auth/base";
import MetaLoader from "../../UI/loader/Loader";
import { getPublicCompressed } from "@toruslabs/eccrypto";
import { getTheme, setTheme } from '../../utils/storage';

const ProvidersBlock = ({ item, moreProviders, onClick }) => {
    return (
        <div className={moreProviders ? styles.providerBlockWrapperMP : styles.providerBlockWrapper} onClick={onClick}>
            <div className={styles.providerContent}>
                <div className={styles.providerContentV}>
                    <img
                        height={moreProviders ? '30px' : '50px'}
                        width={moreProviders ? '30px' : '50px'}
                        alt={item.name}
                        src={item.image}
                    />
                </div>
            </div>
        </div>
    );
};

const ProvidersCount = ({ moreProviders, setMoreProviders }) => {
    const changeProvidersCount = () => {
        setMoreProviders(!moreProviders);
    };
    return (
        <div className={styles.providersCountWrapper}>
            <div className={styles.providersCount}>
                <div onClick={changeProvidersCount}>
                    <p>{`View more options`}
                        <img src={arrow} alt="" width={15} height={15} style={moreProviders ? { transform: 'rotate(180deg)' } : {}} />
                    </p>
                </div>
            </div>
        </div>
    );
};

const LoginProvidersModal = (props) => {
    const [moreProviders, setMoreProviders] = useState(false);
    const [email, setEmail] = useState(props.email || null);
    const [phoneNumber, setMobilePhoneNumber] = useState(props.phoneNumber || null);
    // const [continueMode, setContinueMode] = useState(false);
    const [loader, setLoader] = useState(false);
    const [emailError, setEmailError] = useState(null);

    const doAuth = async (provider) => {
        const { web3auth } = props;

        if (
            !web3auth
        ) {
            return;
        }

        try {
            if (web3auth.status === "connected") {
                await web3auth.logout();
            }

            const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
                mfaLevel: "none",
                loginProvider: provider,
                extraLoginOptions: (provider === "email_passwordless" || provider === "sms_passwordless") ? {
                    login_hint: provider === "email_passwordless" ? email : phoneNumber,
                } : {}
            });
            if (web3authProvider) {
                const data = await web3auth.getUserInfo();
                
                const privateKey = await web3auth.provider.request({
                    method: "private_key"
                });

                const app_pub_key = getPublicCompressed(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");

                data.privateKey = privateKey;
                
                data.web3Token = data.idToken;
                data.web3PubKey = app_pub_key;
                
                setLoader(false);
                props.setOpen(false);
                props.goToFaceKi(data);
            }
        } catch (error) {
            console.log('Error in Web3Auth', error);
            setLoader(false);
        }
    }

    const handleClose = async () => {
        props.setOpen(false);
    }

    // const handleContinueWith = async () => {
    //     console.log('Handle Continue With');
    // }

    const handleContinueWithProvider = async (item) => {
        setLoader(true);
        await doAuth(item?.name);
    }

    const handleContinueWithEmail = async (e) => {
        e.preventDefault();
        setLoader(true);
        console.log('Handle Continue With Email', email);
        await doAuth('email_passwordless');
    }

    // const handleContinueWithSms = async (e) => {
    //     e.preventDefault();
    //     setLoader(true);
    //     console.log('Handle Continue With Mobile');
    //     await doAuth('sms_passwordless');
    // }

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmail(e.target.value);
        if (
            !/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(e.target.value) && e.target.value.length !== 0
        ) {
            setEmailError("Invalid Email");
        } else {
            setEmailError(null);
        }
    }

    const isPhone = () => {
        return window.innerWidth < 540;
    }

    return (
        <Modal
            closeOnEscape={false}
            closeOnDimmerClick={false}
            onOpen={() => props.setOpen(true)}
            open={props.open}
            id="auth-modal"
            className={`${styles.containerProvider}${getTheme('theme') === 'dark' ? ' theme-dark' : ''}`}
            centered
            style={isPhone() ? { width: '100%', margin: 0 } : { width: '25rem', margin: 0 }}
        >
            <div className={styles.containerProvider}>
                {
                    loader ? <MetaLoader size={"small"} /> :
                        <>
                            <div className={styles.providerHeader}>
                                <div className={styles.closeBtnWrapper}>
                                    <img src={closeBtn} width={20} height={20} onClick={handleClose} alt="close"></img>
                                </div>
                                <p className={styles.welcomeText}>Welcome onboard</p>
                                <p className={styles.descriptionText}>Select how you would like to continue</p>
                            </div>
                            <div className={styles.contentWrapper}>
                                {/* <div className={styles.continueWithBtn} onClick={handleContinueWith}>
                                    <div></div>
                                </div> */}
                                <div className={moreProviders ? styles.providersBlockMP : styles.providersBlock}>
                                    {moreProviders ? providers.map(item => (
                                        <ProvidersBlock item={item} moreProviders={moreProviders} key={item.id} onClick={() => handleContinueWithProvider(item)} />
                                    )) : providers.map((item, index) => {
                                        if (index < 6) {
                                            return (
                                                <ProvidersBlock item={item} key={item.id} onClick={() => handleContinueWithProvider(item)} />
                                            );
                                        } else return null;
                                    })}
                                </div>
                                <p style={{ margin: "auto", textAlign: 'center' }}>OR</p>
                                <div className={styles.formContainer}>
                                    <div className={styles.emailProvider}>
                                        <input value={email} className={styles.providersInput} placeholder={"Email"} onChange={handleEmailChange} />
                                        {emailError && (
                                            <p className={styles.errorText}> {emailError}</p>
                                        )}
                                        <button
                                            className={styles.providersButton}
                                            type={"submit"}
                                            onClick={handleContinueWithEmail}
                                            disabled={!email || emailError}
                                            style={(!email || emailError) ? { cursor: "not-allowed" } : {}}
                                        >
                                            Continue with Email
                                        </button>
                                    </div>
                                    {/* <div className={styles.smsProvider} style={{ display: 'none' }}>
                                        <CountryNumber />
                                        <button className={styles.providersButton} type={"submit"} onClick={handleContinueWithSms} disabled={!phoneNumber}>Continue with Mobile</button>
                                    </div> */}
                                </div>
                                <ProvidersCount moreProviders={moreProviders} setMoreProviders={setMoreProviders} />
                            </div>
                        </>
                }
            </div>
        </Modal>
    );
};

export default LoginProvidersModal;
