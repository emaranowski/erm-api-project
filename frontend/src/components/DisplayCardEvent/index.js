import { Link } from 'react-router-dom';
// import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// import { getAllGroupsThunk } from '../../store/groups';

import './DisplayCardEvent.css';

export default function DisplayCardEvent({ event }) {

  // console.log(`*** IN DisplayCardEvent event is: ***`, event) // {}
  // ^^ {id: 1, venueId: 1, groupId: 1, name: 'Forest Park Hike', type: 'In person', …}

  const startDateTime = event.startDate; // startDateTime is string
  const startDateTimeArr = startDateTime.split('');

  // console.log(`*** startDateTime is: ***`, startDateTime) // str
  // console.log(`*** startDateTimeArr is: ***`, startDateTimeArr) // arr

  let dateArr = [];
  let timeArr = [];

  for (let i = 0; i < 10; i++) {
    dateArr.push(startDateTimeArr[i]);
  }

  for (let i = 11; i < 16; i++) {
    timeArr.push(startDateTimeArr[i]);
  }

  let dateStr = dateArr.join('');
  let timeStr = timeArr.join('');

  // console.log(`*** dateStr is: ***`, dateStr) // str
  // console.log(`*** timeStr is: ***`, timeStr) // arr

  return (
    <>

      <Link to={`/events/${event.id}`}>
        <div className='group-card'>

          {event.previewImage ? <div><img className='group-card-img' src={event.previewImage}></img></div> : ''}

          <div className='group-info'>
            <div className='event-date-time'>
              {/* [ YYY-MM-DD ] · [ time ] <br></br>
              {event.startDate} */}
              {dateStr} · {timeStr}
            </div>

            <div className='event-name'>
              {event.name}
            </div>

            <div className='group-location'>
              {event.type === 'Online' ? 'Online' : null}
              {event.type === 'In person' ? `${event.Venue.city}, ${event.Venue.state}` : null}
            </div>

            <div className='group-text'>
              {event.about}
            </div>
          </div>

        </div>
      </Link>

    </>
  )
};
