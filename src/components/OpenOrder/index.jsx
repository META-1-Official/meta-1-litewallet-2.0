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
import { Button, Grid, Popover, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector } from "../../store/account/selector";
import getOpenOrder from "../../lib/fetchOpenOrder";
import { ChainStore } from "meta1-vision-js";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import moment from "moment";

const OpenOrder = (props) => {
	const accountNameState = useSelector(accountsSelector);
	const { column, direction } = props;
	const [filterCollection, setFilterCollection] = useState([]);
	const [isInvent, setIsInvent] = useState({
		current: false,
		symbol: []
	});

	const { data, isLoading, error } = useQuery(["openOrder", accountNameState, isInvent], getOpenOrder);
	useEffect(() => {
		if (Array.isArray(data)) {
			data.sort((a, b) => {
				return a.order.getPrice() - b.order.getPrice();
			});

			data.sort((a, b) => {
				if (a.marketName > b.marketName) {
				return 1;
				}
				if (a.marketName < b.marketName) {
				return -1;
				}
			});
			data.sort((a, b) => {
				return (
				moment(b.order.expiration).valueOf() -
				moment(a.order.expiration).valueOf()
				);
			});
			setFilterCollection(data);
		}
	}, [data]);

	const inventHandler = (currentValue, symbol) => {
		let symbolArr = isInvent.symbol;

		if (currentValue) {
			symbolArr.splice(symbolArr.indexOf(symbol),1);	
		} else {
			symbolArr.push(symbol)
		}	

		setIsInvent(prev => {
			return {
				current: !currentValue,
				symbol : symbolArr
			}
		});
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
									<span className={`${el.isInverted ? 'danger-title' : 'success-title'}`}>
										{el.isInverted ? 'Sell' : 'Buy'}
									</span>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.fromTo}</h6>
								</StyledTableCell>
								<StyledTableCell align="left">
								<PopupState variant="popover" popupId="demo-popup-popover">
									{(popupState) => (
										<div>
											<h6 {...bindTrigger(popupState)} style={{ margin: "0" }}>{el.price}<span className="price_symbol">{el.priceSymbol}</span></h6>
											<Popover
												className="price_symbol_model"
												{...bindPopover(popupState)}
												anchorOrigin={{
													vertical: 'top',
													horizontal: 'center',
												}}
												transformOrigin={{
													vertical: 'bottom',
													horizontal: 'center',
												}}
											>
												<Typography className="price_symbol_model" sx={{ p: 2 }}>
													<Button className="inside_model_btn" onClick={() => inventHandler(el.isInverted, el.marketName)} >Invert the price</Button>
												</Typography>
											</Popover>
										</div>
									)}
								</PopupState>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.marketPrice}</h6>
								</StyledTableCell>
								<StyledTableCell align="left">
									<h6 style={{ margin: "0" }}>{el.creationDate}</h6>
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
