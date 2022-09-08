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
import { useEffect, useState } from "react";
import './OpenOrder.css';
import { Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector } from "../../store/account/selector";
import getOpenOrder from "../../lib/fetchOpenOrder";
import { ChainStore } from "meta1-vision-js";

const OpenOrder = (props) => {
	const accountNameState = useSelector(accountsSelector);
	const { column, direction } = props;
	const [filterCollection, setFilterCollection] = useState([]);
	const [refreshData, setRefreshData] = useState(false);
	const [chainStoreObj, setChainStoreObj] = useState(null);

	const { data, isLoading, error } = useQuery(["openOrder", chainStoreObj], getOpenOrder);
	useEffect(() => {
		if (Array.isArray(data)) {
			setFilterCollection(data);
		}
	}, [data]);

	useEffect(() => {
		let newObj = ChainStore.getAccount(
			accountNameState,
			undefined
		);

		if (newObj) {
			setChainStoreObj(newObj);
		}
		if (!newObj) {
			setRefreshData(prev => !prev)
		}
	}, [refreshData]);

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
								onClick={() => { }}
								align="left"
							>
								Buy / Sell
							</StyledTableCell>
							<StyledTableCell align="left">
								From / To
							</StyledTableCell>
							<StyledTableCell align="left">Price</StyledTableCell>
							<StyledTableCell align="left">Market Price</StyledTableCell>
							<StyledTableCell align="left">Order Date</StyledTableCell>
							<StyledTableCell align="left">Expiry Date</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filterCollection && filterCollection.map((el, index) => (
							<StyledTableRow key={index}>
								<StyledTableCell align="center">
									<span className="success-title">
										Buy
									</span>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.fromTo}</h6>
								</StyledTableCell>
								<StyledTableCell align="left">
								<h6 style={{ margin: "0" }}>{el.price}<span className="price_symbol">{el.priceSymbol}</span></h6>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.marketPrice}</h6>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.expiration}</h6>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.expiration}</h6>
								</StyledTableCell>
							</StyledTableRow>
						))}
						{filterCollection && filterCollection.length === 0 && <StyledTableRow>
							<StyledTableCell align="center" colSpan={4}>
								<span>No record found</span>
							</StyledTableCell>
						</StyledTableRow>}
					</TableBody>
				</Table>
			</TableContainer>


			{filterCollection.length > 0 && <Grid container spacing={2}>
				<Grid item md={12}>
					<div className="page_sec">
						<span>Total of {filterCollection.length} operations</span>
					</div>
				</Grid>
			</Grid>}

		</>
	);
};
export default OpenOrder;
