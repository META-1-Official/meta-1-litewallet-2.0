import MetaLoader from "../../UI/loader/Loader";
import React, { useState, useEffect } from "react";
import useDebounce from "../../lib/useDebounce";
import { alpha, styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import styles from "./SendForm.module.scss";
import RightSideHelpMenuSecondType from "../RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import { Modal, Icon, Button, Grid, Header, Popup } from "semantic-ui-react";
import Input from "@mui/material/Input";
import { helpSendTo, helpAmount, helpMax1, helpSwap } from "../../config/help";
import "./style.css";
import InputAdornment from "@mui/material/InputAdornment";
import Meta1 from "meta1dex";

const FEE = 0.0035;

const SendForm = React.memo((props) => {
  const {
    portfolio,
    onBackClick,
    sender,
    sendApi,
    asset,
    onSuccessTransfer,
    portfolioReceiver,
    assets,
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
  } = props;
  const feeAsset = portfolio.find((asset) => asset.name === "META1");
  const amountHold =
    portfolio.find((cur) => cur.name === asset).qty == undefined
      ? 0
      : portfolio.find((cur) => cur.name === asset).qty;
  const pre = assets.find((el) => el.symbol === asset).precision;
  const [chosenCrypt, setChosenCrypt] = useState("");
  const [receiver, setReceiver] = useState("");
  const [assetCh, setAssetCh] = useState(asset);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [error, setError] = useState("");
  const [askForPassword, setAskForPassword] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [accountIsLoading, setAccountIsLoading] = useState(false);
  const debouncedAccount = useDebounce(receiver, 500);
  const [assetData, setAssetData] = useState({});
  const [balance, setBalance] = useState(amountHold);
  const [options, setOptions] = useState([]);
  const [priceForAsset, setPriceForAsset] = useState(0);
  const [blockPrice, setBlockPrice] = useState(0);
  const [precisionAssets, setPrecisionAssets] = useState();
  const [password, setPassword] = useState("");
  const [clickedInputs, setClickedInputs] = useState(false);

  useEffect(() => {
    async function getData() {
      if (asset !== "USDT" && asset !== "META1") {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${asset}USDT`
        );
        await setPriceForAsset((await response.json()).lastPrice);
      } else if (asset === "META1") {
        Meta1.ticker("USDT", "META1").then((res) =>
          setPriceForAsset(Number(res.latest).toFixed(2))
        );
      } else {
        setPriceForAsset(1);
      }
    }
    getData();
  }, [asset]);

  useEffect(() => {
    function filterPrec() {
      let preObj = {};
      for (let i = 0; i < assets.length; i++) {
        preObj[assets[i].symbol] = assets[i].precision;
      }
      setPrecisionAssets(preObj);
    }
    filterPrec();
  }, [assets]);

  useEffect(() => {
    if (parseFloat(feeAsset?.qty) < FEE && feeAsset) {
      setError("Not enough FEE");
    }
  }, [feeAsset]);

  useEffect(() => {
    if (receiver.length > 0) {
      setError("");
      setAccountIsLoading(true);
      setAccountChecked(false);
    }
    setOptions(newOptions.sort((a, b) => (a.name > b.name ? 1 : -1)));
  }, [receiver]);

  useEffect(() => {
    setTimeout(() => {
      let allInputs = document.getElementsByClassName(
        "css-1pw81iq-MuiInputBase-root-MuiFilledInput-root"
      );
      for (let i = 0; i < allInputs.length; i++) {
        allInputs[i].style.borderRadius = "8px";
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (Number(amount) <= 0 && clickedInputs) {
      setError("The amount must be greater than 0");
    } else if (Number(amount) > Number(balance)) {
      setError("You don't have enough crypto");
    } else {
      setError("");
    }
  }, [amount]);

  const RedditTextField = React.memo(
    styled((props) => (
      <TextField InputProps={{ disableUnderline: true }} {...props} />
    ))(({ theme }) => ({
      "& .MuiFilledInput-root": {
        border: "1px solid #e2e2e1",
        overflow: "hidden",
        backgroundColor: theme.palette.mode === "light" ? "#fcfcfb" : "#2b2b2b",
        borderRadius: "8px !important",
        transition: theme.transitions.create([
          "border-color",
          "background-color",
          "box-shadow",
        ]),
        "&:hover": {
          backgroundColor: "transparent",
        },
        "&.Mui-focused": {
          backgroundColor: "transparent",
          boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
          borderColor: theme.palette.primary.main,
        },
      },
    }))
  );

  const setSelected = (value) => {
    setAssetCh(value.value);
    portfolio.map((el) =>
      el.name === value.value
        ? setAssetData({
            balance: el.qty,
            image: el.image,
            label: el.name,
            value: el.name,
          })
        : null
    );
  };
  const calculateUsdPriceHandler = (e) => {
    let priceForOne = Number(e.target.value) * priceForAsset;
    setBlockPrice(
      Number(priceForOne).toFixed(precisionAssets[asset]) *
        Number(localStorage.getItem("currency").split(" ")[2])
    );
  };

  const newOptions = portfolio.map((asset) => {
    return {
      image: asset.image,
      value: asset.name,
      label: asset.name,
      balance: asset.qty || 0,
    };
  });

  const calculateCryptoPriceHandler = (e) => {
    let priceForOne = (
      Number(e.target.value.split("$")[0]) /
      priceForAsset /
      Number(localStorage.getItem("currency").split(" ")[2])
    ).toFixed(precisionAssets[asset]);
    setAmount(priceForOne);
    setBlockPrice(e.target.value);
  };

  useEffect(() => {
    async function fetchAccount(debouncedAccount) {
      // Сделать запрос к АП
      try {
        await portfolioReceiver.fetch(debouncedAccount);
        setAccountChecked(true);
        setAccountIsLoading(false);
        if (receiver === sender) {
          setError("Can't transfer to self");
        }
      } catch (e) {
        setAccountChecked(false);
        setAccountIsLoading(false);
        setError("Invalid receiver");
      }
    }

    if (debouncedAccount) {
      fetchAccount(debouncedAccount);
    } else {
      setAccountChecked(false);
      setAccountIsLoading(false);
    }
  }, [debouncedAccount]);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const performTransfer = async (params) => {
    let asset = assetCh;
    setError(null);
    setInProgress(true);
    const { password, to, amount, message } = params;
    const result = await sendApi.perform({
      password,
      to,
      amount,
      message,
      asset,
    });
    if (result.error) {
      if (result.error === "Invalid credentials") {
        setError(result.error);
      } else if (asset === "META1" && feeAsset.qty === amount) {
        setError("You don't have enough cryptocurrency to pay FEE");
      } else {
        setError("Invalid Receiver");
      }
      setRepeat(true);
    } else {
      setModalOpened(true);
    }
    setInProgress(false);
  };

  const setAssetMax = () => {
    setAmount(assetData.balance);
    setBlockPrice(
      Number(assetData.balance * priceForAsset).toFixed(
        precisionAssets[asset]
      ) * Number(localStorage.getItem("currency").split(" ")[2])
    );
  };

  useEffect(() => {
    if (repeat) {
      setTimeout(() => {
        setError(null);
        setRepeat(false);
      }, 2000);
    }
  }, [repeat]);

  useEffect(() => {
    portfolio.map((el) =>
      el.name === assetCh
        ? setAssetData({
            balance: el.qty,
            image: el.image,
            label: el.name,
            value: el.name,
          })
        : null
    );
  }, [assetCh, assets]);
  const PasswordForm = (props) => {
    const [password, setPassword] = useState("");
    return (
      <div class="ui large fluid labeled input action">
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
        />
        <Button color="yellow" onClick={(e) => props.onSubmit(password)}>
          {" "}
          Send{" "}
        </Button>
      </div>
    );
  };
  const ariaLabel = { "aria-label": "description" };

  return (
    <>
      <div>
        <div
          className={"headerTitle"}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h2 className="headTl">Send</h2>
          <div style={{ marginRight: "1rem", cursor: "pointer" }}>
            <i
              onClick={onBackClick}
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
        <Modal
          size="tiny"
          id={"modal"}
          open={modalOpened}
          onClose={() => {
            setModalOpened(false);
          }}
        >
          <Modal.Header>Transfer Completed</Modal.Header>
          <Modal.Content>
            <Grid verticalAlign="middle" centered>
              <Grid.Row centered columns={1}>
                <Grid.Column>
                  <h3>
                    {amount} of {assetCh} sent to {receiver}
                  </h3>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button
              positive
              onClick={() => {
                setModalOpened(false);
                onSuccessTransfer();
              }}
            >
              OK
            </Button>
          </Modal.Actions>
        </Modal>
        <div className={"justFlexAndDirect"}>
          <div className={"widthh100"}>
            <div className={styles.containerMain}>
              <div className={styles.mainBlock}>
                <div className={styles.leftBlockSend}>
                  <h2 style={{ textAlign: "center" }}>Send</h2>
                  <RedditTextField
                    label="From"
                    defaultValue={sender}
                    className={styles.input}
                    disabled
                    id="reddit-input"
                    variant="filled"
                    style={{ marginBottom: "1rem", borderRadius: "8px" }}
                  />
                  <div
                    className={styles.inputForAmount}
                    style={{ marginBottom: "1rem" }}
                  >
                    <span
                      style={{
                        fontSize: ".8rem",
                        color: "#505361",
                        marginBottom: ".3rem",
                      }}
                    >
                      Amount {assetData.label}
                    </span>
                    <Input
                      id={"inputForAmount"}
                      type="number"
                      value={amount ? amount : ""}
                      min="0"
                      endAdornment={
                        <InputAdornment position="end">
                          {assetData.label}
                        </InputAdornment>
                      }
                      onChange={(e) => {
                        const amountOut = e.target.value;
                        if (
                          e.target.value.length < 11 &&
                          /[-+]?[0-9]*\.?[0-9]*/.test(e.target.value) &&
                          Number(e.target.value) >= 0
                        ) {
                          setClickedInputs(true);
                          setAmount(amountOut);
                          calculateUsdPriceHandler(e);
                        }
                      }}
                      placeholder={balance}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: ".1rem",
                        fontSize: "1rem",
                        color: "#505361",
                      }}
                    >
                      <input
                        type="number"
                        className={styles.inputDollars}
                        min="0"
                        inputmode="numeric"
                        pattern="\d*"
                        onChange={(e) => {
                          if (Number(e.target.value) >= 0) {
                            setClickedInputs(true);
                            calculateCryptoPriceHandler(e);
                          }
                        }}
                        placeholder={`Amount ${
                          localStorage.getItem("currency").split(" ")[1]
                        }`}
                        value={amount ? blockPrice : ""}
                      />
                      <span>
                        {localStorage.getItem("currency").split(" ")[0]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                    >
                      <span style={{ color: "#505361", paddingTop: "2rem" }}>
                        FEE: 0.00035 META1
                      </span>
                      <div
                        className="max-button-new"
                        style={{
                          position: "absolute",
                          right: "0",
                          bottom: "-3px",
                        }}
                      >
                        <Popup
                          content={`Click this button to sell all your ${assetData.label}`}
                          position={isMobile ? "bottom left" : "bottom center"}
                          trigger={
                            <Button
                              className={"btn"}
                              secondary
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
                  </div>
                  <Grid.Column>
                    <TextField
                      InputProps={{ disableUnderline: true }}
                      label="Password"
                      className={styles.input}
                      type={"password"}
                      id="reddit-input pass"
                      variant="filled"
                      style={{ marginBottom: "1rem", borderRadius: "8px" }}
                      value={password}
                      onChange={({ target }) => setPassword(target.value)}
                    />
                  </Grid.Column>
                </div>
                <div
                  style={{
                    marginTop: "4rem",
                    marginLeft: ".3rem",
                    width: "40px",
                    height: "40px",
                    background: "#fdc000",
                    borderRadius: "40px",
                    padding: ".7rem .85rem",
                  }}
                  className="text-center-s"
                >
                  <i
                    style={{ color: "#fff" }}
                    className={
                      isMobile ? "far fa-arrow-down" : "far fa-arrow-right"
                    }
                  />
                </div>
                <div className={styles.rightBlockSend}>
                  <h2 style={{ textAlign: "center" }}>Receive</h2>
                  <TextField
                    InputProps={{ disableUnderline: true }}
                    label="To"
                    value={receiver}
                    onChange={(e) => {
                      setReceiver(e.target.value);
                    }}
                    className={styles.input}
                    id="reddit-input receiver"
                    variant="filled"
                    style={{ marginBottom: "1rem", borderRadius: "8px" }}
                  />
                  <div className={styles.blockInfoCrypto}>
                    <img
                      style={{ width: "60px", height: "60px" }}
                      src={assetData.image}
                      alt="cryptImg"
                    />
                    <div className={styles.blockInfoText}>
                      <span>You will Send {assetData.label} Coin</span>
                      <h3>
                        {Number(amount) ? amount : 0} {assetData.label}
                      </h3>
                      <span>
                        {blockPrice || 0}{" "}
                        {localStorage.getItem("currency").split(" ")[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {!askForPassword && !inProgress && (
                <Grid.Row className={"buttonSend"} columns={1}>
                  <Popup
                    disabled
                    trigger={
                      <button
                        className={"btnSend ui button yellow buttSend"}
                        style={{
                          marginLeft: "2rem",
                          marginTop: "1rem",
                          boxShadow: "0 2px 10px 0 rgba(0, 0, 0, .11)",
                        }}
                        disabled={
                          !accountChecked || amount === "" || password === ""
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          if (Number(amount) > Number(amountHold)) {
                            setAskForPassword(false);
                            setError(`your balance is not enough `);
                            setRepeat(true);
                          } else {
                            let password =
                              document.getElementById(
                                "reddit-input pass"
                              ).value;
                            if (receiver !== "" && password !== "" && amount) {
                              if (parseFloat(feeAsset?.qty) < FEE) {
                                setError("Not enough FEE");
                              } else {
                                performTransfer({
                                  ...{ to: receiver },
                                  ...{
                                    password,
                                    amount,
                                    assetCh,
                                    message,
                                  },
                                });
                              }
                            } else {
                              setError(
                                "You have entered incorrect data, please check it."
                              );
                            }
                          }
                        }}
                      >
                        Confirm
                      </button>
                    }
                  />
                </Grid.Row>
              )}

              {inProgress && <MetaLoader size={"small"} />}

              {error && (
                <Grid>
                  <Grid.Row centered>
                    <h5 style={{ color: "red" }}>{error}</h5>
                  </Grid.Row>
                </Grid>
              )}
            </div>
          </div>
          <div className={"bottomBlockAdapt"}>
            <RightSideHelpMenuSecondType
              onClickExchangeEOSHandler={onClickExchangeEOSHandler}
              onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
            />
          </div>
        </div>
      </div>
    </>
  );
});

export default SendForm;
