import React from "react";
import ReactDOM from "react-dom/client";

// 根据环境变量决定加载哪个应用
const entry = process.env.REACT_APP_ENTRY;

let App;
if (entry === "main-app") {
  App = require("./apps/main-app/App").default;
} else if (entry === "secondary-app") {
  App = require("./apps/secondary-app/App").default;
} else {
  // 默认加载主应用
  App = require("./apps/main-app/App").default;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
