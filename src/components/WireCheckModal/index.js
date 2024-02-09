import React, { useState, useEffect } from 'react';
import styles from "./wirecheck.module.scss";
import { Modal } from "semantic-ui-react";
import { useDispatch, useSelector } from 'react-redux';
import { accountsSelector } from "../../store/account/selector";
import { getImage } from "../../lib/images";
import { MenuItem, TextField, Select, InputAdornment, Button } from '@mui/material';
import { UserOutlined, WalletOutlined, MailOutlined } from '@ant-design/icons';
import { getUserKycProfileByAccount, createWireCheckOrder, generateWireCheckToken, getWireCheckOrder, getAllWireCheckOrders } from "../../API/API";

import './wirecheck.css';
import { toast } from 'react-toastify';

export const WireCheckModal = (props) => {
    const dispatch = useDispatch();
    const accountNameState = useSelector(accountsSelector);
    const [selectedAsset, setSelectedAsset] = useState('USDT');
    const [amount, setAmount] = useState(0);
    const [amountError, setAmountError] = useState('');
    const [email, setEmail] = useState();
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [congModalOpened, setCongModalOpend] = useState(false);
    const [token, setToken] = useState();

    const handleCloseClick = () => {
        props.setModalOpened(false);
    };

    const handleAmount = (event) => {
        const value = event.target.value;
        setAmount(value);
        setAmountError(value ? '' : 'This field is required');
    };

    const handleFirstName = (event) => {
        const value = event.target.value;
        setFirstName(value);
        setFirstNameError(value ? '' : 'This field is required');

        if (!/^[A-Za-z]{0,63}$/.test(value)) {
            if (value === '') {
                setFirstNameError("This field is required");
            } else if (value.includes(' ')) {
                setFirstNameError("Whitespace character is not allowed");
            } else if (/\d/.test(value)) {
                setFirstNameError("Numbers are not allowed");
            } else if (value.length > 64) {
                setFirstNameError("First Name is too long");
            } else {
                setFirstNameError("Special characters are not allowed");
            }
            return;
        }
    };

    const handleLastName = (event) => {
        const value = event.target.value;
        setLastName(value);
        setLastNameError(value ? '' : 'This field is required');

        if (!/^[A-Za-z]{0,63}$/.test(value)) {
            if (value === '') {
                setLastNameError("This field is required");
            } else if (value.includes(' ')) {
                setLastNameError("Whitespace character is not allowed");
            } else if (/\d/.test(value)) {
                setLastNameError("Numbers are not allowed");
            } else if (value.length > 64) {
                setLastNameError("Last Name is too long");
            } else {
                setLastNameError("Special characters are not allowed");
            }
            return;
        }
    };

    const handleSubmit = () => {
        if (!accountNameState) {
            toast('Please login first.');
            return;
        }

        if (!amount) {
            setAmountError('Invalid Amount');
            return;
        }

        if (!firstName) {
            setFirstNameError("This field is required");
            return;
        }

        if (!lastName) {
            setLastNameError("This field is required");
            return;
        }

        if (email && token) {
            let dto = {
                email,
                amount,
                wallet: accountNameState,
                firstName,
                lastName
            }
            createWireCheckOrder(dto, token)
                .then((res) => {
                    setCongModalOpend(true);
                })
                .catch(err => {
                    console.log('CONSOLE_WIRECHECK', err)
                });
        } else {
            alert('Something went wrong. try again.');
        }
    };

    useEffect(async () => {
        if (accountNameState) {
            let res = await getUserKycProfileByAccount(accountNameState);

            if (res) {
                let tok_res = await generateWireCheckToken(res.email);
                setEmail(res.email);
                tok_res && setToken(tok_res.Token);
            }
        }
    }, []);

    const renderWireCheckSumbitModal = () => <Modal.Content className={styles.contentWrapper}>
        <div className={styles.modalContent} >
            <div className={styles.modalHeader}>
                <div className={styles.headerTitle}>Wire/Check</div>
                <div className={styles.cancelBtn} onClick={handleCloseClick}>X</div>
            </div>
            <div className={styles.modalBody}>
                <div className={styles.amount_walletname}>
                    <div className={styles.label}>Amount*</div>
                    <div className={styles.amount}>
                        <Select
                            value={selectedAsset}
                            onChange={(event) => setSelectedAsset(event.target.value)}
                        >
                            {['USDT'].map(ele => {
                                return <MenuItem value={ele} className="wallet-option">
                                    <div className="wallet-option-picture">
                                        <img alt="eth" src={getImage(ele)} />
                                    </div>
                                    <span className="wallet-option-name">
                                        {ele}{" "}
                                    </span>
                                </MenuItem>
                            })}
                        </Select>
                        <div className={styles.vSpliter}></div>
                        <TextField
                            InputProps={{ disableUnderline: true }}
                            value={amount}
                            onChange={handleAmount}
                            variant="standard"
                            type='number'
                            error={Boolean(amountError)}
                            helperText={amountError}
                        />
                    </div>
                    <div className={styles.label}>Wallet Name*</div>
                    <div className={styles.walletname}>
                        <TextField
                            InputProps={{
                                disableUnderline: true,
                                startAdornment:
                                    <InputAdornment position="start">
                                        <WalletOutlined />
                                    </InputAdornment>
                            }}
                            value={accountNameState}
                            variant="standard"
                            readOnly
                        />
                    </div>
                </div>
                <div className={styles.name}>
                    <div className={styles.firstname}>
                        <div className={styles.label}>First Name*</div>
                        <div className={styles.txtfld}>
                            <TextField
                                InputProps={{
                                    disableUnderline: true,
                                    startAdornment:
                                        <InputAdornment position="start">
                                            <UserOutlined />
                                        </InputAdornment>
                                }}
                                value={firstName}
                                onChange={handleFirstName}
                                variant="standard"
                                placeholder='Jhon'
                                error={Boolean(firstNameError)}
                                helperText={firstNameError}
                            />
                        </div>
                    </div>
                    <div className={styles.lastname}>
                        <div className={styles.label}>Last Name*</div>
                        <div className={styles.txtfld}>
                            <TextField
                                InputProps={{
                                    disableUnderline: true,
                                    startAdornment:
                                        <InputAdornment position="start">
                                            <UserOutlined />
                                        </InputAdornment>
                                }}
                                value={lastName}
                                onChange={handleLastName}
                                variant="standard"
                                placeholder='Doe'
                                error={Boolean(lastNameError)}
                                helperText={lastNameError}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.email}>
                    <div className={styles.label}>Email*</div>
                    <div className={styles.txtfld}>
                        <TextField
                            InputProps={{
                                disableUnderline: true,
                                startAdornment:
                                    <InputAdornment position="start">
                                        <MailOutlined />
                                    </InputAdornment>
                            }}
                            value={email}
                            // onChange={(e) => { setEmail(e.target.value) }}
                            variant="standard"
                            readOnly
                        />
                    </div>
                </div>
                <Button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={Boolean(firstNameError) || Boolean(lastNameError) || Boolean(amountError) || amount === 0}
                >
                    submit
                </Button>
                {!accountNameState && <div className={styles.alert_label}>You need to be login to proceed *</div>}
            </div>
        </div>
    </Modal.Content>

    const renderCongModal = () => <Modal.Content className={styles.congWrapper}>
        <div className={styles.backgroundWrapper}>
            <div className={styles.modalHeader}>
                <div className={styles.cancelBtn} onClick={() => setCongModalOpend(false)}>X</div>
            </div>
        </div>
        <div className={styles.congModalContent}>
            <p className={styles.successText}>Your Deposit order has been submitted, please check your email for details of completing payment.</p>
            <Button
                className={styles.doneButton}
                onClick={() => setCongModalOpend(false)}
            >
                Done
            </Button>
        </div>
    </Modal.Content>

    return <Modal open={props.isOpen} id={"wire-check"} >
        {congModalOpened ? renderCongModal() : renderWireCheckSumbitModal()}
    </Modal>
}