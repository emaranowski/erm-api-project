import React from 'react';
import './HomePage.css';

function HomePage({ isLoaded }) {

  return (
    <>

      <div id="search-bar-container">
        <i id="search-bar-icon" className="fas fa-search"></i>
        <input id="search-bar-input" placeholder="Search events"></input>
      </div>

      <div id="home-banner">
        <div>The people platform—<br></br>Where interests become<br></br>friendships</div>
        <button id="join-button">Join MeetBuds</button>
      </div>


      <div id="homepage-content-box">



        <div className="events-box">

          <div className='events-header-box'>
            <span className="homepage-header">
              Events near <span id="location-link">Portland, OR ⤵</span> happening next weekend
            </span>
            <span className="small-link-bold">
              See all events
            </span>
          </div>

          <div className='event-cards-box'>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Puppy Playdate
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Read in The Park!
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Queer Movement Collective
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Pickup Volleyball
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>
          </div>

        </div>





        <div className="events-box">

          <div className='events-header-box'>
            <span className="homepage-header">
              Upcoming online events
            </span>
            <span className="small-link-bold">
              See all events
            </span>
          </div>

          <div className='event-cards-box'>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                a/A Devs Anonymous
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Monday Night Sewing
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Pack Like a Pro: Travel Tips
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>

            <span className='event-card'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-title'>
                Entrepreneurship and Leadership Networking
              </div>
              <div className="event-hosted-by">
                Hosted by: [ group name ]
              </div>
              <div className='event-date-time'>
                🗒️ [ date & time ]
              </div>
              <div className='event-attendees-price'>
                <div className='event-attendees'>
                  ✓ # going
                </div>
                <div className='event-price'>
                  $ Free
                </div>
              </div>
            </span>
          </div>

        </div>



        <div id="explore-categories-box">

          <div className="homepage-header">
            Explore top categories
          </div>

          <div id="categories-box">
            <span className='category'>
              <div className="green-icon">𖤣𖥧ᨒ</div>
              <div className='category-text'>Travel and<br></br>Outdoor</div>
            </span>
            <span className='category'>
              <div className="maroon-icon">𖠋☺</div>
              <div className='category-text'>Social<br></br>Activities</div>
            </span>
            <span className='category'>
              <div className="yellow-icon">✎ᝰ</div>
              <div className='category-text'>Hobbies and<br></br>Passions</div>
            </span>
            <span className='category'>
              <div className="blue-icon">⛷</div>
              <div className='category-text'>Sports and<br></br>Fitness</div>
            </span>
            <span className='category'>
              <div className="green-icon">⚘⚕</div>
              <div className='category-text'>Health and<br></br>Wellbeing</div>
            </span>
            <span className='category'>
              <div className="maroon-icon">⚙ϟ</div>
              <div className='category-text'>Technology</div>
            </span>
            <span className='category'>
              <div className="yellow-icon">♪♫</div>
              <div className='category-text'>Art and<br></br>Culture</div>
            </span>
            <span className='category'>
              <div className="blue-icon">⚁ 🃁</div>
              <div className='category-text'>Games</div>
            </span>
          </div>

        </div>

        <div id="how-it-works-box">

          <div className="homepage-header">
            How MeetBuds works
          </div>

          <div id="how-it-works-grid">

            <span className='how-it-works-col-1'>
              <span className='how-it-works-col-2'>
                <span className='how-it-works-icon'>
                  🔍
                </span>
              </span>
              <span className='how-it-works-col-3'>
                <span className='how-it-works-text-col'>
                  <div className='how-it-works-col-header'>
                    Discover events and groups
                  </div>
                  <div className='how-it-works-col-text'>
                    See who's hosting local events<br></br>
                    for all the things you love
                  </div>
                  <div className='small-link-bold'>
                    Search events and groups
                  </div>
                </span>
              </span>
            </span>

            <span className='how-it-works-col-1'>
              <span className='how-it-works-icon'>
                ➕
              </span>
              <span className='how-it-works-text-col'>
                <div className='how-it-works-col-header'>
                  Start a group to host events
                </div>
                <div className='how-it-works-col-text'>
                  Create your own group,<br></br>
                  and draw from a community of millions
                </div>
                <div className='small-link-bold'>
                  Start a group
                </div>
              </span>
            </span>

          </div>
        </div>

        <div id="friendships-are-made-box">

          <div className="homepage-header">
            Friendships are made on MeetBuds
          </div>
          <div className="friendships-are-made-text">
            Since 2023, members have used MeetBuds to make new friends, meet like-minded people, spend time on hobbies, and connect with locals over shared interests. Learn how.
          </div>

          <div id="friendships-are-made-articles-box">

            <span className='friendships-article-col'>
              <div className='friendships-are-made-article-img'>
                [ image ]
              </div>
              <div className='friendships-are-made-article-header'>
                I Bribed People With Brunch to Make Friends
              </div>
              <div className="friendships-card-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean egestas vitae sapien ac sodales. Sed nec enim vel sapien pretium congue. Duis id tortor rhoncus urna varius.
              </div>
              <div className='small-link-thin'>
                Ream more
              </div>
            </span>

            <span className='friendships-article-col'>
              <div className='friendships-are-made-article-img'>
                [ image ]
              </div>
              <div className='friendships-are-made-article-header'>
                How to Become Friends with Strangers on the Internet
              </div>
              <div className="friendships-card-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean egestas vitae sapien ac sodales. Sed nec enim vel sapien pretium.
              </div>
              <div className='small-link-thin'>
                Ream more
              </div>
            </span>

            <span className='friendships-article-col'>
              <div className='friendships-are-made-article-img'>
                [ image ]
              </div>
              <div className='friendships-are-made-article-header'>
                You Probably Really Need More <br></br> Friends
              </div>
              <div className="friendships-card-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean egestas vitae sapien ac sodales. Sed nec enim vel sapien pretium congue.
              </div>
              <div className='small-link-thin'>
                Ream more
              </div>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
