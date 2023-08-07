import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleEventThunk } from '../../store/events';
import './DisplayCardEvent.css';

export default function DisplayCardEvent({ event }) {
  const dispatch = useDispatch();
  const eventId = event.id;
  const singleEvent = useSelector(state => state.events.singleEvent);

  const [isLoaded, setIsLoaded] = useState(false);
  const [singleEventState, setSingleEventState] = useState();

  const startDateTime = event.startDate;
  const startDateTimeArr = startDateTime.split('');
  const startDateArr = startDateTimeArr.slice(0, 10);
  const startTimeArr = startDateTimeArr.slice(11, 16);
  const startDateStr = startDateArr.join('');
  const startTimeStr = startTimeArr.join('');

  useEffect(() => {
    const fetchEvents = async () => {
      const event = await dispatch(getSingleEventThunk(eventId))
      setIsLoaded(true);
      setSingleEventState(event);
    }
    fetchEvents();
  }, [dispatch, eventId]);

  useEffect(() => {
  }, [eventId])

  useEffect(() => {
  }, [singleEvent])

  return (
    <>
      {isLoaded && (
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
                  {singleEventState?.id ? <span>{singleEventState.description}</span> : null}
                </div>
              </div>

            </div>
          </Link>
        </>
      )}
    </>
  )
};
