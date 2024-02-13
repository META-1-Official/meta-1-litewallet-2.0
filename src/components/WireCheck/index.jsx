import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Button } from '@mui/material';
import Paper from "@mui/material/Paper";
import { useSelector } from 'react-redux';
import { accountsSelector } from "../../store/account/selector";
import { getUserKycProfileByAccount, generateWireCheckToken, getAllWireCheckOrders } from "../../API/API";
import { CreateOrderModal } from "./CreateOrderModal";
import NoFoundImg from "../../images/no-found.png";

import './wirecheck.css';
import styles from "./orderlist.module.scss";

const WireCheck = React.memo((props) => {
  const accountNameState = useSelector(accountsSelector);

  const [lists, setLists] = useState([]);
  const [token, setToken] = useState();
  const [email, setEmail] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(async () => {
    if (token) {
      setLoading(true);
      let res = await getAllWireCheckOrders(token);

      if (res?.Orders?.length !== 0) {
        setLists(res.Orders.filter(ele => ele.Details.WalletId === accountNameState));
      } else {
        setLists([]);
        console.log('somethign went wrong');
      }
    }
  }, [token]);

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

  return <div className={styles.orderlist}>
    <div className={styles.totalOrders}>Total Orders: {lists?.length}</div>
    {lists.length === 0 ?
      <img alt="eth" src={NoFoundImg} width={100} style={{marginTop: '30px'}}/> :
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
                <div className="table_title" style={{ width: "6rem" }}>No</div>
              </StyledTableCell>
              <StyledTableCell>
                <div className="text-left" style={{ width: "6rem" }}>
                  <div className="table_title">Holder</div>
                </div>
              </StyledTableCell>
              <StyledTableCell>
                <div className="text-left" style={{ width: "6rem" }}>
                  <div className="table_title">Order ID</div>
                </div>
              </StyledTableCell>
              <StyledTableCell>
                <div className="text-left" style={{ width: "6rem" }}>
                  <div className="table_title">Amount</div>
                </div>
              </StyledTableCell>
              <StyledTableCell>
                <div className="text-left" style={{ width: "6rem" }}>
                  <div className="table_title">Date</div>
                </div>
              </StyledTableCell>
              <StyledTableCell>
                <div className={"text-left"}>
                  <div className="table_title">Status</div>
                </div>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lists && lists?.map((ele, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {ele?.Details?.BillToFirstName} {ele?.Details.BillToLastName}
                </StyledTableCell>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {ele?.CorrelationId}
                </StyledTableCell>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {ele?.Details?.Total}
                </StyledTableCell>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {ele?.Details?.OrderDate}
                </StyledTableCell>
                <StyledTableCell align="center" className={"bodyCell"}>
                  {ele?.OrderStatus}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>}
    <Button
      className={styles.submitButton}
      onClick={() => setOpen(true)}
    >
      Create New Order
    </Button>
    {open && <CreateOrderModal token email/>}
  </div>
});

export default WireCheck;
