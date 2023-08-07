import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroupsThunk } from '../../store/groups';
import { getAllEventsThunk } from '../../store/events';
import DisplayCardGroup from '../DisplayCardGroup';
import DisplayCardEvent from '../DisplayCardEvent';
import './DisplayAll.css';

export default function DisplayAll({ displayType }) {
  const dispatch = useDispatch();

  const allGroups = useSelector((state) => (state.groups.allGroups));

  // const allGroups = groupsStateArr[0]; // {}

  console.log(`***** allGroups *****`, allGroups);

  const allGroupsArr = Object.values(allGroups)

  const allEvents = useSelector(state => state.events.allEvents)
  const allEventsArr = Object.values(allEvents)

  const startDateNumsUnordered = [];
  const allEventsArrDESC = [];
  if (allEventsArr[0] !== undefined && allEventsArr[0] !== null) {

    allEventsArr.forEach(eventObj => {
      const startDateNum = Date.parse(eventObj.startDate);
      startDateNumsUnordered.push(startDateNum);
    });

    let startDateNumsASC = startDateNumsUnordered.toSorted();
    let startDateNumsDESC = startDateNumsASC.toReversed();

    for (let i = 0; i < startDateNumsDESC.length; i++) {
      const startDateNumDESC = startDateNumsDESC[i];

      for (let j = 0; j < allEventsArr.length; j++) {
        const startDateNum = Date.parse(allEventsArr[j].startDate);
        if (startDateNum === startDateNumDESC) {
          allEventsArrDESC.push(allEventsArr[j]);
        }
      }
    }
  };

  useEffect(() => {
    dispatch(getAllGroupsThunk());
    dispatch(getAllEventsThunk());
  }, [dispatch]);

  return (
    <>
      <div className='all-groups-events-box'>
        <div className='centering-box'>

          {displayType === 'Groups' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <Link to='/events'>
                  <span className='events-groups-header-spacer non-active-event-group-header'>
                    Events
                  </span>
                </Link>
                <span className='active-event-group-header'>
                  Groups
                </span>
              </div>
              <div className='events-groups-subhead'>
                Groups in MeetBuds
              </div>
            </div>
            : null
          }
          {displayType === 'Groups' ?
            allGroupsArr.map((group) => (
              <div key={group.id}>
                <DisplayCardGroup group={group} />
              </div>
            ))
            : null
          }

          {displayType === 'Events' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <span className='events-groups-header-spacer active-event-group-header'>
                  Events
                </span>
                <Link to='/groups'>
                  <span className='non-active-event-group-header'>
                    Groups
                  </span>
                </Link>
              </div>
              <div className='events-groups-subhead'>
                Events in MeetBuds
              </div>
            </div>
            : null
          }
          {displayType === 'Events' ?
            allEventsArrDESC.map((event) => (
              <div key={event.id}>

                <DisplayCardEvent event={event} />
              </div>
            ))
            : null
          }

        </div>
      </div >
    </>
  )
}
