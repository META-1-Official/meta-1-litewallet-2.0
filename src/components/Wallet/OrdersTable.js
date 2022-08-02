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
import { FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { trxTypes } from "../../helpers/utility";
import { ChainTypes as grapheneChainTypes } from 'meta1-vision-js';
import TrxHash from './TransactionHash';

const {operations} = grapheneChainTypes;
const ops = Object.keys(operations);
ops.push(
	'property_create_operation',
	'property_update_operation',
	'property_approve_operation',
	'property_delete_operation',
	'asset_price_publish_operation'
);

export const OrdersTable = (props) => {
  const { column, direction, assets, account } = props;
  const [pageNum, setPageNum] = useState(1);
  const [perPage,setPerPage]= useState(10);
  const [filterCollection, setFilterCollection] = useState([]);
  const { data, isLoading, error } = useQuery(["history", pageNum, perPage], getHistory);
  useEffect(()=>{
    if (Array.isArray(data)) {
      setFilterCollection(data);
    }
  },[data]);
  
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
                Operation
              </StyledTableCell>
              <StyledTableCell align="left">
                Sender / Receiver
              </StyledTableCell>
              <StyledTableCell align="left">Transaction Hash</StyledTableCell>
              <StyledTableCell align="left">Time</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterCollection.map((el, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align="center">
                  <span
                    style={{background: `#${el.op_color}`}}
                    className='span-status-btn'
                  >
                    {trxTypes[ops[el.op_type]]}
                  </span>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.operation_text}</h6>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <TrxHash trx={el.block_num} />
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.time}</h6>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={2}>
        <Grid item md={10}>
          <Stack spacing={2}>
            {filterCollection.length>0 && <div className="page_sec">
              <span>Total of {filterCollection[0].count} operations</span>
              <Pagination 
                count={Math.ceil(filterCollection[0].count/perPage)} 
                shape="rounded"
                page={pageNum}
                onChange={(e, num) => { setPageNum(num) }}
              />
            </div>}
          </Stack>
        </Grid>
        <Grid item md={1.5}  class='grid-css' >
          <Stack spacing={2}>
          <FormControl variant="standard">
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
              label="Records per Page"
            >
              <MenuItem value={10}>10/ Page</MenuItem>
              <MenuItem value={20}>20/ Page</MenuItem>
              <MenuItem value={50}>50/ Page</MenuItem>
              <MenuItem value={100}>100/ Page</MenuItem>
              {filterCollection.length > 0 && filterCollection[0].count > 100 && filterCollection[0].count &&
                <MenuItem value={filterCollection[0].count}>{filterCollection[0].count}/ Page</MenuItem>}
            </Select>
          </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
