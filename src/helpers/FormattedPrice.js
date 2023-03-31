import React, {useState} from "react";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { Button, Popover, Typography } from "@mui/material";

const FormattedPrice = (props) => {
	const [inverted, setInverted] = useState(false);
	const {priceBase, priceQuote, baseAsset, quoteAsset, divideby} = props;

    let price = new Intl.NumberFormat('en',
      { minimumFractionDigits: 6,
        maximumFractionDigits: 6
      })
    .format(inverted? (priceQuote / priceBase * divideby) : (priceBase / priceQuote / divideby));

    let marketName = inverted?`${quoteAsset}/${baseAsset}`:`${baseAsset}/${quoteAsset}`;
 
	return (
		<span className="float-left">
			<span className="float-left">
              &nbsp;at {price}
            </span>

            <PopupState variant="popover" popupId="demo-popup-popover">
              {(popupState) => (
                <span className="float-left">
                  <h6 className="order-table-column-padding" {...bindTrigger(popupState)} style={{ margin: "0" }}> 
                  <span className="price_symbol">{marketName}</span></h6>
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
                      <Button className="inside_model_btn" onClick={() => {setInverted(!inverted)}} >Invert the price</Button>
                      <Button className="inside_model_btn" onClick={() => {
                        window.location.href = `${process.env.REACT_APP_EXPLORER_META1_URL}/markets/${marketName}`;
                      }}>
                      Go to market
                      </Button>
                    </Typography>
                  </Popover>
                </span>
              )}
            </PopupState>
		</span>
	);
};
export default FormattedPrice;
