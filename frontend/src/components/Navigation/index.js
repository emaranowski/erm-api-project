import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import ProfileButton from './ProfileButton';
import './Navigation.css';

export default function Navigation({ isLoaded }) {
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

        <span id="nav-btns">
          {sessionUser ? (
            <>
              <NavLink exact to="/groups/new" style={{ textDecoration: 'none' }}>
                <span className='nav-grey-link'>
                  Start a new group
                </span>
              </NavLink>
            </>
          ) : (<></>)
          }

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
              <span id='nav-login-btn'>
                <OpenModalButton
                  buttonText="Log in"
                  modalComponent={<LoginFormModal />}
                />
              </span>
              <span id='nav-signup-btn'>
                <OpenModalButton
                  buttonText="Sign up"
                  modalComponent={<SignupFormModal />}
                />
              </span>
            </>
          )}
        </span>
      </nav>
    </>
  )
};
