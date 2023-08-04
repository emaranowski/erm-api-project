import { Link } from 'react-router-dom';
// import { useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { getAllGroupsThunk } from '../../store/groups';

import './DisplayCardEventMini.css';

export default function DisplayCardEventMini({ event }) {

  // console.log(`*** IN DisplayCardEventMini event is: ***`, event) // {}
  // ^^ {id: 1, venueId: 1, groupId: 1, name: 'Forest Park Hike', type: 'In person', …}

  const startDateTime = event.startDate; // startDateTime is string
  const startDateTimeArr = startDateTime.split('');

  // console.log(`*** startDateTime is: ***`, startDateTime) // str
  // console.log(`*** startDateTimeArr is: ***`, startDateTimeArr) // arr

  let startDateArr = [];
  let startTimeArr = [];

  for (let i = 0; i < 10; i++) {
    startDateArr.push(startDateTimeArr[i]);
  }

  for (let i = 11; i < 16; i++) {
    startTimeArr.push(startDateTimeArr[i]);
  }

  let startDateStr = startDateArr.join('');
  let startTimeStr = startTimeArr.join('');

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
              {startDateStr} · {startTimeStr}
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
