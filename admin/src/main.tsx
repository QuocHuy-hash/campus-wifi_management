import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import App from "./App";
import { initializeAxios } from "@/config/axios";
import "./index.css";

initializeAxios();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
