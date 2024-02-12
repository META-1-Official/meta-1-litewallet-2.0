import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const OrdersTable = React.memo((props) => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    setLists(props?.data);
  }, []);

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
              <div className="table_title" style={{ width: "6rem", textAlign: 'center' }}>No</div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title">Holder</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="table_flex">
                <div className="table_title">Order Number</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title">Order ID</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title">Status</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className="text-left" style={{ width: "6rem" }}>
                <div className="table_title">Amount</div>
              </div>
            </StyledTableCell>
            <StyledTableCell>
              <div className={"text-left"}>
                <div className="table_title">Date</div>
              </div>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lists && lists?.map((ele, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell align="center" className={"bodyCell"}>
                {index}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.BillToFirstName} {ele?.BillToLastName}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.OrderNumber}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.CorrelationId}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.OrderStatus}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.OrderDate}
              </StyledTableCell>
              <StyledTableCell align="center" className={"bodyCell"}>
                {ele?.TotalCharges}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default PortfolioTable;
