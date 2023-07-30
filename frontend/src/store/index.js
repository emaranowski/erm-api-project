import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";

const rootReducer = combineReducers({
  session: sessionReducer,
});

let enhancer;

if (process.env.NODE_ENV === "production") { // in prod: enhancer applies only thunk midware
  enhancer = applyMiddleware(thunk);
} else { // in dev: enhancer applies thunk + logger + Redux devtools compose midware
  const logger = require("redux-logger").default; // logger var using def exp of redux-logger
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Redux dev tools compose enhancer
  // use 'or' || to keep the Redux's original compose as a fallback
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => { // preloadedState is optional
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
