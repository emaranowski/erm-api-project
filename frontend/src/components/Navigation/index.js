import React from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton';
import OpenModalButtonLogin from '../OpenModalButtonLogin';
import OpenModalButtonSignup from '../OpenModalButtonSignup';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);


  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
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
          <button id="nav-language-button" className='nav-button'>
            English
          </button>

          {sessionUser ? (
            <>
              <button onClick={logout} id="nav-log-out-button">
                Log Out
              </button>
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

          {/* <button id="nav-log-in-button" className='nav-button'>
            Log in
          </button>

          <button id="nav-sign-up-button" className='nav-button'>
            Sign up
          </button> */}

          {/* <span>
            {isLoaded && (<ProfileButton user={sessionUser} />)}
          </span> */}
        </span>
      </nav>
    </>
  );
}

export default Navigation;









// BEFORE REVAMP EDITS July 30 2023

// import React from 'react';
// import { NavLink, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import ProfileButton from './ProfileButton';
// import './Navigation.css';

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector(state => state.session.user);

//   return (
//     <>
//       <nav>
//         <NavLink exact to="/">
//           <span id='nav-logo'>
//             MeetBuds
//           </span>
//         </NavLink>

//         <span>
//           {isLoaded && (<ProfileButton user={sessionUser} />)}
//         </span>
//       </nav>
//     </>
//   );
// }

// export default Navigation;


















// ALMOST ORIG

// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import ProfileButton from './ProfileButton';
// import './Navigation.css';

// function Navigation({ isLoaded }) {
//   const sessionUser = useSelector(state => state.session.user);

//   return (
//     <>
//       <nav>
//         <div>

//         </div>

//         <ul>
//           <li>
//             <NavLink exact to="/">Home</NavLink>
//           </li>
//           {isLoaded && (
//             <li>
//               <ProfileButton user={sessionUser} />
//             </li>
//           )}
//         </ul>
//       </nav>
//     </>
//   );
// }

// export default Navigation;
