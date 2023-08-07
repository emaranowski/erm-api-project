import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleEventThunk } from '../../store/events';
import './DisplayCardEvent.css';

export default function DisplayCardEvent({ event }) {
  const dispatch = useDispatch();
  const eventId = event.id;
  const singleEvent = useSelector(state => state.events.singleEvent);

  let eventDescription;
  if (singleEvent.id !== undefined && singleEvent.id !== null) {
    eventDescription = singleEvent.description;
  }

  // console.log(`*** IN DisplayCardEvent event is: ***`, event) // {}
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

  useEffect(() => {
    dispatch(getSingleEventThunk(eventId));
  }, [])

  return (
    <>
      <Link to={`/events/${event.id}`}>
        <div className='event-card-mini-card'>

          <div className='display-event-mini-row-1'>
            {event.previewImage ?
              <div>
                <img className='event-card-mini-img' src={event.previewImage}></img>
              </div>
              : null}

            <div className='event-card-mini-info'>
              <div className='event-date-time'>
                {/* [ YYY-MM-DD ] · [ time ] <br></br>
              {event.startDate} */}
                {startDateStr} · {startTimeStr}
              </div>

              <div className='event-card-mini-name'>
                {event.name}
              </div>

              <div className='event-card-mini-location'>
                {event.type === 'Online' ? 'Online' : null}
                {event.type === 'In person' ? `${event.Venue.city}, ${event.Venue.state}` : null}
              </div>
            </div>
          </div>

          <div className='display-event-mini-row-2'>
            <div className='event-card-mini-text'>
              {eventDescription}
            </div>
          </div>

        </div>
      </Link>
    </>
  )
};
