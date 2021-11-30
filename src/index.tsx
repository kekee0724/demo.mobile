import "./polyfills";
import { browser} from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import Routers from "./router";
import reportWebVitals from "./reportWebVitals";

const html = document.getElementsByTagName('html')[0];
html.classList.add("theme-white");

browser.versions.android ? html.classList.add("android") : html.classList.add("ios");

app.router((props) => <Routers {...props} />);

app.start("#root");

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
