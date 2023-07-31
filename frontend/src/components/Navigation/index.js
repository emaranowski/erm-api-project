import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <>
      <nav>
        <NavLink exact to="/">
          <span id='nav-logo'>
            MeetBuds
          </span>
        </NavLink>

        <span>
          {isLoaded && (<ProfileButton user={sessionUser} />)}
        </span>
      </nav>
    </>
  );
}

export default Navigation;


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
