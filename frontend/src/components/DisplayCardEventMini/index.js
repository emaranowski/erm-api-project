import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleEventThunk } from '../../store/events';
import './DisplayCardEventMini.css';

export default function DisplayCardEventMini({ event }) {
  const dispatch = useDispatch();
  const eventId = event.id;
  const singleEvent = useSelector(state => state.events.singleEvent);

  let eventDescription;
  if (singleEvent.id !== undefined && singleEvent.id !== null) {
    eventDescription = singleEvent.description;
  }

  const startDateTime = event.startDate; // string
  const startDateTimeArr = startDateTime.split('');
  const startDateArr = startDateTimeArr.slice(0, 10);
  const startTimeArr = startDateTimeArr.slice(11, 16);
  const startDateStr = startDateArr.join('');
  const startTimeStr = startTimeArr.join('');

  useEffect(() => {
    dispatch(getSingleEventThunk(eventId));
  }, []);

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
