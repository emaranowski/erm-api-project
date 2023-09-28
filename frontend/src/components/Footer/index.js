import './Footer.css';

function Footer() {

  return (
    <>
      <div id="footer">

        <div id="create-group-box">
          <span id="create-group-text">
            Create your own MeetBuds group.
          </span>
          <button id="get-started-button">
            Get Started
          </button>
        </div>

        <div id="footer-links-box">
          <div id="footer-links-col-1">
            <div className="footer-links-col-header">
              Your Account
            </div>
            <div className='footer-link'>Sign Up</div>
            <div className='footer-link'>Log In</div>
            {/* <div className='footer-link'>Help</div> */}
            {/* <div className='footer-link'>Become an Affiliate</div> */}
          </div>
          <div id="footer-links-col-2">
            <div className="footer-links-col-header">
              Discover
            </div>
            <div className='footer-link'>Groups</div>
            <div className='footer-link'>Events</div>
            {/* <div className='footer-link'>Calendar</div> */}
            {/* <div className='footer-link'>Topics</div> */}
            {/* <div className='footer-link'>Cities</div> */}
            {/* <div className='footer-link'>Online Events</div> */}
            {/* <div className='footer-link'>Local Guides</div> */}
            {/* <div className='footer-link'>Make Friends</div> */}
          </div>
          <div id="footer-links-col-3">
            <div className="footer-links-col-header">
              MeetBuds
            </div>
            <div className='footer-link'>Home</div>
            {/* <div className='footer-link'>About</div> */}
            {/* <div className='footer-link'>Blog</div> */}
            {/* <div className='footer-link'>Meetup Pro</div> */}
            {/* <div className='footer-link'>Careers</div> */}
            {/* <div className='footer-link'>Apps</div> */}
            {/* <div className='footer-link'>Podcast</div> */}
          </div>
        </div>

        <div id="follow-us-box">
          <div id="follow-us-header">
            Follow Us
          </div>

          <div id="follow-us-cols">
            <span id="follow-us-col-1">
              <span className="follow-us-icon">
                fb
              </span>
              <span className="follow-us-icon">
                tw
              </span>
              <span className="follow-us-icon">
                yt
              </span>
              <span className="follow-us-icon">
                ig
              </span>
              <span className="follow-us-icon">
                tk
              </span>
            </span>

            <span id="follow-us-col-2">
              <button className="follow-us-button">
                Google Play
              </button>
              <button className="follow-us-button">
                App Store
              </button>
            </span>
          </div>
        </div>


        <div id="copyright-terms-box">
          <span id='main-copyright-terms-link'>
            @ 2023 MeetBuds
          </span>
          <span className='copyright-terms-link'>
            Terms of Service
          </span>
          <span className='copyright-terms-link'>
            Privacy Policy
          </span>
          <span className='copyright-terms-link'>
            Cookie Policy
          </span>
          <span className='copyright-terms-link'>
            Help
          </span>
        </div>
      </div>
    </>
  );
}

export default Footer;
