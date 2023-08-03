import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAllGroupsThunk } from '../../store/groups';

import DisplayCard from '../DisplayCard';

import './DisplayAll.css';

export default function DisplayAll({ displayType }) {

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


  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllGroupsThunk());
  }, [dispatch]);

  return (
    <>
      <div className='all-groups-events-box'>

        <div className='centering-box'>

          {displayType === 'Groups' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <Link to='/events'>
                  <span className='non-active-event-group-header event-group-header-events'>
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

          {displayType === 'Events' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <Link to='/groups'>
                  <span className='non-active-event-group-header event-group-header-events'>
                    Groups
                  </span>
                </Link>
                <span className='active-event-group-header'>
                  Events
                </span>
              </div>
              <div className='events-groups-subhead'>
                Events on MeetBuds
              </div>
            </div>
            : null
          }

          {allGroupsArr.map((group) => (
            <div key={group.id}>
              <DisplayCard group={group} />
            </div>
          ))}

        </div>

      </div>

    </>
  )
}
