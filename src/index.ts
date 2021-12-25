import "./polyfills";

import { app } from "@reco-m/core-ui";


import routers from "./router";
import reportWebVitals from "./reportWebVitals";
import $ from 'jquery'
app.router(routers as any);

app.start("#root");

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
$
