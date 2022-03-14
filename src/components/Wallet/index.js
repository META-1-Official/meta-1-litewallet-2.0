import MetaLoader from "../../UI/loader/Loader";
// import ReactTooltip from 'react-tooltip'
import React, { useState, useEffect } from "react";
import getAllByOne from "../requests/compareCrypto";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import fiatIcon from "../../images/4292332.png";
import {
  Segment,
  Menu,
  Dropdown,
  Button,
  Image,
  Popup,
  Loader,
  Icon,
} from "semantic-ui-react";
import "./Wallet.css";
import Meta1 from "meta1dex";
import { useQuery } from "react-query";
import { getAsset, getFullName } from "./cryptoChooser";

// Трансферы между мета1 аккаунтами
// вместо BitShares ставь Meta1
// https://gist.github.com/bogdyak/e0172e95"large"db21f41ccd98c67dfaa7

// Вывод на внешний аккаунт
// вместо BitShares ставь Meta1
// https://gist.github.com/bogdyak/087bf94c61fffc947d94e4dbbd24d692
// обрати внимание что для EOS и XLM нужен мемо это типо доп айдишника

// сначала надо залогиниться в сдк

export const OrdersTable = (props) => {
  const { column, direction, assets, account } = props;

  const { data, isLoading, error } = useQuery("history", getHistory);

  async function getHistory() {
    let rawData = await Meta1.history.get_account_history(
      localStorage.getItem("login"),
      "1.11.0",
      30,
      "1.11.0"
    );
    let newRawData = [];
    let i = 0;
    while (newRawData.length < 10) {
      if (rawData[i].virtual_op === 0 && newRawData.length !== 10) {
        // Exchange proccesing
        if (rawData[i].op[1]?.seller) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.min_to_receive?.asset_id,
          ]);
          let block = await Meta1.db.get_block(rawData[i].block_num);
          let date = new Date(block.timestamp);
          let splitedBlock = new Date(date).toUTCString().split(" ");
          newRawData.push({
            asset: {
              name: "",
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Exchange",
            volume:
              rawData[i].op[1]?.min_to_receive?.amount /
              10 ** exchangeAsset[0].precision,
            status: "Done",
            time: `${splitedBlock[1]} ${splitedBlock[2]}, ${splitedBlock[3]}, ${splitedBlock[4]}
            `,
          });
        }
        // Send proccesing
        else if (rawData[i].op[1]?.from) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.amount.asset_id,
          ]);
          let block = await Meta1.db.get_block(rawData[i].block_num);
          let date = new Date(block.timestamp);
          let splitedBlock = new Date(date).toUTCString().split(" ");
          newRawData.push({
            asset: {
              name: "",
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Send",
            volume:
              rawData[i].op[1]?.amount?.amount /
              10 ** exchangeAsset[0].precision,
            status: "Done",
            time: `${splitedBlock[1]} ${splitedBlock[2]}, ${splitedBlock[3]}, ${splitedBlock[4]}
            `,
          });
        }
      }
      i++;
    }
    return newRawData;
  }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontWeight: 600,
      fontSize: 15,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      padding: 8,
      color: "#240000",
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  if (isLoading) return <MetaLoader size={"small"} />;

  return (
    <>
      <TableContainer style={{ overflow: "auto" }} component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow style={{ display: "table-row" }}>
              <StyledTableCell
                sorted={column === "id" ? direction : null}
                onClick={() => {}}
                align="left"
              >
                Assets
              </StyledTableCell>
              <StyledTableCell align="left">Type</StyledTableCell>
              <StyledTableCell align="right">Volume</StyledTableCell>
              <StyledTableCell align="left">Status</StyledTableCell>
              <StyledTableCell align="left">Time</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((el, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell
                  component="th"
                  style={{ width: "20%" }}
                  scope="row"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {getAsset(el.asset.abbr)}
                    <div style={{ marginLeft: ".5rem" }}>
                      <p style={{ margin: 0, fontSize: "1rem" }}>
                        {el.asset.abbr}
                      </p>
                      <p style={{ margin: 0, fontSize: ".7rem" }}>
                        {getFullName(el.asset.abbr)}
                      </p>
                    </div>
                  </div>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.type}</h6>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <h6 style={{ margin: "0" }}>
                    <strong>{Number(el.volume)}</strong>
                  </h6>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6
                    style={
                      el.status === "Done"
                        ? { margin: "0", color: "#00aa08" }
                        : { margin: "0", color: "rgb(248, 0, 0)" }
                    }
                  >
                    {el.status}
                  </h6>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.time}</h6>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const PortfolioTable = (props) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta1, setMeta1] = useState(0);
  const [eth, setEth] = useState(0);
  const [btc, setBtc] = useState(0);
  const [bnb, setBnb] = useState(0);
  const [eos, setEos] = useState(0);
  const [xlm, setXlm] = useState(0);
  const [ltc, setLtc] = useState(0);
  const {
    data,
    column,
    direction,
    onAssetSelect,
    onSendClick,
    onDepositClick,
    onSetHideZero,
    hideZero,
    assets,
  } = props;

  useEffect(() => {
    getDatas();
    data.forEach((d, i) => {
      let precision = assets.filter((asset) => asset.symbol.includes(d.name));
      Object.assign(data[i], { pre: precision[0].precision });
    });
    setLists(data);
  }, [data, assets]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  function getDatas() {
    try {
      Meta1.ticker("USDT", "BTC").then((res) => setBtc(res));
      Meta1.ticker("USDT", "BNB").then((res) => setBnb(res));
      Meta1.ticker("USDT", "LTC").then((res) => setLtc(res));
      Meta1.ticker("USDT", "XLM").then((res) => setXlm(res));
      Meta1.ticker("USDT", "ETH").then((res) => setEth(res));
      Meta1.ticker("USDT", "EOS").then((res) => setEos(res));
      Meta1.ticker("USDT", "META1").then((res) => setMeta1(res));
    } catch (e) {}
  }

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const cryptoAllInfo = (token) => {
    switch (token) {
      case "META1":
        return meta1;
      case "ETH":
        return eth;
      case "BNB":
        return bnb;
      case "LTC":
        return ltc;
      case "BTC":
        return btc;
      case "EOS":
        return eos;
      case "XLM":
        return xlm;
      case "USDT":
        return { latest: 1, percent_change: 0 };
      default:
        return;
    }
  };

  if (loading) return <MetaLoader size={"small"} />;

  const currencyValue = (data) => {
    let assetValue = cryptoAllInfo(data.name).latest;
    if (data.name === "META1") {
      return (meta1.latest * data?.qty).toFixed(2);
    } else if (assetValue * data?.qty === 0) {
      return "0.00";
    } else {
      return (assetValue * data?.qty).toFixed(2);
    }
  };
  const currencyPrice = (data) => {
    return Number(cryptoAllInfo(data.name).latest).toFixed(2);
  };

  return (
    <TableContainer
      component={Paper}
      style={{
        borderRadius: "4px",
        height: "100%",
        boxShadow: "0 2px 10px 0 rgba(0, 0, 0, .11)",
      }}
    >
      <Table
        sx={{ minWidth: 700 }}
        aria-label="customized table"
        style={{ height: "100%" }}
      >
        <TableHead>
          <TableRow>
            <StyledTableCell>
              <div className="table_title">ASSET</div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="table_flex">
                <div className="table_title">QTY</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title" id={"valueTitle"}>
                  {`VALUE (${localStorage.getItem("currency").split(" ")[1]})`}
                </div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title">24hr CHANGE</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title" id={"priceTitle"}>
                  {`PRICE (${localStorage.getItem("currency").split(" ")[1]})`}
                </div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className={"text-left"}>
                <div className="table_title">TRADE</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className={"text-left"}>
                <div className="table_title">SEND</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className={"text-left"}>
                <div className="table_title">DEPOSIT</div>
              </div>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lists?.map((data) => (
            <StyledTableRow key={data?.name}>
              <StyledTableCell component="th" scope="row">
                {
                  <div className="asset-image">
                    <Image size="mini" src={data?.image} />
                    <div className="asset-name">{data?.name}</div>
                  </div>
                }
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {data?.qty > 0 ? (data?.qty * 1).toFixed(data?.pre) : "0.00"}
              </StyledTableCell>
              <StyledTableCell align="center" className={"currencyValues"}>
                {(
                  currencyValue(data, meta1) *
                  Number(localStorage.getItem("currency").split(" ")[2])
                ).toFixed(2)}
              </StyledTableCell>
              <StyledTableCell align="left">
                {
                  <div
                    className={
                      Number(cryptoAllInfo(data.name).percent_change) >= 0
                        ? "plus"
                        : "minus"
                    }
                  >
                    {cryptoAllInfo(data.name).percent_change >= 0
                      ? "+" + cryptoAllInfo(data.name).percent_change
                      : cryptoAllInfo(data.name).percent_change}
                    %
                  </div>
                }
              </StyledTableCell>
              <StyledTableCell align="left" className={"currencyPrices"}>
                {(
                  currencyPrice(data, meta1) *
                  Number(localStorage.getItem("currency").split(" ")[2])
                ).toFixed(3)}
              </StyledTableCell>
              <StyledTableCell align="left">
                <button
                  onClick={() => {
                    onAssetSelect(data?.name);
                    localStorage.setItem("location", "exchange");
                  }}
                  className={"tradeButton"}
                >
                  Trade
                </button>
              </StyledTableCell>
              <StyledTableCell align="left">
                <button
                  onClick={() => {
                    onSendClick(data?.name);
                    localStorage.setItem("location", "sendFunds");
                  }}
                  className={data.qty > 0 ? "sendButton" : "sendButtonDisabled"}
                  disabled={data.qty <= 0}
                >
                  Send
                </button>
              </StyledTableCell>
              <StyledTableCell align="left">
                {data.name !== "EOS" && data.name !== "META1" && (
                  <button
                    onClick={() => {
                      onDepositClick(data.name);
                      localStorage.setItem("location", "deposit");
                    }}
                    className={"depositButton"}
                  >
                    Deposit
                  </button>
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function Wallet(props) {
  const {
    account,
    portfolio,
    onDepositClick,
    onAssetSelect,
    onSendClick,
    assets,
    accountName,
    portfolioReceiver,
  } = props;
  const [currentCurrency, setCurrentCurrency] = useState(0);
  const [orders, setOrders] = useState(null);
  const [hideZero, setHideZero] = useState(true);
  const [totalChange, setTotalChange] = useState("0");
  const [totalSum, setTotalSum] = useState(0);
  const [meta1, setMeta1] = useState(0);
  const [eth, setEth] = useState(0);
  const [btc, setBtc] = useState(0);
  const [bnb, setBnb] = useState(0);
  const [loader, setLoader] = useState(true);
  const [eos, setEos] = useState(0);
  const [xlm, setXlm] = useState(0);
  const [ltc, setLtc] = useState(0);
  const [check, setCheck] = useState(false);

  useEffect(async () => {
    if (!check) {
      getData();
      setCheck(true);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 1500);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("mainBlock").style.height = "92vh";
    }, 50);
  }, []);

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const openDrop = () => {
    document.getElementById("switchContainer").style.display === "none"
      ? (document.getElementById("switchContainer").style.display = "block")
      : (document.getElementById("switchContainer").style.display = "none");
  };

  function getData() {
    Meta1.ticker("USDT", "BTC").then((res) => setBtc(res));
    Meta1.ticker("USDT", "BNB").then((res) => setBnb(res));
    Meta1.ticker("USDT", "LTC").then((res) => setLtc(res));
    Meta1.ticker("USDT", "XLM").then((res) => setXlm(res));
    Meta1.ticker("USDT", "ETH").then((res) => setEth(res));
    Meta1.ticker("USDT", "EOS").then((res) => setEos(res));
    Meta1.ticker("USDT", "META1").then((res) => setMeta1(res));
  }

  const cryptoAllInfo = (token) => {
    switch (token) {
      case "META1":
        return meta1;
      case "ETH":
        return eth;
      case "BNB":
        return bnb;
      case "LTC":
        return ltc;
      case "BTC":
        return btc;
      case "EOS":
        return eos;
      case "XLM":
        return xlm;
      case "USDT":
        return { latest: 1, percent_change: 0 };
      default:
        return;
    }
  };

  function currencyValue(data, meta1) {
    let assetValue = cryptoAllInfo(data.name).latest;
    if (data.name === "META1") {
      return (meta1.latest * data?.qty).toFixed(2);
    } else if (assetValue * data?.qty === 0) {
      return "0.00";
    } else {
      return (assetValue * data?.qty).toFixed(2);
    }
  }

  useEffect(() => {
    let summTik = 0,
      percentage = 0,
      totSum = 0,
      lastChange = 0;
    for (let i of portfolio) {
      if (Number(i.qty) > 0) {
        percentage = Number(cryptoAllInfo(i.name).percent_change);
        summTik = Number(currencyValue(i, meta1));
        lastChange += ((100 - percentage) * summTik) / 100;
        totSum += summTik;
      }
    }
    let ch = 100 - (lastChange * 100) / totSum;
    setTotalSum(totSum.toFixed(2));
    setTotalChange(
      Number(ch) > 0 ? ch.toFixed(2).toString() : ch.toFixed(2).toString()
    );
  }, [portfolio, meta1]);

  const changeCurrencyToFiat = async () => {
    document.getElementById("switchContainer").style.display = "none";
    setCurrentCurrency(currentCurrency + 1);
    document.getElementById("forCheck").innerText = localStorage
      .getItem("currency")
      .split(" ")[1];
  };

  const changeCryptoCurrency = async (e) => {
    let chosen = document.getElementById("forCheck").innerText;
    document.getElementById("switchContainer").style.display = "none";
    let crypto = null;
    switch (e.target.nodeName) {
      case "LI":
        crypto = e.target.outerText;
        break;
      case "SPAN":
        crypto = e.target.outerText;
        break;
      case "IMG":
        crypto = e.target.nextSibling.outerText;
        break;
      default:
        break;
    }
    if (crypto !== "META1") {
      if (document.getElementById("forCheck").innerText === "META1") {
        chosen = localStorage.getItem("currency").split(" ")[1];
        let data = await getAllByOne(chosen, crypto);
        setCurrentCurrency(currentCurrency + 1);
        setTimeout(() => {
          let values = document.getElementsByClassName("currencyValues");
          let prices = document.getElementsByClassName("currencyPrices");
          for (let i = 0; i < values.length; i++) {
            values[i].innerText = Number(
              values[i].innerText * data[crypto]
            ).toFixed(7);
            prices[i].innerText = Number(
              prices[i].innerText * data[crypto]
            ).toFixed(7);
          }
          document.getElementById("valueTitle").innerText = `VALUE (${crypto})`;
          document.getElementById("priceTitle").innerText = `PRICE (${crypto})`;
          document.getElementById("forCheck").innerText = crypto;
        }, 2000);
      } else {
        let data = await getAllByOne(chosen, crypto);
        let values = document.getElementsByClassName("currencyValues");
        let prices = document.getElementsByClassName("currencyPrices");
        for (let i = 0; i < values.length; i++) {
          values[i].innerText = Number(values[i].innerText * data[crypto])
            .toFixed(7)
            .toString();
          prices[i].innerText = Number(prices[i].innerText * data[crypto])
            .toFixed(7)
            .toString();
        }
        document.getElementById("valueTitle").innerText = `VALUE (${crypto})`;
        document.getElementById("priceTitle").innerText = `PRICE (${crypto})`;
        document.getElementById("forCheck").innerText = crypto;
      }
    } else {
      setCurrentCurrency(currentCurrency + 1);
      setTimeout(() => {
        let crypto = "META1";
        let values = document.getElementsByClassName("currencyValues");
        let prices = document.getElementsByClassName("currencyPrices");
        for (let i = 0; i < values.length; i++) {
          values[i].innerText = Number(
            Number(values[i].innerText) / Number(meta1.latest)
          )
            .toFixed(7)
            .toString();
          prices[i].innerText = Number(
            Number(prices[i].innerText) / Number(meta1.latest)
          )
            .toFixed(7)
            .toString();
        }
        document.getElementById("valueTitle").innerText = `VALUE (${crypto})`;
        document.getElementById("priceTitle").innerText = `PRICE (${crypto})`;
        document.getElementById("forCheck").innerText = crypto;
      }, 2000);
    }
  };

  function Portfolio(props) {
    if (portfolio == null || portfolio.length === 0)
      return <MetaLoader size={"small"} />;
    const filteredPortfolio = hideZero
      ? portfolio.filter((p) => p.qty > 0)
      : portfolio;

    return (
      <PortfolioTable
        assets={assets}
        history={orders}
        data={filteredPortfolio}
        onSendClick={onSendClick}
        onDepositClick={onDepositClick}
        onAssetSelect={props.onAssetSelect}
        onSetHideZero={setHideZero}
        hideZero={hideZero}
        column={null}
        direction={null}
      />
    );
  }
  return (
    <>
      <div style={{ marginLeft: "3rem" }} className={"totalSumBlock"}>
        <h4
          style={{ color: "#505361", fontSize: ".9rem", marginBottom: ".3rem" }}
        >
          Portfolio Balance
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            className={"blockSumAndPercentage"}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <h2 style={{ color: "#FFC000", fontSize: "2rem", margin: "0" }}>
              <strong className={"adaptAmountMain"}>
                {loader ? (
                  <Loader size="mini" active inline="centered" />
                ) : (
                  localStorage.getItem("currency").split(" ")[0] +
                  " " +
                  (
                    totalSum * localStorage.getItem("currency").split(" ")[2]
                  ).toFixed(2)
                )}
              </strong>
            </h2>
            <h5
              style={{
                margin: ".3rem 0 .5rem 1rem",
                fontSize: ".8rem",
                height: "55%",
                padding: ".3rem",
                borderRadius: "3px",
                boxShadow: "0 4px 9px 5px rgba(0,0,0,.11)",
              }}
              className={Number(totalChange) > 0 ? "plusFirst" : "minusFirst"}
            >
              {Number(totalChange) > 0 ? (
                <i
                  className="far fa-arrow-up fa-xs"
                  style={{ color: "#fff", marginRight: ".2rem" }}
                />
              ) : (
                <i
                  className="far fa-arrow-down fa-xs "
                  style={{ color: "#fff", marginRight: ".2rem" }}
                />
              )}
              {loader ? null : totalChange.replace("-", "")} %
            </h5>
          </div>
          <div className="rightSideBlock">
            <div className={"blockChoose"}>
              <noscript id={"forCheck"}>
                {localStorage.getItem("currency").split(" ")[1]}
              </noscript>
              <div className={"blockChoosen"} onClick={openDrop}>
                <span style={{ textAlign: "center" }}>
                  Select currency to display...
                </span>
                <i
                  className="fas fa-chevron-down"
                  style={{ marginTop: ".2rem" }}
                />
              </div>
              <div
                id={"switchContainer"}
                style={{ position: "relative", display: "none" }}
              >
                <ul className={"chooseContainer"}>
                  <li
                    className={"choosenContainerItem"}
                    onClick={changeCurrencyToFiat}
                  >
                    <img
                      src={fiatIcon}
                      alt="cryptoImage"
                      className="imgContainer"
                    />
                    <span className="spanDrop">
                      Fiat ({localStorage.getItem("currency").split(" ")[0]})
                    </span>
                  </li>
                  {assets.map((el) => (
                    <li
                      onClick={changeCryptoCurrency}
                      className={"choosenContainerItem"}
                    >
                      <img
                        src={el.image}
                        style={{ width: "35px" }}
                        alt="cryptoImage"
                        className="imgContainer"
                      />
                      <span className="spanDrop">{el.symbol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <hr
              style={
                isMobile
                  ? { display: "block", width: "100%" }
                  : { display: "none", width: "100%" }
              }
            />
            <div className={"switcher"} style={{ paddingTop: "1.4rem" }}>
              <span>Hide Zero Balances</span>
              <Switch
                className={"switch"}
                checked={hideZero}
                onChange={() => {
                  setHideZero(!hideZero);
                }}
                inputProps={{ "aria-label": "controlled" }}
                color={"warning"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="portfolio-table">
        <div className="portfolio-table">
          <Portfolio onAssetSelect={onAssetSelect} />
        </div>
      </div>
    </>
  );
}

export default Wallet;
