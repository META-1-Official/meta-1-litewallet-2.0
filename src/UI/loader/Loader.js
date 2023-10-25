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
    mini: {
      width: "100px",
      height: "100px",
      margin: "3rem auto",
      display: "block",
    },
  };

  return (
    <div
      style={
        size === "small"
          ? {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
          : size === "mini" ? {
            width: "100%",
            height: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          } : {
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
      }
    >
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
