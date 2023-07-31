import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";

import HomePage from "./components/HomePage";
import Footer from "./components/Footer";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Switch>

        <Route exact path='/'>
          <HomePage />
        </Route>

        <Route exact path=''>

        </Route>

        <Route exact path=''>

        </Route>

        <Route exact path=''>

        </Route>

        <Route exact path=''>

        </Route>

        <Route>
          <h1>Route does not exist</h1>
        </Route>

      </Switch>}
      <Footer />
    </>
  );
}

export default App;
