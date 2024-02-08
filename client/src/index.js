import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import translationEN from "./locales/en/translation.json";
import translationIT from "./locales/it/translation.json";
import i18next from 'i18next';
import { I18nextProvider } from "react-i18next";

i18next.init({
  interpolation: {escapeValue: false},
  lng: "en",
  resources: {
    en:{translation: translationEN},
    it:{translation: translationIT}
  }
})

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

reportWebVitals();