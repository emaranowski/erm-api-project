import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAllGroupsThunk } from '../../store/groups';
import { getAllEventsThunk } from '../../store/events';

// import DisplayCard from '../DisplayCard';
import DisplayCardGroup from '../DisplayCardGroup';
import DisplayCardEvent from '../DisplayCardEvent';

import './DisplayAll.css';


export default function DisplayAll({ displayType }) {
  const dispatch = useDispatch();

  const groupsStateArr = Object.values(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr

  const groupsStateKeys = Object.keys(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr // 0: allGroups, 1: singleGroup

  // const groups = groupsState.allGroups;

  const allGroups = groupsStateArr[0];
  const allGroupsArr = Object.values(allGroups)

  // console.log(`*** groupsStateArr is: ***`, groupsStateArr)
  // console.log(`*** groupsStateKeys is: ***`, groupsStateKeys)
  // console.log(`*** allGroups is: ***`, allGroups)
  // console.log(`*** allGroupsArr is: ***`, allGroupsArr)
  // const allGroupsHere = useSelector(state => state.groups.allGroups ? state.groups.allGroups : {}); // {}
  // console.log(`*** allGroupsHere is: ***`, allGroupsHere)


  const state = useSelector(state => state)
  // console.log(`*** state is: ***`, state) // {session: {…}, groups: {…}, events: {…}}

  const stateEventsSlice = useSelector(state => state.events)
  // console.log(`*** stateEventsSlice is: ***`, stateEventsSlice) // {allEvents: {…}, singleEvent: {…}}

  const allEvents = useSelector(state => state.events.allEvents)
  // console.log(`*** allEvents is: ***`, allEvents) // { 1: {id: 1, ...}, 2: {id: 2, ...}, 3: {id: 3, ...} }

  const allEventsArr = Object.values(allEvents)
  // console.log(`*** allEventsArr is: ***`, allEventsArr) // [ 0: {id: 1, ...}, 1: {id: 2, ...}, 2: {id: 3, ...} ]

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
                Groups on MeetBuds
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
                Events on MeetBuds
              </div>
            </div>
            : null
          }

          {displayType === 'Events' ?
            allEventsArr.map((event) => (
              <div key={event.id}>
                {/* {console.log(`*** event is: ***`, event)} */}
                <DisplayCardEvent event={event} />
              </div>
            ))
            : null
          }


        </div>
      </div>
    </>
  )
}
