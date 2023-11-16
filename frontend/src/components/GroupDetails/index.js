import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAllGroupsThunk, getSingleGroupThunk } from '../../store/groups';
import { getAllEventsThunk } from '../../store/events';
// import { getAllUsersThunk } from '../../store/session';

import OpenModalButtonJoinGroup from '../../components/OpenModalButtonJoinGroup';
import JoinGroupModal from '../../components/JoinGroupModal';
import GroupDeleteModalButton from '../GroupDeleteModalButton';
import GroupDeleteModal from '../GroupDeleteModal';
import DisplayCardEvent from '../DisplayCardEvent';
import DisplayCardEventMini from '../DisplayCardEventMini';

import './GroupDetails.css';

export default function GroupDetails() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const { groupId } = useParams();
  const groupIdAsNum = parseInt(groupId);
  const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}
  const singleGroup = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const organizerId = singleGroup.organizerId;
  const organizer = singleGroup.Organizer;
  const allEvents = useSelector(state => state.events.allEvents);

  const groupsStateArr = Object.values(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr of objs

  const groupsStateKeys = Object.keys(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr -- i0: allGroups, i1: singleGroup

  // const singleGroup = groupsStateArr[1]; // obj
  // // const singleGroupArr = Object.values(singleGroup)

  // const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {});

  // const singleGroupImagesArr = groupsStateArr[1].GroupImages; // [ {imageObj} ]

  // const previewImagesArr = singleGroupImagesArr.filter(imageObj => {
  //   return imageObj.preview === true;
  // });
  // const previewImageURL = previewImagesArr[0].url;

  ////////////// GET PREVIEW IMAGE URL //////////////
  // const previewImageURL = useSelector(state => state.groups.allGroups[groupId].previewImage);
  let previewImageURL;
  let previewImages;
  if (groupImages.length) {
    previewImages = groupImages.filter(image => {
      return image.preview === true; // get all previewImages
    })
    // previewImageURL = previewImages[0].url; // orig
    previewImageURL = previewImages[previewImages.length - 1].url; // use last previewImage
  }

  ////////////// PERMISSIONS //////////////

  // To create or update an event for a group:
  // Current user must be "host" or "co-host" of the group that the event belongs to

  // const memberships = await Membership.findAll();
  // const userId = user.dataValues.id;
  // const groupId = event.Group.id;

  // const hostOrCoHost = memberships.filter(member => {
  //     return member.userId === userId &&
  //         member.groupId === groupId &&
  //         (member.status === 'host' ||
  //             member.status === 'co-host');
  // });

  ////////////// GET ORGANIZER NAME //////////////
  let organizerFirstName;
  let organizerLastName;

  if (organizer !== null && organizer !== undefined) {
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  ////////////// 'JOIN' BUTTON DISPLAY LOGIC //////////////
  // if logged out: HIDE 'JOIN' BTN
  // if logged in + created group: HIDE 'JOIN' BTN
  // if logged in + did not create group: DISPLAY 'JOIN' BTN

  let hideJoinButton = true;

  if (sessionUser === null) { // logged out
    hideJoinButton = true; // hide
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    if (sessionUser.id !== organizerId) { // did not create group
      hideJoinButton = false; // display
    }
  }

  ////////////// ADMIN BUTTONS DISPLAY LOGIC: 'Create Event', 'Update', 'Delete' //////////////
  // if logged out: HIDE ADMIN BTNS
  // if logged in + created group: DISPLAY ADMIN BTNS
  // if logged in + did not create group: HIDE 'JOIN' BTN

  let hideAdminButtons = true;

  if (sessionUser === null) { // logged out
    hideAdminButtons = true; // hide
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    if (sessionUser.id === organizerId) { // created group
      hideAdminButtons = false; // display
    }
  }

  // works when logged in -- do not edit
  // // ////////////// 'JOIN' BUTTON LOGIC //////////////
  // // if user is logged in and created group, 'JOIN' BUTTON should hide
  // const currUser = useSelector(state => state.session ? state.session : {}); // {}
  // const currUserId = useSelector(state => state.session.user.id ? state.session.user.id : {}); // {}

  // let hideJoinButton = true;
  // if (currUserId !== organizerId) hideJoinButton = false;

  // // // if not logged in, 'JOIN' BUTTON should hide
  // // if (!sessionUser) hideJoinButton = true;

  ///////////////// EVENTS FOR GROUP: UPCOMING, PAST, & NUMS /////////////////

  let eventsByGroupTotalNum;
  const eventsByGroupUpcoming = [];
  let eventsByGroupUpcomingNum;
  const eventsByGroupPast = [];
  let eventsByGroupPastNum;

  if (Object.values(allEvents).length) {

    // Assign num of total events (upcoming + past)
    const allEventsArr = Object.values(allEvents);
    const allEventsByGroup = allEventsArr.filter(eventObj => {
      return eventObj.groupId === groupIdAsNum
    });

    eventsByGroupTotalNum = allEventsByGroup.length; // assign

    // Order all group events (DESC)
    const startDateNumsUnordered = [];
    const allEventsByGroupDESC = [];
    if (allEventsByGroup[0] !== undefined && allEventsByGroup[0] !== null) {

      allEventsByGroup.forEach(eventObj => {
        const startDateNum = Date.parse(eventObj.startDate);
        startDateNumsUnordered.push(startDateNum);
      });

      let startDateNumsASC = startDateNumsUnordered.toSorted();
      let startDateNumsDESC = startDateNumsASC.toReversed();

      for (let i = 0; i < startDateNumsDESC.length; i++) {
        const startDateNumDESC = startDateNumsDESC[i];

        for (let j = 0; j < allEventsByGroup.length; j++) {
          const startDateNum = Date.parse(allEventsByGroup[j].startDate);

          if (startDateNum === startDateNumDESC) {
            allEventsByGroupDESC.push(allEventsByGroup[j]); // populate
          }
        }
      }
    };

    // Assign num of upcoming events
    for (let i = 0; i < allEventsByGroupDESC.length; i++) {
      const event = allEventsByGroupDESC[i];
      const currTimestamp = Date.now();
      const eventStartDate = Date.parse(event.startDate);

      if (eventStartDate > currTimestamp) { // in future
        eventsByGroupUpcoming.push(event);
      }

      eventsByGroupUpcomingNum = eventsByGroupUpcoming.length; // assign
    };

    // Assign num of past events
    for (let i = 0; i < allEventsByGroupDESC.length; i++) {
      const event = allEventsByGroupDESC[i];
      const currTimestamp = Date.now();
      const eventStartDate = Date.parse(event.startDate);

      if (eventStartDate < currTimestamp) { // in past
        eventsByGroupPast.push(event);
      }

      eventsByGroupPastNum = eventsByGroupPast.length; // assign
    };

  };

  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    dispatch(getAllGroupsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllEventsThunk());
  }, [dispatch]);

  return (
    <>
      <div className='group-detail-main-box'>

        <div className='group-detail-centering-box'>

          <div>
            ⬅ <Link to='/groups'>Groups</Link>
          </div>

          <div className='group-detail-card'>
            <div>
              {previewImageURL ?
                <img className='group-detail-img' src={previewImageURL}></img>
                : ''
              }
            </div>
            <div>
              <div className='group-detail-name'>
                {group.name}
              </div>
              <div className='group-detail-location'>
                {group.city}, {group.state}
              </div>
              <div className='group-detail-events-and-privacy'>
                {eventsByGroupTotalNum === 1 ?
                  `${eventsByGroupTotalNum} event`
                  : `${eventsByGroupTotalNum} events`
                } · {group.privacy ?
                  <span>Private group</span>
                  : <span>Public group</span>
                }
              </div>
              <div className='group-detail-organized-by'>
                Organized by: {organizerFirstName} {organizerLastName}
              </div>

              {hideJoinButton ? null :
                <div id="join-group-button-div">
                  <OpenModalButtonJoinGroup
                    buttonText="Join this group"
                    modalComponent={<JoinGroupModal />} />
                </div>
              }

              {hideAdminButtons ? null :
                <div id="admin-buttons-div">
                  <Link to={`/groups/${groupId}/events/new`}>
                    <button className='admin-button'>
                      Create event
                    </button>
                  </Link>
                  <Link to={`/groups/${groupId}/update`}>
                    <button className='admin-button'>
                      Update
                    </button>
                  </Link>
                  <GroupDeleteModalButton
                    buttonText="Delete"
                    modalComponent={<GroupDeleteModal groupId={groupId} />}
                  />
                </div>
              }

            </div >
          </div >

          <div className='group-info-box'>

            <div className='group-info-section'>
              <div className='group-info-header'>
                Organizer
              </div>
              <div className='group-organizer-name'>
                {organizerFirstName} {organizerLastName}
              </div>
            </div>

            <div className='group-info-section'>
              <div className='group-info-header'>
                What we're about
              </div>
              <div className='group-info-text'>
                {group.about}
              </div>
            </div>

            <div className='total-events-header'>
              Events ({`${eventsByGroupTotalNum}`} total)
            </div>

            {eventsByGroupUpcomingNum > 0 ?
              <>
                <div className='group-info-header'>
                  Upcoming Events ({`${eventsByGroupUpcomingNum}`})
                </div>
                <div>
                  {eventsByGroupUpcoming.map((event) => (
                    <div key={event.id}>
                      <DisplayCardEvent event={event} />
                    </div>
                  ))}
                </div>
              </>
              : null
            }

            {eventsByGroupPastNum > 0 ?
              <>
                <div className='group-info-header'>
                  Past Events ({`${eventsByGroupPastNum}`})
                </div>
                <div>
                  {eventsByGroupPast.map((event) => (
                    <div key={event.id}>
                      <DisplayCardEvent event={event} />
                    </div>
                  ))}
                </div>
              </>
              : null
            }

          </div>

        </div>

      </div>
    </>
  )
};
