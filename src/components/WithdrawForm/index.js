
import React, { useState, useEffect } from "react";
import Meta1 from "meta1-vision-dex";
import { Aes, ChainStore, FetchChain, PrivateKey, TransactionBuilder, TransactionHelper } from "meta1-vision-js";
import { ChainConfig } from 'meta1-vision-ws';
import {
  Image, Modal, Button, Grid, Icon, Label, Popup
} from "semantic-ui-react";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CAValidator from "multicoin-address-validator";

import "./style.css";
import ExchangeSelect from "../ExchangeForm/ExchangeSelect.js";
import styles from "../ExchangeForm/ExchangeForm.module.scss";
import { helpWithdrawInput, helpMax1 } from "../../config/help";
import MetaLoader from "../../UI/loader/Loader";
import { trim } from "../../helpers/string";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector, isValidPasswordKeySelector, passwordRequestFlagSelector, sendEmailSelector } from "../../store/account/selector";
import { passKeyRequestService, passKeyResetService, sendMailRequest, sendMailReset } from "../../store/account/actions";
import { userCurrencySelector } from "../../store/meta1/selector";
import { availableGateways } from '../../utils/gateways';
import { getMETA1Simple } from "../../utils/gateway/getMETA1Simple";
import Immutable from "immutable";
import { getAssetAndGateway, getIntermediateAccount } from "../../utils/common/gatewayUtils";
import { getCryptosChange } from "../../API/API";
import { WithdrawAddresses } from "../../utils/gateway/gatewayMethods";
import { getAssetsList } from "../../utils/common";
import { Asset } from "../../utils/MarketClasses";
import AccountUtils from "../../utils/account_utils";
import { transferHandler } from "./withdrawalFunction";

// const WITHDRAW_ASSETS = ["ETH", "BTC", "BNB", "XLM", "LTC", "USDT"];
const WITHDRAW_ASSETS = ["ETH", "USDT"];

