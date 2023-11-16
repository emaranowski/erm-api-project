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
  const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

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

  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    dispatch(getAllGroupsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllEventsThunk());
  }, [dispatch]);


  ////////////// GET ORGANIZER NAME //////////////
  const singleGroup = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const organizerId = singleGroup.organizerId;
  const organizer = singleGroup.Organizer;

  let organizerFirstName;
  let organizerLastName;
  if (organizer !== null && organizer !== undefined) {
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  ////////////// 'JOIN' BUTTON DISPLAY LOGIC //////////////
  // if not logged in: HIDE 'JOIN' btn
  // if logged in + did create group: HIDE 'JOIN' btn
  // if logged in + did not create group: DISPLAY 'JOIN' btn

  // logged in sessionUser:
  // {id: 1, firstName: 'FirstNameOne', lastName: 'LastNameOne', email: 'demo1@demo.com', username: 'DemoUser1'}

  let hideJoinButton = true;
  if (sessionUser === null) { // logged out
    hideJoinButton = true; // hide join btn
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    if (sessionUser.id !== organizerId) { // did not create group
      hideJoinButton = false; // display join btn
    }
  }

  ////////////// ADMIN BUTTONS DISPLAY LOGIC //////////////
  /////////// 'Create Event', 'Update', 'Delete' ///////////
  // if logged in + did create group: DISPLAY ADMIN BUTTONS

  let hideAdminButtons = true;
  if (sessionUser === null) { // logged out
    hideAdminButtons = true; // hide admin btns
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    if (sessionUser.id === organizerId) { // did create group
      hideAdminButtons = false; // display join btn
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







  ////////////// 'JOIN' BUTTON LOGIC //////////////
  // if user is logged in and created group, 'JOIN' BUTTON should hide
  // const currUser = useSelector(state => state.session ? state.session : {}); // {}
  // const currUserIdOrig = useSelector(state => state.session.user.id ? state.session.user.id : {}); // {}


  // let currUserId;
  // if (typeof currUserIdOrig === 'number') {
  //   currUserId = currUserIdOrig;
  // }

  // let hideJoinButton = true;

  // if (!sessionUser) {
  //   hideJoinButton = true;
  // }

  // if (sessionUser && (currUserId !== organizerId)) {
  //   hideJoinButton = false;
  // }









  ///////////////// UPCOMING EVENTS, PAST EVENTS, EVENT COUNTS /////////////////
  const allEvents = useSelector(state => state.events.allEvents);

  // let allEventsByGroup;
  let eventsByGroupTotalNum;

  let eventsByGroupUpcoming = [];
  let eventsByGroupUpcomingNum;

  let eventsByGroupPast = [];
  let eventsByGroupPastNum;

  if (Object.values(allEvents).length) {

    // all events by group
    let allEventsArr = Object.values(allEvents);
    let allEventsByGroup = allEventsArr.filter(eventObj => {
      return eventObj.groupId === groupIdAsNum
    });
    eventsByGroupTotalNum = allEventsByGroup.length;

    // all events by group DESC
    let startDateNumsUnordered = [];
    let allEventsByGroupDESC = [];
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
            allEventsByGroupDESC.push(allEventsByGroup[j]);
          }
        }
      }
    };

    // upcoming events
    for (let i = 0; i < allEventsByGroupDESC.length; i++) {
      const currEvent = allEventsByGroupDESC[i]; // obj {}

      const currTimestampNum = Date.now();
      const eventStartDateNum = Date.parse(allEventsByGroupDESC[i].startDate);

      if (eventStartDateNum > currTimestampNum) {
        eventsByGroupUpcoming.push(currEvent);
      }
      eventsByGroupUpcomingNum = eventsByGroupUpcoming.length;
    };

    // past events
    for (let i = 0; i < allEventsByGroupDESC.length; i++) {
      const currEvent = allEventsByGroupDESC[i]; // obj {}

      const currTimestampNum = Date.now();
      const eventStartDateNum = Date.parse(allEventsByGroupDESC[i].startDate);

      if (eventStartDateNum < currTimestampNum) {
        eventsByGroupPast.push(currEvent);
      }
      eventsByGroupPastNum = eventsByGroupPast.length;
    };

  };

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
}
