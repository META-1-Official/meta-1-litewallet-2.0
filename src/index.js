import "semantic-ui-css/semantic.min.css";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
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
