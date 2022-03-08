import "semantic-ui-css/semantic.min.css";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "react-query";

const WidgetDivs = document.querySelectorAll(".meta_one_widget");

const client = new QueryClient();

WidgetDivs.forEach((Div) => {
  ReactDOM.render(
    <React.StrictMode>
      <QueryClientProvider client={client}>
        <App domElement={Div} />
      </QueryClientProvider>
    </React.StrictMode>,
    Div
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
