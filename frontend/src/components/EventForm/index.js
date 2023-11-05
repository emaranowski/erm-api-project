import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { createEventThunk, updateEventThunk, getSingleEventThunk } from "../../store/events";
import { getSingleGroupThunk } from "../../store/groups";
import './EventForm.css';

export default function EventForm({ event, formType }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId, eventId } = useParams();

  const singleGroup = useSelector(state => state.groups.singleGroup);
  let groupName;
  if (singleGroup.id !== undefined && singleGroup.id !== null) {
    groupName = singleGroup.name;
  };

  // controlled inputs
  const [name, setName] = useState(event?.name);
  const [type, setType] = useState(event?.type);
  const [capacity, setCapacity] = useState(event?.capacity);
  const [price, setPrice] = useState(event?.price);
  const [description, setDescription] = useState(event?.description);
  const [startDate, setStartDate] = useState(event?.startDate); // to/from db
  const [endDate, setEndDate] = useState(event?.endDate); // to/from db
  const [url, setURL] = useState('');
  const [venueId, setVenueId] = useState(1); // 2023-08-03: hardcoding for now, since it's not part of MVP specs

  // if (event.EventImages.length[0]) {
  //   setURL(event.EventImages[0].url);
  // };

  // parse out startDateDB/startTimeDB from DB format, in order to auto-fill form
  const startDateTimeDBArr = startDate.split('');
  const startDateDBArr = startDateTimeDBArr.slice(0, 10);
  const startTimeDBArr = startDateTimeDBArr.slice(11, 19);
  const startDateDB = startDateDBArr.join('');
  const startTimeDB = startTimeDBArr.join('');

  // parse out endDateDB/endTimeDB from DB format, in order to auto-fill form
  const endDateTimeDBArr = endDate.split('');
  const endDateDBArr = endDateTimeDBArr.slice(0, 10);
  const endTimeDBArr = endDateTimeDBArr.slice(11, 19);
  const endDateDB = endDateDBArr.join('');
  const endTimeDB = endTimeDBArr.join('');

  // to/from HTML form
  const [startDateHTML, setStartDateHTML] = useState(startDateDB);
  const [startTimeHTML, setStartTimeHTML] = useState(startTimeDB);
  const [endDateHTML, setEndDateHTML] = useState(endDateDB);
  const [endTimeHTML, setEndTimeHTML] = useState(endTimeDB);

  // disabling & errors
  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const startDateTimeConcat = startDateHTML.concat(' ', startTimeHTML, ':00');
    setStartDate(startDateTimeConcat);

    const endDateTimeConcat = endDateHTML.concat(' ', endTimeHTML, ':00');
    setEndDate(endDateTimeConcat);
  }, [startDateHTML, startTimeHTML, endDateHTML, endTimeHTML]);

  // submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    event = {
      ...event,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
      url,
      venueId,
      groupId,
      eventId,
    }

    // refactored to match below
    if (formType === 'Create Event') {

      try {
        const res = await dispatch(createEventThunk(event)); // VS Code gives note about not needing 'await', but it IS needed here
        if (res.id) {
          setErrors({});
          history.push(`/events/${res.id}`);
        } else {
          return res;
        }
      } catch (res) { // if exception in above code, run .catch()
        const data = await res.json(); // get data from db
        if (data && data.errors) { // if errors from db
          setErrors(data.errors); // setErrors
        }
      };

    } else if (formType === 'Update Event') {

      try {
        const res = await dispatch(updateEventThunk(event)); // VS Code gives note about not needing 'await', but it IS needed here
        if (res.id) {
          setErrors({});
          history.push(`/events/${res.id}`);
        } else {
          return res;
        }
      } catch (res) { // if exception in above code, run .catch()
        const data = await res.json(); // get data from db
        if (data && data.errors) { // if errors from db
          setErrors(data.errors); // setErrors
        }
      };
    }

  };

  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  return (
    <>
      <form id='event-form' onSubmit={handleSubmit}>

        <div className='create-event-form-section'>
          <div className='form-top-header'>
            {formType === 'Create Event' ? `Create an event for ${groupName}` : `Update your event for ${groupName}`}
          </div>
        </div>

        <div className='create-event-form-section'>
          <div className='create-event-form-become-host'>BECOME A HOST</div>
          <div className='create-event-form-header'>We'll help you plan an event for your group</div>
        </div>

        <div className='create-event-form-section'>

          <div className='create-event-form-header'>What will your event name be?</div>
          <div className='create-event-form-text'>Choose a name that will give a clear idea of what the event is about. Get creative! You can edit this later if you want.</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Event name"
              />
            </span>
          </div>
          {errors.name ? <div className="event-create-error-text">{errors.name}</div> : null}

        </div>

        <div className='create-event-form-section'>
          <div className='create-event-form-header'>Set your event location.</div>
          <div className='create-event-form-text'>Will this event be in-person or online?</div>
          <div>
            <select
              className="input-spacer input-text"
              onChange={(e) => setType(e.target.value)}
              value={type}
            >
              <option key='(select one)' value='(select one)'>(select one)</option>
              <option key='In person' value='In person'>In Person</option>
              <option key='Online' value='Online'>Online</option>
            </select>
          </div>
          {errors.type && (<div className="event-create-error-text">{errors.type}</div>)}
        </div>

        <div className='create-event-form-section'>
          <div className='create-event-form-header'>Describe the purpose of your event.</div>
          <div className='create-event-form-text'>Let people know what it's all about.</div>
          <div>
            <textarea
              className="input-spacer input-text"
              rows="8" cols="56"
              id='comments'
              name='description'
              onChange={e => setDescription(e.target.value)}
              value={description}
              placeholder='Please include at least 30 characters'
            />
          </div>
          {errors.description && (<div className="event-create-error-text">{errors.description}</div>)}
        </div>

        {formType === 'Create Event' ?
          <div className='create-event-form-section'>
            <div className='create-event-form-header'>A picture says a thousand words.</div>
            <div className='create-event-form-text'>Add an image URL for your event:</div>
            <div>
              <input
                className="input-spacer input-text"
                size="57"
                type="url"
                name="url"
                onChange={(e) => setURL(e.target.value)}
                value={url}
                placeholder='Image URL'
                required
              />
            </div>
          </div>
          :
          <div className='create-event-form-section'>
            <div className='create-event-form-header'>A picture says a thousand words.</div>
            <div className='create-event-form-text'>Add an image URL for your event:</div>
            <div>
              <input
                className="input-spacer input-text"
                size="57"
                type="url"
                name="url"
                onChange={(e) => setURL(e.target.value)}
                value={url}
                placeholder='Image URL'
              />
            </div>
          </div>
        }

        <div className='create-event-form-section'>
          <div className='create-event-form-header'>Timing is everything.</div>
          <div className='create-event-form-text'>Select an event start:</div>
          <div>
            <span>
              {/* <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="startDate"
                onChange={(e) => setStartDate(e.target.value)}
                value={startDate}
                placeholder="MM/DD/YYY HH:mm AM"
              /> */}
              <input
                className="input-spacer input-text"
                type="date"
                name="startDateHTML"
                onChange={(e) => setStartDateHTML(e.target.value)}
                value={startDateHTML}
              />
            </span>
            <span>
              <input
                className="input-spacer input-text"
                type="time"
                name="startTimeHTML"
                onChange={(e) => setStartTimeHTML(e.target.value)}
                value={startTimeHTML}
              />
            </span>
          </div>
          {errors.startDate && (<div className="event-create-error-text">{errors.startDate}</div>)}

          <div className='create-event-form-text'>Select an event end:</div>
          <div>
            <span>
              {/* <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="endDate"
                onChange={(e) => setEndDate(e.target.value)}
                value={endDate}
                placeholder="MM/DD/YYY HH:mm PM"
              /> */}
              <input
                className="input-spacer input-text"
                type="date"
                name="endDateHTML"
                onChange={(e) => setEndDateHTML(e.target.value)}
                value={endDateHTML}
              />
            </span>
            <span>
              <input
                className="input-spacer input-text"
                type="time"
                name="endTimeHTML"
                onChange={(e) => setEndTimeHTML(e.target.value)}
                value={endTimeHTML}
              />
            </span>
          </div>
          {errors.endDate && (<div className="event-create-error-text">{errors.endDate}</div>)}
        </div>

        <div className='create-event-form-section'>
          <div className='create-event-form-header'>Final steps – event capacity and price.</div>
          <div className='create-event-form-text'>What is the attendance capacity for your event?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="number"
                name="capacity"
                onChange={(e) => setCapacity(e.target.value)}
                value={capacity}
                placeholder='0'
              />
            </span>
          </div>
          {errors.capacity && (<div className="event-create-error-text">{errors.capacity}</div>)}

          <div className='create-event-form-text'>What is the price for your event?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="number"
                name="price"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                placeholder={`0`}
              />
            </span>
          </div>
          {errors.price && (<div className="event-create-error-text">{errors.price}</div>)}
        </div>

        <button
          className={disabled ? "create-event-form-button-disabled" : "create-event-form-button"}
          disabled={disabled}
        >
          {formType === 'Create Event' ? 'Create Event' : 'Update Event'}
        </button>

      </form>
    </>
  )
}
