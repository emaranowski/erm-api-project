import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getSingleGroupThunk } from '../../store/groups';

import OpenModalButtonJoinGroup from '../../components/OpenModalButtonJoinGroup';
import JoinGroupModal from '../../components/JoinGroupModal';

import './GroupDetails.css';

export default function GroupDetails() {
  const { groupId } = useParams();

  const groupsStateArr = Object.values(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr

  const groupsStateKeys = Object.keys(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr // 0: allGroups, 1: singleGroup

  // console.log(`*** groupsStateArr is: ***`, groupsStateArr)
  // console.log(`*** groupsStateKeys is: ***`, groupsStateKeys)
  // console.log(`*** allGroups is: ***`, allGroups)
  // console.log(`*** allGroupsArr is: ***`, allGroupsArr)

  const singleGroup = groupsStateArr[1]; // obj
  // const singleGroupArr = Object.values(singleGroup)

  console.log(`*** singleGroup is: ***`, singleGroup)
  // console.log(`*** singleGroupArr is: ***`, singleGroupArr)

  const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {});

  console.log(`*** group is: ***`, group)

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  return (
    <>
      <div>
        ⬅ <Link to='/groups'>Groups</Link>
      </div>

      <div className='group-detail-card'>
        <div className='group-detail-img'>
          [ image ]
        </div>
        <div className='group-detail-info'>
          <div className='group-info-header'>
            {group.name}
          </div>
          <div className='group-detail-location'>
            {group.city}, {group.state}
          </div>
          <div className='group-detail-events-privacy'>
            # events · {group.private ? <span>private</span> : <span>public</span>}
          </div>
          <div className='group-detail-organized-by'>
            Organized by {group.organizerId}
          </div>

          <div id="join-group-button-div">
            <OpenModalButtonJoinGroup
              buttonText="Join this group"
              modalComponent={<JoinGroupModal />}
            />
          </div>
        </div>
      </div>

      <div className='group-info-box'>

        <div className='group-info-header'>Organizer</div>
        <div className='group-organizer-name'>Organizer Name {group.organizerId}</div>

        <div className='group-info-header'>What we're about</div>
        <div className='group-info-text'>
          Donec venenatis elit a pretium vehicula. Sed et nunc a urna pulvinar pretium. Aenean iaculis sapien aliquam ligula consectetur, vel lobortis lacus egestas. Cras eleifend non quam et rutrum. Duis sed bibendum erat, ac semper turpis. In hac habitasse platea dictumst. Donec feugiat arcu vel nibh fermentum feugiat. Integer tristique ligula vel mattis interdum. Morbi tempus velit at lacinia dictum. Etiam vitae varius libero.
        </div>

        <div className='group-info-header'>Upcoming Events (#)</div>

        <div className='group-info-header'>Past Events (#)</div>

        {/* <Link to={`/events/:eventId`}>
          <div className='event-card'>
            <div className='event-card-top'>
              <div className='event-img'>
                [ image ]
              </div>
              <div className='event-info'>
                <div className='event-date-time'>
                  {event.date} · {event.time}
                </div>
                <div className='event-name'>
                  {event.name}
                </div>
                <div className='event-location'>
                  {event.city}, {event.state}
                </div>
              </div>
            </div>
            <div className='event-card-bottom'>
              <div className='event-text'>
                {event.about}
              </div>
            </div>
          </div>
        </Link> */}

      </div>
    </>
  )
}
