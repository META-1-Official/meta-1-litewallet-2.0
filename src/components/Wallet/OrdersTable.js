import { useQuery } from "react-query";
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
import { useEffect, useState } from "react";
import { ChainTypes as grapheneChainTypes } from 'meta1-vision-js';
import { FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack } from "@mui/material";
import { trxTypes } from "../../helpers/utility";
import TrxHash from './TransactionHash';
import { checkTokenRequest } from "../../store/account/actions";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector } from "../../store/account/selector";

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
  const dispatch = useDispatch();
  const accountNameState = useSelector(accountsSelector);
  const { column, direction, assets, account } = props;
  const [pageNum, setPageNum] = useState(1);
  const [perPage,setPerPage]= useState(10);
  const [filterValues, setFilterValues] = useState('-1')
  const [filterCollection, setFilterCollection] = useState([]);
  const { data, isLoading, error } = useQuery(["history", pageNum, perPage, filterValues === "-1" ? '' : filterValues, accountNameState], getHistory);
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

  const allFilterStatusArr = [
    'transfer',
    'limit_order_create',
    'limit_order_cancel',
    'fill_order',
    'account_create',
    'account_update',
    'asset_create',
    'witness_withdraw_pay',
    'vesting_balance_withdraw',
  ];
  
  const searchFilterListing = allFilterStatusArr.map( data => {
    return { name: trxTypes[data].replace('account', 'wallet'), value: ops.indexOf(data) >= 0 ? ops.indexOf(data) : 'no found' };
  });

  const paginationOptions = [10,20,50,100];
  let paginationOptionsFilter = [];
  if (filterCollection.length > 0) {
    if (filterCollection[0].count <= 50) {
      if(filterCollection[0].count > 10) {
        for(let i = 0; i < paginationOptions.length; i++) {
          if (paginationOptions[i] <= filterCollection[0].count) {
            paginationOptionsFilter.push(paginationOptions[i]);
          } else if (paginationOptions[i-1] < filterCollection[0].count && paginationOptions[i] > filterCollection[0].count) {
            paginationOptionsFilter.push(paginationOptions[i]);
          }
        }
      }
    } else {
      paginationOptionsFilter = [...paginationOptions];
    }
  }

  if (isLoading) return <MetaLoader size={"small"} />;

  return (
    <>
    <Grid item md={10} className='search-grid'>
        <Stack spacing={2}></Stack>
        <FormControl variant="standard" >
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={filterValues}
            onChange={(e) => {
              dispatch(checkTokenRequest(accountNameState));
              setPageNum(1);
              setFilterValues(e.target.value);
            }}
            label="Search"
            className="search-filter"
          >
            <MenuItem value='-1'>Show All</MenuItem>
            {searchFilterListing.map((option, index) => {
              return <MenuItem key={index} value={option.value}>{option.name}</MenuItem>
            })}
          </Select>
        </FormControl>
      </Grid>
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
                    className={`span-status-btn ${trxTypes[ops[el.op_type]] === 'Cancel order' ? 'transaction-span-cancel' : trxTypes[ops[el.op_type]] === 'Place order' ? 'transaction-span-place' : 'transaction-span-fill' }`}
                  >
                    {trxTypes[ops[el.op_type]].replace('account', 'wallet')}
                  </span>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.operation_text}</h6>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <div>{el.transactionHash}</div>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <h6 style={{ margin: "0" }}>{el.time}</h6>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {filterCollection.length === 0 && <StyledTableRow>
              <StyledTableCell align="center" colSpan={4}>
                  <span>No record found</span>
              </StyledTableCell>
            </StyledTableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      {filterCollection.length > 0 && filterCollection[0].count <= 10 && <Grid container spacing={2}>
        <Grid item md={12}>
          <div className="page_sec">
            <span>Total of {filterCollection[0].count} operations</span>
          </div>
        </Grid>
      </Grid>}
      {filterCollection.length > 0 && filterCollection[0].count > 10 && <Grid container spacing={2}>
        <Grid item md={10}>
          <Stack spacing={2}>
            {filterCollection.length>0 && <div className="page_sec">
              <span>Total of {filterCollection[0].count} operations</span>
              <Pagination 
                count={Math.ceil(filterCollection[0].count/perPage)} 
                shape="rounded"
                page={pageNum}
                onChange={(e, num) => {
                  setPageNum(num);
                  dispatch(checkTokenRequest(accountNameState));
                }}
              />
            </div>}
          </Stack>
        </Grid>
        <Grid item md={1.5}  className='grid-css' >
          <Stack spacing={2}>
          <FormControl variant="standard">
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={perPage}
              onChange={(e) => {
                dispatch(checkTokenRequest(accountNameState));
                setPageNum(1);
                setPerPage(e.target.value)}
              }
              label="Records per Page"
            >
              {paginationOptionsFilter.map((option, index) => {
                return <MenuItem key={index} value={option}>{option}/ Page</MenuItem>
              })}
            </Select>
          </FormControl>
          </Stack>
        </Grid>
      </Grid>}
    </>
  );
};
