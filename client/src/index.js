import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import translationEN from "./locales/en/translation.json";
import translationIT from "./locales/it/translation.json";
import i18next from 'i18next';
import { I18nextProvider } from "react-i18next";

console.log('🎯 Starting React app initialization...');

try {
  console.log('📚 Initializing i18next...');
  i18next.init({
    interpolation: {escapeValue: false},
    lng: "en",
    resources: {
      en:{translation: translationEN},
      it:{translation: translationIT}
    }
  });
  console.log('✅ i18next initialized successfully');
} catch (error) {
  console.error('❌ i18next initialization failed:', error);
}

console.log('🔍 Looking for root element...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found');
}

console.log('🏗️ Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('🚀 Rendering App component...');
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

console.log('✅ React app render initiated');
reportWebVitals();