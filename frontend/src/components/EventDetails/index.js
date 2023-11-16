import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllEventsThunk, getSingleEventThunk } from '../../store/events';
import { getAllGroupsThunk, getSingleGroupThunk } from '../../store/groups';
import EventDeleteModalButton from '../EventDeleteModalButton';
import EventDeleteModal from '../EventDeleteModal';
import './EventDetails.css';

export default function EventDetails() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const { eventId } = useParams();
  const event = useSelector(state => state.events.singleEvent ? state.events.singleEvent : {}); // {}
  const eventImages = useSelector(state => state.events.singleEvent.EventImages ? state.events.singleEvent.EventImages : []); // {}
  const singleGroup = useSelector(state => state.groups.singleGroup);
  const allGroups = useSelector(state => state.groups.allGroups);

  ////////////// PREVIEW IMAGE URL //////////////
  let previewImageURL;
  let previewImages;
  if (eventImages.length) {
    previewImages = eventImages.filter(image => {
      return image.preview === true;
    });
    // previewImageURL = previewImages[0].url; // orig
    previewImageURL = previewImages[previewImages.length - 1].url;
  }

  ////////////// GROUP ID //////////////
  let groupId;
  if (event.Group !== undefined) {
    groupId = event.groupId;
  }

  ////////////// EVENT HOST NAME (GROUP ORGANIZER NAME) //////////////
  let organizerId;
  let organizerFirstName;
  let organizerLastName;
  if (singleGroup.id !== undefined) {
    organizerId = singleGroup.organizerId;
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  ////////////// GROUP IMAGE //////////////
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
    if (event.Group.privacy === true) groupVisbility = 'Private group';
    if (event.Group.privacy === false) groupVisbility = 'Public group';
  }

  ////////////// START DATE + TIME //////////////
  // index 0-9 = date // '2', '0', '2', '5', '-', '0', '9', '-', '1', '2'
  // index 10 = 'T'
  // index 11-15 = time // '1', '6', ':', '0', '0'
  const startDateArr = [];
  const startTimeArr = [];

  if (event.id !== undefined) {
    const startDateTime = event.startDate;
    const startDateTimeArr = startDateTime.split('');

    for (let i = 0; i < 10; i++) {
      startDateArr.push(startDateTimeArr[i]);
    }

    for (let i = 11; i < 16; i++) {
      startTimeArr.push(startDateTimeArr[i]);
    }
  }

  const startDateStr = startDateArr.join('');
  const startTimeStr = startTimeArr.join('');

  ////////////// END DATE + TIME //////////////
  const endDateArr = [];
  const endTimeArr = [];

  if (event.id !== undefined) {
    const endDateTime = event.endDate;
    const endDateTimeArr = endDateTime.split('');

    for (let i = 0; i < 10; i++) {
      endDateArr.push(endDateTimeArr[i]);
    }

    for (let i = 11; i < 16; i++) {
      endTimeArr.push(endDateTimeArr[i]);
    }
  }

  const endDateStr = endDateArr.join('');
  const endTimeStr = endTimeArr.join('');

  ////////////// PRICE //////////////

  let price;
  if (event.price !== undefined) {
    price = event.price;
  }
  if (price === 0) price = 'FREE';

  ////////////// ONLINE OR IN-PERSON //////////////

  let onlineOrInPerson;
  if (event.type !== undefined) {
    onlineOrInPerson = event.type;
  }

  ////////////// DESCRIPTION //////////////

  let description;
  if (event.description !== undefined) {
    description = event.description;
  }

  ////////////// 'JOIN' BUTTON LOGIC: TBD IF USING //////////////
  // logged out: HIDE
  // logged in + created event: HIDE
  // logged in + did not create event: DISPLAY

  // let hideJoinButton = true;

  // if (sessionUser === null) { // logged out
  //   hideJoinButton = true; // hide
  // } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
  //   if (sessionUser.id !== organizerId) { // did not create event
  //     hideJoinButton = false; // display
  //   }
  // }

  ////////////// ADMIN BUTTONS LOGIC: 'Update', 'Delete' //////////////
  // logged out: HIDE
  // logged in + created event: DISPLAY
  // logged in + did not create event: HIDE

  let hideAdminButtons = true;

  if (sessionUser === null) { // logged out
    hideAdminButtons = true; // hide
  } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
    if (sessionUser.id === organizerId) { // created event
      hideAdminButtons = false; // display
    }
  }

  useEffect(() => {
    dispatch(getSingleEventThunk(eventId));
    dispatch(getAllEventsThunk());
    if (groupId !== undefined) dispatch(getSingleGroupThunk(groupId));
    dispatch(getAllGroupsThunk());
  }, [dispatch, eventId, groupId]);

  return (
    <>
      <div className='event-detail-main-box'>
        <div className='event-detail-centering-child'>

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

            <div className='event-detail-upper-graphic-row'>
              <div className='event-img-col'>
                {previewImageURL ?
                  <img className='event-detail-img' src={previewImageURL}></img>
                  : ''
                }
              </div>

              <div className='event-group-date-price-location-col'>

                <Link to={`/groups/${groupId}`}>
                  <div className='event-group-mini-card-row'>
                    <div className='event-group-mini-image-col'>
                      {groupPreviewImageURL ?
                        <img className='event-detail-group-img' src={groupPreviewImageURL}></img>
                        : null
                      }
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
                      {typeof price === 'number' ? '$' : null}
                      {price === '0' ? 'FREE' : price}
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

            <div className='event-detail-lower-text-row'>
              <div className='event-info-header'>
                Description
              </div>
              <div className='event-info-text'>
                {description}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
};
