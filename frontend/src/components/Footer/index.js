import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import OpenModalButton from '../OpenModalButton';
import SignupFormModal from '../SignupFormModal';
import LoginFormModal from '../LoginFormModal';
import * as sessionActions from '../../store/session';
import './Footer.css';

export default function Footer() {
  const dispatch = useDispatch();
  const history = useHistory();

  const sessionUser = useSelector(state => state.session.user);

  const goToGroupsForm = (e) => {
    e.preventDefault();
    history.push(`/groups/new`);
  };

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    history.push(`/`);
  };

  return (
    <>
      <div id="footer">

        <div id="create-group-box">
          <span id="create-group-text">
            Create your own MeetBuds group.
          </span>
          {/* <button id="get-started-button">
            Get Started
          </button> */}
          {!sessionUser ? (
            <>
              <span className='footer-get-started-btn'>
                <OpenModalButton
                  buttonText="Get Started"
                  modalComponent={<LoginFormModal />}
                />
              </span>
            </>
          ) : (
            <>
              <span className='footer-get-started-btn'>
                <button onClick={goToGroupsForm}>
                  Get Started
                </button>
              </span>
            </>
          )}
        </div>

        <div id="footer-links-box">
          <div id="footer-links-col-1">
            <div className="footer-links-col-header">
              Your Account
            </div>
            {!sessionUser ? (
              <>
                <div className='footer-signup-login-btn'>
                  <OpenModalButton
                    buttonText="Sign Up"
                    modalComponent={<SignupFormModal />}
                  />
                </div>
                <div className='footer-signup-login-btn'>
                  <OpenModalButton
                    buttonText="Log In"
                    modalComponent={<LoginFormModal />}
                  />
                </div>
              </>
            ) : (
              <>
                <div className='footer-link' onClick={logout}>
                  Log out
                </div>
              </>
            )}
          </div>
          <div id="footer-links-col-2">
            <div className="footer-links-col-header">
              Discover
            </div>
            <Link to="/groups">
              <div className='footer-link'>
                Groups
              </div>
            </Link>
            <Link to="/events">
              <div className='footer-link'>
                Events
              </div>
            </Link>
          </div>
          <div id="footer-links-col-3">
            <div className="footer-links-col-header">
              MeetBuds
            </div>
            <Link to="/">
              <div className='footer-link'>
                Home
              </div>
            </Link>
            {/* <div className='footer-link'>About</div> */}
            {/* <div className='footer-link'>Blog</div> */}
          </div>
          <div id="footer-links-col-4">
            <div className="footer-links-col-header">
              Reach the developer
            </div>
            <div id='footer-dev-name-and-links'>
              <a href="https://emaranowski.com" target="_blank" rel="noopener noreferrer">
                <span id='footer-dev-name'>Erica Maranowski</span>
              </a>
              <span id='footer-dev-icons'>
                <a href="https://www.linkedin.com/in/erica-maranowski/" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://github.com/emaranowski" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-github" id='github-icon'></i>
                </a>
              </span>
            </div>
          </div>
        </div>

        <div id="copyright-and-tech-box">
          <span className='footer-copyright-and-tech'>@ 2023 MeetBuds</span>
          <span id='footer-tech'>
            <span className='footer-copyright-and-tech'>Technologies Used:</span>
            <span className='footer-copyright-and-tech'>React</span>
            <span className='footer-copyright-and-tech'>Redux</span>
            <span className='footer-copyright-and-tech'>Sequelize</span>
            <span className='footer-copyright-and-tech'>SQL</span>
            <span className='footer-copyright-and-tech'>PostgreSQL</span>
            <span className='footer-copyright-and-tech'>JS</span>
            <span className='footer-copyright-and-tech'>HTML</span>
            <span className='footer-copyright-and-tech'>CSS</span>
          </span>
        </div>
      </div>
    </>
  );
};
