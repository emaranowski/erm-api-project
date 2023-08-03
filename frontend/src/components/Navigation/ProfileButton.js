import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import * as sessionActions from '../../store/session';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';

function ProfileButton({ user }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    // change showMenu to false only if target of click event
    // does NOT contain the HTML element of the dropdown menu
    // (ref={ulRef} is attached to dropdown menu JSX ele)
    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const viewGroups = (e) => {
    e.preventDefault();
    closeMenu();
    history.push(`/groups`);
  };

  const viewEvents = (e) => {
    e.preventDefault();
    closeMenu();
    history.push(`/events`);
  };

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    history.push(`/`);
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      {/* <div className="dropdown-box"> */}
      <button
        id="dropdown-user-button"
        onClick={openMenu}
      >
        <i className="fas fa-user-circle" />
      </button>

      <div className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <div id="dropdown-user-hello">Hello, {user.firstName}</div>
            <div className="dropdown-user-info">• {user.username}</div>
            <div className="dropdown-user-info">• {user.firstName} {user.lastName}</div>
            <div className="dropdown-user-info">• {user.email}</div>
            <div>
              <button onClick={viewGroups} className="dropdown-button">
                View groups
              </button>
            </div>
            <div>
              <button onClick={viewEvents} className="dropdown-button">
                View events
              </button>
            </div>
            <div>
              <button onClick={logout} className="dropdown-button">
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <li>
              <OpenModalButton
                buttonText="Log In"
                onButtonClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </li>
            <li>
              <OpenModalButton
                buttonText="Sign Up"
                onButtonClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
            </li>
          </>
        )}
      </div>

      {/* </div> */}


    </>
  );
}

export default ProfileButton;












// BEFORE REVAMP EDITS July 30 2023

// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch } from 'react-redux';
// import * as sessionActions from '../../store/session';
// import OpenModalButton from '../OpenModalButton';
// import LoginFormModal from '../LoginFormModal';
// import SignupFormModal from '../SignupFormModal';

// function ProfileButton({ user }) {
//   const dispatch = useDispatch();
//   const [showMenu, setShowMenu] = useState(false);
//   const ulRef = useRef();

//   const openMenu = () => {
//     if (showMenu) return;
//     setShowMenu(true);
//   };

//   useEffect(() => {
//     if (!showMenu) return;

//     // change showMenu to false only if target of click event
//     // does NOT contain the HTML element of the dropdown menu
//     // (ref={ulRef} is attached to dropdown menu JSX ele)
//     const closeMenu = (e) => {
//       if (!ulRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener('click', closeMenu);

//     return () => document.removeEventListener("click", closeMenu);
//   }, [showMenu]);

//   const closeMenu = () => setShowMenu(false);

//   const logout = (e) => {
//     e.preventDefault();
//     dispatch(sessionActions.logout());
//     closeMenu();
//   };

//   const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

//   return (
//     <>
//       <button onClick={openMenu}>
//         <i className="fas fa-user-circle" />
//       </button>
//       <ul className={ulClassName} ref={ulRef}>
//         {user ? (
//           <>
//             <li>{user.username}</li>
//             <li>{user.firstName} {user.lastName}</li>
//             <li>{user.email}</li>
//             <li>
//               <button onClick={logout}>Log Out</button>
//             </li>
//           </>
//         ) : (
//           <>
//             <li>
//               <OpenModalButton
//                 buttonText="Log In"
//                 onButtonClick={closeMenu}
//                 modalComponent={<LoginFormModal />}
//               />
//             </li>
//             <li>
//               <OpenModalButton
//                 buttonText="Sign Up"
//                 onButtonClick={closeMenu}
//                 modalComponent={<SignupFormModal />}
//               />
//             </li>
//           </>
//         )}
//       </ul>
//     </>
//   );
// }

// export default ProfileButton;

















/*
<div style={{ color: "#00798a", fontSize: "18px" }}>
    <i className="fa-regular fa-face-smile"></i>
</div>
*/

// ORIG

// import React, { useState } from "react";
// import { useDispatch } from 'react-redux';
// import * as sessionActions from '../../store/session';

// function ProfileButton({ user }) {
//     const dispatch = useDispatch();

//     const logout = (e) => {
//         e.preventDefault();
//         dispatch(sessionActions.logout());
//     };

//     const ulClassName = "profile-dropdown";

//     return (
//         <>
//             <button>
//                 <i className="fas fa-user-circle" />
//             </button>
//             <ul className="profile-dropdown">
//                 <li>{user.username}</li>
//                 <li>{user.firstName} {user.lastName}</li>
//                 <li>{user.email}</li>
//                 <li>
//                     <button onClick={logout}>Log Out</button>
//                 </li>
//             </ul>
//         </>
//     );
// }

// export default ProfileButton;