const getChainStore = (accountName) => {
  return new Promise(async (resolve, fail) => {
    await ChainStore.clearCache()

    let newObj = ChainStore.getAccount(
      accountName,
      undefined
    );
    await getCryptosChange();
    newObj = ChainStore.getAccount(
      accountName,
      undefined
    );
    if (newObj) {
      resolve(newObj);
    }
    if (!newObj) {
      fail("fail");
    }
  })
}
const WithdrawForm = (props) => {
  const { onBackClick, asset, redirectToPortfolio, sendEmail } = props;
  const accountNameState = useSelector(accountsSelector);
  const userCurrencyState = useSelector(userCurrencySelector);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState(props.selectedFrom);
  const [selectedFromAmount, setSelectedFromAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isValidEmailAddress, setIsValidEmailAddress] = useState(false);
  const [blockPrice, setBlockPrice] = useState();
  const [priceForAsset, setPriceForAsset] = useState(0);
  const [minAmountForAsset, setMinAmountForAsset] = useState(0);
  const [assets, setAssets] = useState(props.assets);
  const [options, setOptions] = useState([]);
  const [invalidEx, setInvalidEx] = useState(false);
  const [clickedInputs, setClickedInputs] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidCurrency, setIsValidCurrency] = useState(false);
  const [isSuccess, setIsSuccess] = useState({
    status: false,
    text: '',
    errorMsg: ''
  });
  const sendEmailState = useSelector(sendEmailSelector);
  const passwordRequestFlagState = useSelector(passwordRequestFlagSelector);
  const isValidPasswordKeyState = useSelector(isValidPasswordKeySelector);
  const dispatch = useDispatch();
  const ariaLabel = { "aria-label": "description" };
  const [gatewayStatus, setGatewayStatus] = useState(availableGateways);
  const [backedCoins] = useState(Immutable.Map({ META1: getMETA1Simple() }));

  useEffect(() => {
    const currentPortfolio = props.portfolio || [];
    setAssets(props.assets);

    const getBalance = (symbol) => {
      const assetInWallet = currentPortfolio.find((el) => el.name === symbol);

      return assetInWallet ? assetInWallet.qty : 0;
    };
    const newOptions = assets.map((asset) => {
      return {
        image: asset.image,
        value: asset.symbol,
        label: asset.symbol,
        pre: asset.precision,
        balance: getBalance(asset.symbol) || 0,
      };
    });

    setOptions(newOptions);

    if (options !== []) {
      const from = asset
        ? newOptions.find((el) => el.value === asset)
        : newOptions[0];

      setSelectedFrom(from);
    } else {
      setSelectedFrom(newOptions.find((o) => o.value === selectedFrom.value));
    }
  }, 
    // [props.assets, props.portfolio]
    []
  );

  useEffect(() => {
    if (selectedFrom) {
      changeAssetHandler(selectedFrom.value);
    }
  }, [selectedFrom]);

  useEffect(() => {
    if (sendEmailState) {
      dispatch(sendMailReset());
    }
  }, [sendEmailState]);

  useEffect(() => {
    if (isValidPasswordKeyState) {
      if (!isValidPassword) {
        setIsValidPassword(true);
      }
    } else {
      if (isPasswordTouched) {
        setIsValidPassword(false);
      }
    }
  }, [isValidPasswordKeyState, passwordRequestFlagState])

  useEffect(() => {
    if (selectedFrom && selectedFromAmount) {
      if (parseFloat(selectedFrom.balance) < parseFloat(selectedFromAmount)) {
        setAmountError('Amount exceeded the balance.');
        // } else if (parseFloat(MIN_WITHDRAW_AMOUNT['USDT']) > parseFloat(blockPrice) / userCurrencyState.split(' ')[2]) {
      } else if (parseFloat(selectedFromAmount) < minAmountForAsset) {
        setAmountError('Amount is too small.');
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  }, [selectedFromAmount, blockPrice]);

  useEffect(() => {
    if (!name) {
      setIsValidName(true);
    } else if (trim(name) === '') {
      setIsValidName(false);
    } else {
      setIsValidName(true);
    }
  }, [name]);

  useEffect(() => {
    if (emailAddress) {
      setIsValidEmailAddress(
        String(emailAddress).toLowerCase().match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
      );
    } else {
      setIsValidEmailAddress(false);
    }
  }, [emailAddress]);

  useEffect(() => {
    if (selectedFrom && toAddress) {
      if (process.env.REACT_APP_ENV === 'prod') {
        setIsValidAddress(CAValidator.validate(toAddress, selectedFrom.value));
      } else {
        setIsValidAddress(
          CAValidator.validate(toAddress, selectedFrom.value, "testnet")
        );
      }
    }
  }, [toAddress, selectedFrom]);

  const setIsSuccessHandler = (status, text, errorMsg = "") => {
    setIsSuccess({
      status,
      text,
      errorMsg
    });
  }

  const getAssetsObject = async (obj) => {
    const assetsObj = await getAssetsList();
    const balances = obj.get('balances');
    let assets = Immutable.Map({})
    const newData = balances.map((data, index) => {
      return assets.set(index, assetsObj.find(data => data.id === index));
    })
    return newData;
  }
  const changeAssetHandler = async (val) => {
    if (val === "USDT") {
      setPriceForAsset(1);
    } else {
      Meta1
        .ticker("USDT", val)
        .then((res) => setPriceForAsset(Number(res.latest).toFixed(2)));
    }

    // if (val !== "META1") {
    //   const response_min = await fetch(
    //     `${process.env.REACT_APP_GATEWAY_META1_JS_URL}api/currency/${val}`
    //   );
    //   await setMinAmountForAsset((await response_min.json()).minWithdrawal);
    // }

    if (val === "ETH") {
      setMinAmountForAsset(0.02)
    } else if (val === "USDT") {
      setMinAmountForAsset(25);
    }
  };

  const setAssetMax = (e) => {
    e.preventDefault();
    setSelectedFromAmount(selectedFrom.balance);
    setTimeout(() => {
      let priceForOne = (
        Number(document.getElementById("inputAmount").value) * priceForAsset
      ).toFixed(3);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    }, 25);
  };

  const calculateUsdPriceHandler = (e) => {
    if (e.target.value.length != 0) {
      const priceForOne = (Number(e.target.value) * priceForAsset).toFixed(2);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    } else {
      setBlockPrice(NaN);
    }
  };

  const calculateCryptoPriceHandler = (e) => {
    setBlockPrice(e.target.value);

    if (e.target.value) {
      let priceForOne = (
        Number(e.target.value) /
        priceForAsset /
        Number(userCurrencyState.split(" ")[2])
      ).toFixed(selectedFrom.label === "USDT" ? 3 : selectedFrom.pre);
      setSelectedFromAmount(priceForOne);
    } else {
      setSelectedFromAmount(e.target.value);
    }
  };

  const selectedData = () => {
    let assets = [];
    let idMap = {};
    let include = process.env.REACT_APP_CRYPTOS_ARRAY.split(',');
    backedCoins.forEach((coin) => {
      assets = assets
        .concat(
          coin.map((item) => {
            /* Gateway Specific Settings */
            let split = getAssetAndGateway(item.symbol);
            let gateway = split.selectedGateway;
            let backedCoin = split.selectedAsset;

            // Return null if backedCoin is already stored
            if (!idMap[backedCoin] && backedCoin && gateway) {
              idMap[backedCoin] = true;

              return {
                id: backedCoin,
                label: backedCoin,
                gateway: gateway,
                gateFee: item.gateFee,
                issuer: item.issuerId,
                issuerId: item.issuerToId
              };
            } else {
              return null;
            }
          })
        )
        .filter((item) => {
          return item;
        })
        .filter((item) => {
          if (item.id == 'META1') {
            return true;
          }
          if (include) {
            return include.includes(item.id);
          }
          return true;
        });
    });
    return assets;
  }
  useEffect(() => {
    if (!isSuccess.status && isSuccess.text === 'loading') {
      setIsLoading(true)
    } else if (isSuccess.status && isSuccess.text === 'ok') {
      setIsLoading(false);
    } else if (!isSuccess.status && isSuccess.text === 'fail') {
      setIsLoading(false);
    }
  }, [isSuccess])
  const onClickWithdraw = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const emailType = "withdraw";
    const emailData = {
      accountName: props.accountName,
      name: trim(name),
      emailAddress: trim(emailAddress),
      asset: selectedFrom.value,
      amount: selectedFromAmount,
      toAddress: trim(toAddress)
    };
    sendEmail(emailType, emailData)
      .then((res) => {
        if (res.success === 'success') {
          setIsLoading(false);
          alert("Email sent, awesome!");
          // Reset form inputs
          setName('');
          setEmailAddress('');
          setSelectedFromAmount(NaN);
          setBlockPrice(NaN);
          setToAddress('');
          setPassword('')
          setIsValidPassword(false);
          setIsPasswordTouched(false);
          dispatch(passKeyResetService());
        } else {
          if (res.tokenExpired) {
            props.setTokenModalMsg(res.responseMsg);
            props.setTokenModalOpen(true);
            return;
          }
          setIsLoading(false);
          alert("Oops, something went wrong. Try again");
        }
      })
  }

  const resetState = () => {
    setIsSuccessHandler(false, '');
    dispatch(passKeyResetService());
    if (isSuccess.status && isSuccess.text === 'ok') {
      // Reset form inputs
      setName('');
      setEmailAddress('');
      setSelectedFromAmount(NaN);
      setBlockPrice(NaN);
      setToAddress('');
      setPassword('')
      setIsValidPassword(false);
      setIsPasswordTouched(false);
      setIsSuccessHandler(false, '');
      props.onSuccessWithDrawal();
      const emailType = "withdraw";
      const emailData = {
        accountName: props.accountName,
        name: trim(name),
        emailAddress: trim(emailAddress),
        asset: selectedFrom.value,
        amount: selectedFromAmount,
        toAddress: trim(toAddress)
      };
      dispatch(sendMailRequest({ emailType, emailData }))
      // redirect to wallet
      redirectToPortfolio();
    }
  };

  if (selectedFrom == null) return null;

  const getAssets = (except) => {
    return options
      .filter((asset) => WITHDRAW_ASSETS.indexOf(asset.value) > -1)
      .filter((el) => el.value !== except);
  }

  const canWithdraw = name && isValidName &&
    isValidEmailAddress &&
    isValidAddress &&
    !amountError &&
    selectedFromAmount &&
    isValidPassword
    && isValidPasswordKeyState;

  return (
    <>
      <div className="withdraw">
        <div
          className={"headerTitle"}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h2 className="headTl">Withdraw</h2>
          <div style={{ marginRight: "1rem", cursor: "pointer" }}>
            <i
              className="far fa-arrow-left"
              style={{ color: "#FFC000", marginRight: ".5rem" }}
            />
            <span
              onClick={onBackClick}
              style={{
                color: "#FFC000",
                borderBottom: "1px solid #FFC000",
                height: "40%",
                fontWeight: "600",
              }}
            >
              Back to Portfolio
            </span>
          </div>
        </div>
        {isLoading ?
          <MetaLoader size={"small"} />
          :
          <div className="withdrawal-form-div">
            <form autoComplete="off" >
              <label>
                <span>Name:</span><br />
                <TextField
                  InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                  value={name}
                  onChange={(e) => { setName(e.target.value) }}
                  className={styles.input}
                  id="name-input"
                  variant="filled"
                  style={{ marginBottom: "1rem", borderRadius: "8px" }}
                />
                {name && !isValidName &&
                  <span className="c-danger">Invalid first name</span>
                }
              </label><br />
              <label>
                <span>Email Address:</span><br />
                <TextField
                  InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                  value={emailAddress}
                  onChange={(e) => { setEmailAddress(e.target.value) }}
                  className={styles.input}
                  id="emailaddress-input"
                  variant="filled"
                  style={{ marginBottom: "1rem", borderRadius: "8px" }}
                  type="email"
                  autoComplete='off'
                  name="new-password"
                />
                {emailAddress && !isValidEmailAddress &&
                  <span className="c-danger">Invalid email address</span>
                }
              </label><br />
              <label>
                <span>META1 Wallet Name:</span>
                <TextField
                  InputProps={{ disableUnderline: true }}
                  value={props.accountName}
                  disabled={true}
                  className={styles.input}
                  id="wallet-name-input"
                  variant="filled"
                  style={{ marginBottom: "1rem", borderRadius: "8px" }}
                />
              </label><br />
              <label>
                <span>From Currency:</span>
                <ExchangeSelect
                  onChange={(val) => {
                    setSelectedFrom(val);
                    changeAssetHandler(val.value);
                    setSelectedFromAmount(NaN);
                    setBlockPrice(NaN);
                    setInvalidEx(false);
                  }}
                  options={getAssets(selectedFrom.value)}
                  selectedValue={selectedFrom}
                  from='withdrawal'
                />
              </label><br />
              <label>
                <span>From Amount:</span>
                <div className="wallet-input new-wallet_input">
                  <Popup
                    content={helpWithdrawInput(selectedFrom?.value)}
                    position="bottom center"
                    style={{ padding: '0' }}
                    trigger={
                      <div className={styles.inputForAmount}>
                        <Input
                          placeholder="Amount crypto"
                          value={selectedFromAmount}
                          type={"number"}
                          onChange={(e) => {
                            if (Number(e.target.value) < 0) return;
                            if (
                              (
                                e.target.value.length < 11 &&
                                /[-+]?[0-9]*\.?[0-9]*/.test(e.target.value)
                              )
                              || `${selectedFromAmount}`.length > e.target.value.length
                            ) {
                              setSelectedFromAmount(e.target.value);
                              calculateUsdPriceHandler(e);
                              setClickedInputs(true);
                            }
                          }}
                          endAdornment={
                            <InputAdornment position="end" className="currency-letters">
                              {selectedFrom.label}
                            </InputAdornment>
                          }
                          inputProps={ariaLabel}
                          id={"inputAmount"}
                          disabled={invalidEx}
                          min="0"
                          inputMode="numeric"
                          pattern="\d*"
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: ".1rem",
                            fontSize: "1rem",
                            color: "#505361",
                            background: "#f0f1f4"
                          }}
                        >
                          <input
                            className={styles.inputDollars}
                            onChange={(e) => {
                              if (
                                (e.target.value.length < 11 &&
                                  /[-+]?[0-9]*\.?[0-9]*/.test(
                                    e.target.value
                                  ) &&
                                  Number(e.target.value) >= 0)
                                || blockPrice?.toString().length > e.target.value.length
                              ) {
                                calculateCryptoPriceHandler(e);
                                setClickedInputs(true);
                              }
                            }}
                            min="0"
                            inputMode="numeric"
                            pattern="\d*"
                            type={"number"}
                            placeholder={`Amount ${userCurrencyState.split(" ")[1]
                              }`}
                            disabled={invalidEx}
                            style={
                              invalidEx ? { opacity: "0.5" } : null
                            }
                            value={blockPrice}
                          />
                          <span className="currency-span">{userCurrencyState.split(" ")[0]}</span>
                        </div>
                      </div>
                    }
                  />
                  <div className="max-button new-max-withdrawal">
                    <Popup
                      content={helpMax1(selectedFrom?.value)}
                      position="bottom center"
                      trigger={
                        <Button
                          secondary
                          className={"btn"}
                          onClick={setAssetMax}
                          floated="right"
                          size="mini"
                        >
                          MAX
                        </Button>
                      }
                    />
                  </div>
                </div>
                {(selectedFromAmount && amountError) ?
                  <span className="c-danger">{amountError}</span> : null
                }
              </label><br /><br />
              <label>
                <span>Destination Address:</span>
                <TextField
                  InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                  value={toAddress}
                  onChange={(e) => { setToAddress(e.target.value) }}
                  className={styles.input}
                  id="destination-input"
                  variant="filled"
                  style={{ marginBottom: "1rem", borderRadius: "8px" }}
                />
                {toAddress && !isValidAddress &&
                  <span className="c-danger">Invalid {selectedFrom?.value} address</span>
                }
              </label><br />
              <label>
                <span>Passkey:</span>
                <TextField
                  InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                  value={password}
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (!isPasswordTouched) {
                      setIsPasswordTouched(true);
                    }
                    if (!isValidPassword) {
                      setIsValidPassword(true);
                    }
                    if (e.target.value === '') {
                      if (isValidPassword) {
                        setIsValidPassword(false);
                      }
                    }
                  }}
                  onBlur={() => {
                    dispatch(passKeyRequestService({ login: accountNameState, password }));
                  }}
                  className={styles.input}
                  id="destination-input"
                  variant="filled"
                  style={{ marginBottom: "1rem", borderRadius: "8px" }}
                />
                {!password && isPasswordTouched &&
                  <span className="c-danger">Passkey can't be empty</span>
                }
                {password && !isValidPassword && isPasswordTouched &&
                  <span className="c-danger">please enter valid passKey</span>
                }
              </label>
              <Button
                primary
                type="submit"
                className="btn-primary withdraw"
                onClick={(e) => {
                  if (isValidPasswordKeyState) {
                    onClickWithdraw(e)
                  }
                }}
                floated="none"
                disabled={canWithdraw ? '' : 'disabled'}
              >
                Withdraw
              </Button>
            </form>
          </div>
        }
      </div>
      <Modal
        size="mini"
        className={`${isSuccess.errorMsg ? 'new_claim_wallet_modal__msg' : 'claim_wallet_modal'}`}
        onClose={() => {
          resetState();
        }}
        open={(isSuccess.status && isSuccess.text === 'ok') || (!isSuccess.status && isSuccess.text === 'fail')}
        id={"modal-1"}
      >

        <Modal.Content >
          <div
            className="claim_wallet_btn_div "
          >
            <h3 className="claim_model_content">
              Hello {accountNameState}<br />
            </h3>
          </div>
          {!isSuccess.errorMsg && <h6 className={`${isSuccess.status && isSuccess.text === 'ok' ? 'modal_withdrawal_status_success' : 'modal_withdrawal_status_danger'}`}>Withdrawal {isSuccess.status && isSuccess.text === 'ok' ? 'Successfully Done' : 'Failed'}</h6>}
          {!isSuccess.status && isSuccess.text === 'fail' && isSuccess.errorMsg && <div className="modal_withdrawal_status_danger">{isSuccess.errorMsg}</div>}
        </Modal.Content>
        <Modal.Actions className="claim_modal-action">
          <Button
            className="claim_wallet_btn"
            onClick={() => {
              resetState();
            }}
          >
            Close</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default WithdrawForm