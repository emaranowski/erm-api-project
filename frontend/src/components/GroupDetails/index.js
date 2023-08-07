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
  const sessionUser = useSelector(state => state.session.user);
  const { groupId } = useParams();
  const groupIdAsNum = parseInt(groupId);

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

  // const singleGroup = groupsStateArr[1]; // obj
  // // const singleGroupArr = Object.values(singleGroup)

  // const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {});

  // console.log(`*** group is: ***`, group)
  // console.log(`*** singleGroup is: ***`, singleGroup) //

  // const singleGroupImagesArr = groupsStateArr[1].GroupImages; // [ {imageObj} ]
  // // console.log(`*** singleGroupImagesArr is: ***`, singleGroupImagesArr)

  // const previewImagesArr = singleGroupImagesArr.filter(imageObj => {
  //   return imageObj.preview === true;
  // });
  // const previewImageURL = previewImagesArr[0].url;

  // console.log(`*** previewImagesArr is: ***`, previewImagesArr) //
  // console.log(`*** previewImageURL is: ***`, previewImageURL) //
  // console.log(`*** singleGroup is: ***`, singleGroup)
  // console.log(`*** singleGroupArr is: ***`, singleGroupArr)


  // WORKING -- V1
  // const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  // const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  // let previewImageURL;
  // if (groupImages.length) {
  //   previewImageURL = groupImages[0].url;
  // }

  // console.log(`*** group is: ***`, group)
  // console.log(`*** groupImages is: ***`, groupImages)
  // console.log(`*** previewImageURL is: ***`, previewImageURL)

  // WORKING -- V2 -- used until 2023-08-02
  const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  let previewImageURL;
  let previewImages;
  if (groupImages.length) {
    previewImages = groupImages.filter(image => {
      return image.preview === true;
    })
    // previewImageURL = previewImages[0].url; // orig
    previewImageURL = previewImages[previewImages.length - 1].url;
  }

  // console.log(`*** group is: ***`, group)
  // console.log(`*** groupImages is: ***`, groupImages)
  // console.log(`*** previewImages is: ***`, previewImages)
  // console.log(`*** previewImageURL is: ***`, previewImageURL)

  // // new on 2023-08-02
  // const group = useSelector(state => state.groups.allGroups[groupId]);
  // const previewImageURL = useSelector(state => state.groups.allGroups[groupId].previewImage);

  // // console.log(`*** thisGroup is: ***`, thisGroup)



  // console.log(`*** typeof allEvents['1'] === 'object' ***`, typeof allEvents['1'] === 'object')

  // if (typeof allEvents['1'] === 'object') { }
  ///////////////////////////



  // let previewImageURL;
  // if (groupImages[0] !== undefined) {
  //   previewImageURL = groupImages[0].url
  // }

  // WORKING V2
  // const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  // const groupImages = group.GroupImages; // [{}]

  // let previewImage;
  // if (groupImages !== undefined) {
  //   const groupPreviewImages = groupImages.filter(image => { // [{}]
  //     return image.preview === true;
  //   })
  //   previewImage = groupPreviewImages[0];
  // }


  // const previewImage = groupImages[0];
  // const groupPreviewImages = groupImages.filter(image => { // [{}]
  //   return image.preview === true;
  // })

  // console.log(`*** group is: ***`, group)
  // console.log(`*** groupImages is: ***`, groupImages)
  // console.log(`*** groupPreviewImages is: ***`, groupPreviewImages)
  // console.log(`*** previewImage is: ***`, previewImage)


  // // Current user must be "host" or "co-host" of Group that Event belongs to
  // const memberships = await Membership.findAll();
  // const userId = user.dataValues.id;
  // const groupId = event.Group.id;

  // const hostOrCoHost = memberships.filter(member => {
  //     return member.userId === userId &&
  //         member.groupId === groupId &&
  //         (member.status === 'host' ||
  //             member.status === 'co-host');
  // });




  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    dispatch(getAllGroupsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllEventsThunk());
  }, [dispatch]);



  ////////////// ORGANIZER NAME //////////////
  const singleGroup = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const organizerId = singleGroup.organizerId;
  const organizer = singleGroup.Organizer;
  // const organizerFirstName = singleGroup.Organizer.firstName;
  // const organizerLastName = singleGroup.Organizer.lastName;
  // console.log(`*** singleGroup is: ***`, singleGroup)
  // console.log(`*** organizer is: ***`, organizer)
  // if (Object.values(organizer).length) {
  //   const organizerFirstName = singleGroup.Organizer.firstName;
  //   const organizerLastName = singleGroup.Organizer.lastName;
  // }

  let organizerFirstName;
  let organizerLastName;
  if (organizer !== null && organizer !== undefined) {
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  // console.log(`*** organizerFirstName is: ***`, organizerFirstName)
  // console.log(`*** organizerLastName is: ***`, organizerLastName)
  // const allGroups = useSelector(state => state.groups.allGroups ? state.groups.allGroups : {}); // {}
  // console.log(`*** allGroups is: ***`, allGroups)
  // useEffect(() => {
  //   dispatch(getAllUsersThunk());
  // }, [dispatch]);




  ////////////// 'JOIN' BUTTON LOGIC //////////////
  // if not logged in, 'JOIN' BUTTON should hide
  // if logged in and created group, 'JOIN' BUTTON should hide
  // if logged in and did not create group, 'JOIN' BUTTON should display

  // const sessionUser = useSelector(state => state.session.user);
  // console.log(`*** sessionUser is: ***`, sessionUser)
  // logged out: sessionUser === null
  // logged in: sessionUser === {id: 1, firstName: 'FirstNameOne', lastName: 'LastNameOne', email: 'demo1@demo.com', username: 'DemoUser1'}

  let hideJoinButton = true;
  if (sessionUser === null) { // logged out
    hideJoinButton = true;
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    const sessionUserId = sessionUser.id; // must create in block, after confirming !null && !undefined
    if (sessionUserId !== organizerId) hideJoinButton = false; // logged in + did not create group: so display 'join' btn
  }


  ////////////// 'Create Event', 'Update', 'Delete' ADMIN BUTTONS LOGIC //////////////
  // if logged in and created group, ADMIN BUTTONS should display
  let hideAdminButtons = true;
  if (sessionUser === null) { // logged out
    hideAdminButtons = true;
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    const sessionUserId = sessionUser.id; // must create in block, after confirming !null && !undefined
    if (sessionUserId === organizerId) hideAdminButtons = false; // logged in + created group: so display admin btns
  }















  // works when logged in -- do not edit
  // // ////////////// 'JOIN' BUTTON LOGIC //////////////
  // // if user is logged in and created group, 'JOIN' BUTTON should hide
  // const currUser = useSelector(state => state.session ? state.session : {}); // {}
  // const currUserId = useSelector(state => state.session.user.id ? state.session.user.id : {}); // {}
  // console.log(`*** currUser is: ***`, currUser)
  // console.log(`*** currUserId is: ***`, currUserId)

  // let hideJoinButton = true;
  // if (currUserId !== organizerId) hideJoinButton = false;

  // // // if not logged in, 'JOIN' BUTTON should hide
  // // if (!sessionUser) hideJoinButton = true;







  ////////////// 'JOIN' BUTTON LOGIC //////////////
  // if user is logged in and created group, 'JOIN' BUTTON should hide
  // const currUser = useSelector(state => state.session ? state.session : {}); // {}
  // const currUserIdOrig = useSelector(state => state.session.user.id ? state.session.user.id : {}); // {}

  // console.log(`*** currUser is: ***`, currUser)
  // console.log(`*** currUserId is: ***`, currUserId)

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
  // console.log(`**** eventsByGroupUpcoming ****`, eventsByGroupUpcoming)
  // console.log(`**** eventsByGroupUpcomingNum ****`, eventsByGroupUpcomingNum)

  // console.log(`**** eventsByGroupPast ****`, eventsByGroupPast)
  // console.log(`**** eventsByGroupPastNum ****`, eventsByGroupPastNum)


  return (
    <>
      <div className='group-detail-main-box'>

        <div className='group-detail-centering-box'>

          <div>
            ⬅ <Link to='/groups'>Groups</Link>
          </div>

          <div className='group-detail-card'>
            <div>
              {/* <div className='group-detail-img'>[ image ]</div> */}

              {previewImageURL ? <img className='group-detail-img' src={previewImageURL}></img> : ''}

              {/* <img className='group-detail-img' src={previewImageURL}></img> */}
              {/* <div className='group-detail-img'> */}
              {/* {previewImageURL} */}
              {/* </div> */}
            </div>
            <div className='group-detail-info'>
              <div className='group-info-header'>
                {group.name}
              </div>
              <div className='group-detail-location'>
                {group.city}, {group.state}
              </div>
              <div className='group-detail-events-privacy'>
                {eventsByGroupTotalNum === 1 ? `${eventsByGroupTotalNum} event` : `${eventsByGroupTotalNum} events`} · {group.privacy ? <span>Private</span> : <span>Public</span>}
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

              {/* (POST /api/groups/:groupId/events) */}

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
                  {/* <button className='admin-button'>
                Delete
              </button> */}
                  <GroupDeleteModalButton
                    buttonText="Delete"
                    modalComponent={<GroupDeleteModal groupId={groupId} />}
                  />
                </div>
              }


              {/* {sessionUser ? (
            <>
              <div id="join-group-button-div">
                <OpenModalButtonJoinGroup
                  buttonText="Join this group"
                  modalComponent={<JoinGroupModal />} />
              </div>
            </>
          ) : (
            <>
              <div>test</div>
            </>
          )} */}


              {/* {!sessionUser ? (
            <>
              <div className='how-it-works-header-link-inactive small-link-bold-inactive'>
                Start a new group
              </div>
            </>
          ) : (
            <>
              <Link to="/groups/new">
                <div className='how-it-works-header-link small-link-bold'>
                  Start a new group
                </div>
              </Link>
            </>
          )} */}

              {/*
          {!sessionUser ? (
            <>
              <Link to="/groups/new">
                <div className='how-it-works-header-link small-link-bold'>
                  Start a new group
                </div>
              </Link>
            </>
          ) : (
            <>
              <div className='how-it-works-header-link-inactive small-link-bold-inactive'>
                Start a new group
              </div>
            </>
          )} */}



            </div >
          </div >

          <div className='group-info-box'>



            <div className='group-info-header'>Organizer</div>
            <div className='group-organizer-name'>{organizerFirstName} {organizerLastName}</div>

            <div className='group-info-header'>What we're about</div>
            <div className='group-info-text'>
              {group.about}
            </div>

            <div className='total-events-header'>
              Events ({`${eventsByGroupTotalNum}`} total)
            </div>

            {eventsByGroupUpcomingNum > 0 ?
              <>
                <div className='group-info-header'>Upcoming Events ({`${eventsByGroupUpcomingNum}`})</div>
                <div>
                  {eventsByGroupUpcoming.map((event) => (
                    <div key={event.id}>
                      <DisplayCardEvent event={event} />
                    </div>
                  ))}
                </div>
              </>
              : null}

            {eventsByGroupPastNum > 0 ?
              <>
                <div className='group-info-header'>Past Events ({`${eventsByGroupPastNum}`})</div>
                <div>
                  {eventsByGroupPast.map((event) => (
                    <div key={event.id}>
                      <DisplayCardEvent event={event} />
                    </div>
                  ))}
                </div>
              </>
              : null}

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

        </div>

      </div>
    </>
  )
}
