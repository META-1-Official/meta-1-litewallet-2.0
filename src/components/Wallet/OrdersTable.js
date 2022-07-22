import { useQuery } from "react-query";
import Meta1 from "meta1-vision-dex";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MetaLoader from "../../UI/loader/Loader";
import Paper from "@mui/material/Paper";
import { getAsset, getFullName } from "./cryptoChooser";
import getHistory from "../../lib/fetchHistory";
import { removeExponent } from "../../utils/commonFunction";

export const OrdersTable = (props) => {
  const { column, direction, assets, account } = props;

  const { data, isLoading, error } = useQuery("history", getHistory, {
    refetchInterval: 1500,
  });

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
              <StyledTableCell align="center">
                Sender / Receiver
              </StyledTableCell>
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
                <StyledTableCell align="center">
                  <h6 style={{ margin: "0" }}>{el.usersData}</h6>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <h6 style={{ margin: "0" }}>
                    <strong>{removeExponent(Number(el.volume))}</strong>
                  </h6>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6
                    className={
                      el.status === "Place order" || el.status === "Transfer"
                        ? 'success-class'
                        : 'cancel-class'
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
