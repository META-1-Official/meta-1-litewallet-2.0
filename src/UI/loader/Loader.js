import React from "react";
import loader from "../../images/loaders/Meta1Loader.gif";

const MetaLoader = (props) => {
  const { size } = props;

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const sizes = {
    largeMobile: {
      width: "200px",
      height: "250px",
      margin: "50% auto",
      display: "block",
    },
    small: {
      width: "100px",
      height: "auto",
      margin: "3rem auto",
      display: "block",
    },
    large: {
      width: "350px",
      height: "auto",
      margin: "3rem auto",
      display: "block",
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <img
        style={
          size === "large" && isMobile
            ? sizes["largeMobile"]
            : size === "large" && !isMobile
            ? sizes["large"]
            : sizes["small"]
        }
        src={loader}
        alt="Meta1 Loader"
      />
    </div>
  );
};

export default MetaLoader;
