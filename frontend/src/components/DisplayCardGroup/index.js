import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './DisplayCardGroup.css';

export default function DisplayCardGroup({ group }) {
  const groupId = group.id;
  const allEvents = useSelector(state => state.events.allEvents);

  /////////////// GET NUM EVENTS ///////////////
  // if 1 event: display text is singular 'event'
  // if 0 or 2+ events: display text is plural 'events'
  let numEvents;
  if (Object.values(allEvents).length) {
    const allEventsArr = Object.values(allEvents);
    const eventsForGroup = allEventsArr.filter(eventObj => {
      return eventObj.groupId === groupId;
    });
    numEvents = eventsForGroup.length;
  };

  return (
    <>
      <Link to={`/groups/${group.id}`}>
        <div className='group-card'>

          {group.previewImage ?
            <div>
              <img className='group-card-img' src={group.previewImage}></img>
            </div>
            : null
          }

          <div>
            <div className='group-name'>
              {group.name}
            </div>

            <div className='group-location'>
              {group.city}, {group.state}
            </div>

            <div className='group-about'>
              {group.about}
            </div>

            <div className='group-events-and-privacy'>
              {numEvents === 1 ?
                `${numEvents} event` :
                `${numEvents} events`
              } · {
                group.privacy ?
                  <span>Private group</span> :
                  <span>Public group</span>
              }
            </div>
          </div>

        </div>
      </Link>
    </>
  )
};
