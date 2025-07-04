import React from "react";
import ReactDOM from "react-dom/client";
import App from "~/App";
import reportWebVitals from "./reportWebVitals";
import GlobalStyles from "~/Components/GlobalStyles/index";
import theme from "./contexts/ThemeProviderMUI/ThemeProvider";
import { ThemeProvider } from "@mui/material/styles";
import { ChatProvider } from "~/contexts/OpenPopupAdminContext/OpenPopupAdminContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <React.StrictMode>
      <GlobalStyles>
        <ChatProvider>
          <App />
        </ChatProvider>
      </GlobalStyles>
    </React.StrictMode>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
