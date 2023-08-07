import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalButton from '../OpenModalButton';
import OpenModalButtonLoginDemo from '../OpenModalButtonLoginDemo';
import OpenModalButtonLogin from '../OpenModalButtonLogin';
import OpenModalButtonSignup from '../OpenModalButtonSignup';
import ProfileButton from './ProfileButton';
import LoginFormModalDemo from '../LoginFormModalDemo';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const sessionUser = useSelector(state => state.session.user);

  const logout = (e) => {
    e.preventDefault();

    dispatch(sessionActions.logout());

    history.push(`/`);
  };

  return (
    <>
      <nav>
        <NavLink exact to="/">
          <span id='nav-logo'>
            MeetBuds
          </span>
        </NavLink>

        <span id="nav-buttons-box">

          {/* <button id="nav-language-button" className='nav-button'>
            English
          </button> */}

          {sessionUser ? (
            <>
              <NavLink exact to="/groups/new" style={{ textDecoration: 'none' }}>
                <span className='nav-grey-link'>
                  Start a new group
                </span>
              </NavLink>
            </>
          ) : (<></>)}

          {!sessionUser ? (
            <>
              <OpenModalButtonLoginDemo
                buttonText="Log in as Demo User"
                modalComponent={<LoginFormModalDemo />}
              />
            </>
          ) : (<></>)}

          {sessionUser ? (
            <>
              <button onClick={logout} id="nav-log-out-button">
                Log out
              </button>

              <span>
                {isLoaded && (<ProfileButton user={sessionUser} />)}
              </span>
            </>
          ) : (
            <>
              <OpenModalButtonLogin
                buttonText="Log in"
                modalComponent={<LoginFormModal />}
              />
              <OpenModalButtonSignup
                buttonText="Sign up"
                modalComponent={<SignupFormModal />}
              />
            </>
          )}

        </span>
      </nav>
    </>
  );
};

export default Navigation;
