import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAllEventsThunk, getSingleEventThunk } from '../../store/events';
import { getAllGroupsThunk, getSingleGroupThunk } from '../../store/groups';

// import OpenModalButtonJoinEvent from '../../components/OpenModalButtonJoinEvent';
// import JoinEventModal from '../../components/JoinEventModal';
import EventDeleteModalButton from '../EventDeleteModalButton';
import EventDeleteModal from '../EventDeleteModal';

import './EventDetails.css';

export default function EventDetails() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const { eventId } = useParams();

  // const eventsStateArr = Object.values(
  //   useSelector((state) => (state.events ? state.events : {}))
  // ); // ret arr

  // const eventsStateKeys = Object.keys(
  //   useSelector((state) => (state.events ? state.events : {}))
  // ); // ret arr // 0: allEvents, 1: singleEvent


  // WORKING -- V2 -- used until 2023-08-02
  const event = useSelector(state => state.events.singleEvent ? state.events.singleEvent : {}); // {}
  const eventImages = useSelector(state => state.events.singleEvent.EventImages ? state.events.singleEvent.EventImages : []); // {}


  let previewImageURL;
  let previewImages;
  if (eventImages.length) {
    previewImages = eventImages.filter(image => {
      return image.preview === true;
    })
    // previewImageURL = previewImages[0].url; // orig
    previewImageURL = previewImages[previewImages.length - 1].url;
  }


  ////////////// GROUP ID //////////////

  let groupId;
  if (event.Group !== undefined) {
    groupId = event.groupId;
  };

  // const group = useSelector(state => state)

  // useEffect(() => {
  //   dispatch(getSingleEventThunk(eventId));
  // }, [dispatch, eventId]);
  // useEffect(() => {
  //   dispatch(getAllEventsThunk());
  // }, [dispatch]);
  // useEffect(() => {
  //   dispatch(getSingleGroupThunk(groupId));
  // }, [dispatch, groupId]);
  // useEffect(() => {
  //   dispatch(getAllGroupsThunk());
  // }, [dispatch]);

  useEffect(() => {
    dispatch(getSingleEventThunk(eventId));
    dispatch(getAllEventsThunk());
    dispatch(getSingleGroupThunk(groupId));
    dispatch(getAllGroupsThunk());
  }, [dispatch, eventId, groupId]);

  // useEffect(() => {
  //   const getAllData = async () => {
  //     await Promise.all([
  //       dispatch(getSingleEventThunk(eventId)),
  //       dispatch(getAllEventsThunk()),
  //       dispatch(getSingleGroupThunk(groupId)),
  //       dispatch(getAllGroupsThunk()),
  //     ])
  //   }
  //   getAllData();
  // }, [dispatch, eventId, groupId])


  ////////////// HOST NAME (GROUP ORGANIZER NAME) //////////////
  const singleGroup = useSelector(state => state.groups.singleGroup);
  let organizerId;
  let organizerFirstName;
  let organizerLastName;
  if (singleGroup.id !== undefined) {
    organizerId = singleGroup.organizerId;
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  // ////////////// GROUP IMAGE //////////////
  // const allGroups = useSelector(state => state.groups.allGroups ? state.groups.allGroups : {});
  // let groupPreviewImageURL;
  // if (allGroups[groupId] !== undefined) {
  //   groupPreviewImageURL = allGroups[groupId].previewImage;
  // }

  ////////////// GROUP IMAGE //////////////
  const allGroups = useSelector(state => state.groups.allGroups);
  let groupPreviewImageURL;
  if (Object.values(allGroups).length) {
    if (allGroups[groupId] !== undefined) {
      groupPreviewImageURL = allGroups[groupId].previewImage;
    }
  }

  ////////////// GROUP NAME //////////////
  let groupName;
  if (event.Group !== undefined) {
    groupName = event.Group.name;
  }

  ////////////// GROUP VISIBILITY //////////////
  let groupVisbility;
  if (event.Group !== undefined) {
    if (event.Group.privacy === true) groupVisbility = 'Private';
    if (event.Group.privacy === false) groupVisbility = 'Public';
  }

  ////////////// START DATE + TIME //////////////
  let startDateArr = [];
  let startTimeArr = [];

  if (event.id !== undefined) {
    const startDateTime = event.startDate; // startDateTime is string
    const startDateTimeArr = startDateTime.split('');

    for (let i = 0; i < 10; i++) {
      startDateArr.push(startDateTimeArr[i]);
    }

    for (let i = 11; i < 16; i++) {
      startTimeArr.push(startDateTimeArr[i]);
    }
  }

  let startDateStr = startDateArr.join('');
  let startTimeStr = startTimeArr.join('');

  ////////////// END DATE + TIME //////////////
  let endDateArr = [];
  let endTimeArr = [];

  if (event.id !== undefined) {
    const endDateTime = event.endDate; // endDateTime is string
    const endDateTimeArr = endDateTime.split('');

    for (let i = 0; i < 10; i++) {
      endDateArr.push(endDateTimeArr[i]);
    }

    for (let i = 11; i < 16; i++) {
      endTimeArr.push(endDateTimeArr[i]);
    }
  }

  let endDateStr = endDateArr.join('');
  let endTimeStr = endTimeArr.join('');

  ////////////// PRICE //////////////

  let price;
  if (event.price !== undefined) {
    price = event.price;
  }
  if (price === 0) price = 'FREE';

  ////////////// ONLINE / IN PERSON //////////////

  let onlineOrInPerson;
  if (event.type !== undefined) {
    onlineOrInPerson = event.type;
  }

  ////////////// DESCRIPTION //////////////

  let desc;
  if (event.description !== undefined) {
    desc = event.description;
  }



  ////////////// 'JOIN' BUTTON LOGIC //////////////
  // if not logged in, 'JOIN' BUTTON should hide
  // if logged in and created event, 'JOIN' BUTTON should hide
  // if logged in and did not create event, 'JOIN' BUTTON should display

  // let hideJoinButton = true;
  // if (sessionUser === null) { // logged out
  //   hideJoinButton = true;
  // } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
  //   const sessionUserId = sessionUser.id; // must create in block, after confirming !null && !undefined
  //   if (sessionUserId !== organizerId) hideJoinButton = false; // logged in + did not create event: so display 'join' btn
  // }

  ////////////// 'Create Event', 'Update', 'Delete' ADMIN BUTTONS LOGIC //////////////
  // if logged in and created event, ADMIN BUTTONS should display
  let hideAdminButtons = true;
  if (sessionUser === null) { // logged out
    hideAdminButtons = true;
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    const sessionUserId = sessionUser.id; // must create in block, after confirming !null && !undefined
    if (sessionUserId === organizerId) hideAdminButtons = false; // logged in + created event: so display admin btns
  }

  return (
    <>
      <div className='event-detail-main-box'>

        <div className='event-detail-centering-child'>

          {/* HEADER */}

          <div className='event-detail-header'>
            <div className='event-breadcrumb-link'>
              ⬅ <Link to='/events'>Events</Link>
            </div>
            <div className='event-info-header'>
              {event.name}
            </div>
            <div className='event-hosted-by'>
              Hosted by: {organizerFirstName} {organizerLastName}
            </div>
          </div>

          <div className='event-detail-box'>

            {/* UPPER GRAPHIC ROW */}

            <div className='event-detail-upper-graphic-row'>
              <div className='event-img-col'>
                {previewImageURL ? <img className='event-detail-img' src={previewImageURL}></img> : ''}
              </div>

              <div className='event-group-date-price-location-col'>

                <Link to={`/groups/${groupId}`}>
                  <div className='event-group-mini-card-row'>
                    <div className='event-group-mini-image-col'>
                      {groupPreviewImageURL ? <img className='event-detail-group-img' src={groupPreviewImageURL}></img> : ''}
                    </div>
                    <div className='event-group-mini-name-visibility-col'>
                      <div className='event-group-mini-name-row'>
                        {groupName}
                      </div>
                      <div className='event-group-mini-visibility-row'>
                        {groupVisbility}
                      </div>
                    </div>
                  </div>
                </Link>

                <div className='event-date-price-location-row'>

                  <div className='event-detail-row event-detail-row-spacer'>
                    <div className='clock-icon-wrapper'>
                      <div className='icon-col'>
                        🕒
                      </div>
                    </div>
                    <div className='start-end-text-col'>
                      <div className='start-end-text-row'>
                        START <span className='event-date-time'>{startDateStr} · {startTimeStr}</span>
                      </div>
                      <div className='start-end-text-row'>
                        END <span className='event-date-time'>{endDateStr} · {endTimeStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className='event-detail-row event-detail-row-spacer'>
                    <div className='icon-col'>
                      💲
                    </div>
                    <div className='price-text-col'>
                      {typeof price === 'number' ? '$' : null}{price === '0' ? 'FREE' : price}
                    </div>
                  </div>

                  <div className='event-detail-row'>
                    <div className='icon-col'>
                      📍
                    </div>
                    <div className='location-text-col'>
                      {onlineOrInPerson}
                    </div>
                  </div>

                </div>

                {/* (PUT /api/groups/:groupId/events) */}

                <div className='event-admin-buttons-row'>
                  {hideAdminButtons ? null :
                    <div id="event-admin-buttons-div">
                      {/* <Link to={`/events/${eventId}/update`}> */}
                      <Link to={`/groups/${groupId}/events/${eventId}/update`}>
                        <button className='event-admin-button'>
                          Update
                        </button>
                      </Link>
                      <EventDeleteModalButton
                        buttonText="Delete"
                        modalComponent={<EventDeleteModal eventId={eventId} />}
                      />
                    </div>
                  }

                </div>
              </div>
            </div>

            {/* LOWER TEXT ROW */}

            <div className='event-detail-lower-text-row'>
              <div className='event-info-header'>
                Description
              </div>

              <div className='event-info-text'>
                {desc}
              </div>
            </div>

          </div>

        </div>

      </div>

    </>
  )
}
