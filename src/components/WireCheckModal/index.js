import React, { useState, useEffect } from 'react';
import styles from "./wirecheck.module.scss";
import { Modal } from "semantic-ui-react";
import { useDispatch, useSelector } from 'react-redux';
import { accountsSelector } from "../../store/account/selector";
import { getImage } from "../../lib/images";
import { MenuItem, TextField, Select, InputAdornment, Button } from '@mui/material';
import { UserOutlined, WalletOutlined, MailOutlined } from '@ant-design/icons';
import { getUserKycProfileByAccount } from "../../API/API";

import './wirecheck.css';

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
    };

    useEffect(async () => {
        let res = await getUserKycProfileByAccount(accountNameState);
        setEmail(res?.email);
    }, []);

    return <Modal open={props.isOpen} id={"wire-check"} >
        <Modal.Content className={styles.contentWrapper}>
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
                </div>
            </div>
        </Modal.Content>
    </Modal>
}