import React from "react";

const AssetName = (props) => {
	return (
		<a className="price_symbol" href={`${process.env.REACT_APP_EXPLORER_META1_URL}/assets/${props.name}`} style={props.style}>{props.name}</a>
	);
};
export default AssetName;
