import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";

import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import GroupsAll from "./components/GroupsAll";
// import GroupForm from "./components/GroupForm";
import GroupFormCreate from "./components/GroupFormCreate";
import GroupFormUpdate from "./components/GroupFormUpdate";
import GroupDetails from "./components/GroupDetails";
import Footer from "./components/Footer";

import './app.css';
import './group-or-event-form.css';

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

        <Route exact path='/groups'>
          <GroupsAll />
        </Route>

        <Route exact path='/groups/new'>
          <GroupFormCreate />
        </Route>

        <Route exact path='/groups/:groupId/update'>
          <GroupFormUpdate />
        </Route>

        <Route exact path='/groups/:groupId'>
          <GroupDetails />
        </Route>

        {/* <Route exact path='/:groupId/images'>

        </Route> */}

        <Route exact path=''>

        </Route>

        <Route>
          <h1>Route does not exist</h1>
        </Route>

      </Switch >}
      <Footer />
    </>
  );
}

export default App;
