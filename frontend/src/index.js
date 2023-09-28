import React from "react";

import "./app.css";

import ReactDOM from "react-dom";
import { Provider } from "react-redux"; // to provide Redux store
import { BrowserRouter } from "react-router-dom"; // for routing
import { ModalProvider, Modal } from "./context/Modal";
import App from "./App";

import configureStore from "./store"; // createStore w/ rootReducer, preloadedState, enhancer
import { restoreCSRF, csrfFetch } from "./store/csrf";
import * as sessionActions from "./store/session";

const store = configureStore(); // create configured store

if (process.env.NODE_ENV !== "production") { // when in dev
  restoreCSRF(); // call restoreCSRF

  window.csrfFetch = csrfFetch; // attach custom csrfFetch to window
  window.store = store; // access store + expose it to window
  window.sessionActions = sessionActions; // attach session actions to window
}

// Wrap App + Modal in: BrowserRouter; Redux store Provider; ModalProvider
// Render the Modal comp after App comp,
// to layer all Modal content as HTML eles
// on top of all other HTML eles
function Root() {
  return (
    <ModalProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Modal />
        </BrowserRouter>
      </Provider>
    </ModalProvider>
  );
}

// render the Root
ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);
