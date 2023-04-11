import "semantic-ui-css/semantic.min.css";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import store from "./store";
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';

const WidgetDivs = document.querySelectorAll(".meta_one_widget");

const client = new QueryClient();

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

WidgetDivs.forEach((Div) => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={client}>
          <App domElement={Div} />
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>,
    Div
  );
});
