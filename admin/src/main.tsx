import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import App from "./App";
import { initializeAxios, registerUnauthorizedHandler } from "@/config/axios";
import { logout } from "@/features/auth/slices/authSlice";
import "./index.css";

initializeAxios();

// Register handler để tự động logout khi API trả về 401 Unauthorized
registerUnauthorizedHandler(() => {
  store.dispatch(logout());
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
