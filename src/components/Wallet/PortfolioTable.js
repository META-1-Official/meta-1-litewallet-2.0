import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MetaLoader from "../../UI/loader/Loader";
import { Image } from "semantic-ui-react";
import Meta1 from "meta1-vision-dex";

import { useQuery } from "react-query";
import { removeExponent } from "../../utils/commonFunction";
import { userCurrencySelector } from "../../store/meta1/selector";
import { useSelector } from "react-redux";

const PortfolioTable = React.memo((props) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawBtnShow] = useState(["bnb", "usdt", "btc", "ltc", "xlm", "eth"]);

  const {
    filteredPortfolio,
    onAssetSelect,
    onSendClick,
    onDepositClick,
    onWithdrawClick,
    assets,
    userCurrency,
    isCurrencySelected
  } = props;
  const userCurrencyState = useSelector(userCurrencySelector);
  const  cryptosTable = useQuery("cryptosTable", getDatas);
  const data = cryptosTable?.data
  const isLoading = cryptosTable?.isLoading

  const newDataPercent = useQuery(['getPercent', isCurrencySelected],getPercentChange)
  const dataPercent = newDataPercent?.data;

  async function getDatas() {
    const cryptoArray = ["META1", "ETH", "BTC", "BNB", "EOS", "XLM", "LTC"];
    let fetchedCryptos = {};
    for (let i = 0; i < cryptoArray.length; i++) {
      fetchedCryptos[cryptoArray[i]] = await Meta1.ticker(
        "USDT",
        cryptoArray[i]
      );
    }
    fetchedCryptos["USDT"] = { latest: 1, percent_change: 0 };
    setLoading(false);
    return fetchedCryptos;
  }

  async function getPercentChange(event) {
    const currency = event.queryKey[1] || "USDT";
    const cryptoArray = ["META1", "ETH", "BTC", "BNB", "EOS", "XLM", "LTC", 'USDT'];
    let percentFetchedCryptos = {};
    for (let i = 0; i < cryptoArray.length; i++) {
      percentFetchedCryptos[cryptoArray[i]] = await Meta1.ticker(
        currency,
        cryptoArray[i]
      );
    }
    if (currency === 'USDT') {
      percentFetchedCryptos["USDT"] = { latest: 1, percent_change: 0 }
    } else {
      if (!percentFetchedCryptos["USDT"]){
        percentFetchedCryptos["USDT"] = { latest: 1, percent_change: 0 }
      }
    }
    setLoading(false);
    return percentFetchedCryptos;
  }
 

  useEffect(() => {
    filteredPortfolio.forEach((d, i) => {
      let precision = assets.filter((asset) => asset.symbol.includes(d.name));
      Object.assign(filteredPortfolio[i], { pre: precision[0].precision });
    });
    setLists(filteredPortfolio);
  }, [filteredPortfolio, assets, data]);

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

  const currencyValue = (datas) => {
    let assetValue = data[datas.name].latest;
    if (datas.name === "META1") {
      return (data["META1"].latest * datas?.qty).toFixed(datas.pre);
    } else if (assetValue * data?.qty === 0) {
      return "0.00";
    } else {
      return (assetValue * datas?.qty).toFixed(datas.pre);
    }
  };

  const currencyPrice = (datass) => {
    return Number(data[datass.name].latest).toFixed(8);
  };

  const calculateCurrencyPrice = (value) => {
    if (isCurrencySelected) {
      if (isCurrencySelected === 'META1') {
        return value / Number(data["META1"].latest)
      }
      return JSON.parse(sessionStorage.getItem('currencyResult'))[isCurrencySelected] * value
    } else {
      return value
    }
  }

  if (isLoading && loading) return <MetaLoader size={"small"} />;

  return (
    <TableContainer
      component={Paper}
      style={{
        borderRadius: "4px",
        boxShadow: "0 2px 10px 0 rgba(0, 0, 0, .11)",
      }}
    >
      <Table sx={{ minWidth: 700 }} aria-label="customized table" className="custom_table_head" >
        <TableHead>
          <TableRow>
            <StyledTableCell>
              <div className="table_title" style={{ width: "6rem", textAlign: 'center' }}>ASSET</div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="table_flex">
                <div className="table_title">QTY</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title" id={"valueTitle"}>
                  {`VALUE (${isCurrencySelected ? isCurrencySelected : userCurrencyState.split(" ")[1]})`}
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
                  {`PRICE (${isCurrencySelected ? isCurrencySelected : userCurrencyState.split(" ")[1]})`}
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
            <StyledTableCell>
              <div className={"text-left"}>
                <div className="table_title">WITHDRAW</div>
              </div>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && dataPercent && lists?.map((datas) => (
            <StyledTableRow key={datas?.name}>
              <StyledTableCell component="th" scope="row">
                {
                  <div className="asset-image dashboard">
                    <Image size="mini" src={datas?.image} />
                    <div className="asset-name">{datas?.name}</div>
                  </div>
                }
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {datas?.qty > 0 ? (datas?.qty * 1).toFixed(datas?.pre) : "0.00"}
              </StyledTableCell>
              <StyledTableCell align="center" className={"currencyValues"}>
                {datas?.qty > 0 ? removeExponent(Number((datas?.qty * 1)) * Number(
                  (
                    calculateCurrencyPrice(currencyPrice(datas, data[datas.name]) *
                      Number(userCurrencyState.split(" ")[2])
                    ))
                )) : removeExponent(0)}
              </StyledTableCell>
              <StyledTableCell align="left">
                  <div
                    className={
                      Number(dataPercent[datas.name]?.percent_change) >= 0
                        ? "plus"
                        : "minus"
                    }
                  >
                    {dataPercent[datas.name]?.percent_change >= 0
                      ? "+" + dataPercent[datas.name]?.percent_change
                      : dataPercent[datas.name]?.percent_change}
                    %
                  </div>
              </StyledTableCell>
              <StyledTableCell align="right" className={"currencyPrices"}>
                {removeExponent(Number(
                  (
                    calculateCurrencyPrice(currencyPrice(datas, data[datas.name]) *
                      Number(userCurrencyState.split(" ")[2]))
                  )
                ))}
              </StyledTableCell>
              <StyledTableCell align="left">
                <button
                  onClick={() => {
                    onAssetSelect(datas?.name);
                  }}
                  className={"tradeButton"}
                >
                  Trade
                </button>
              </StyledTableCell>
              <StyledTableCell align="left">
                <button
                  onClick={() => {
                    onSendClick(datas?.name);
                  }}
                  className={
                    datas.qty > 0 ? "sendButton" : "sendButtonDisabled"
                  }
                  disabled={datas.qty <= 0}
                >
                  Send
                </button>
              </StyledTableCell>
              <StyledTableCell align="left">
                {datas.name !== "EOS" && datas.name !== "META1" && (
                  <button
                    onClick={() => {
                      onDepositClick(datas.name);
                    }}
                    className={"depositButton"}
                  >
                    Deposit
                  </button>
                )}
              </StyledTableCell>
              <StyledTableCell align="left">
                {withdrawBtnShow.includes(datas.name.toLowerCase()) && (
                  <button
                    onClick={() => {
                      onWithdrawClick(datas.name);
                    }}
                    className={"withdrawButton"}
                  >
                    Withdraw
                  </button>
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default PortfolioTable;
