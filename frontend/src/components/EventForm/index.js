import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { createEventThunk, getSingleEventThunk } from "../../store/events";
import { getSingleGroupThunk } from "../../store/groups";
// import { updateEventThunk } from "../../store/events";
import './EventForm.css';

// test update image url:
// https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Two_small_test_tubes_held_in_spring_clamps.jpg/440px-Two_small_test_tubes_held_in_spring_clamps.jpg

export default function EventForm({ event, formType }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();

  const singleGroup = useSelector(state => state.groups.singleGroup);
  let groupName;
  if (singleGroup.id !== undefined && singleGroup.id !== null) {
    groupName = singleGroup.name;
  }

  // controlled inputs
  const [name, setName] = useState(event?.name);
  const [type, setType] = useState(event?.type);
  const [capacity, setCapacity] = useState(event?.type);
  const [price, setPrice] = useState(event?.price);
  const [description, setDescription] = useState(event?.description);
  const [startDate, setStartDate] = useState(event?.startDate);
  const [endDate, setEndDate] = useState(event?.endDate);
  const [url, setURL] = useState(event?.url);
  const [venueId, setVenueId] = useState(1); // 2023-08-03: hardcoding for now, since it's not part of MVP specs

  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});

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
    }

    // console.log(`*** in form, event is: ***`, event)

    // refactored to match below
    if (formType === 'Create Event') {

      try {
        const res = await dispatch(createEventThunk(event)); // VS Code gives note about not needing 'await', but it IS needed here
        console.log(`*** in event form create TRY, RES is: ***`, res)
        if (res.id) {
          setErrors({});
          history.push(`/events/${res.id}`);
        } else {
          return res;
        }
      } catch (res) { // if exception in above code, run .catch()
        console.log(`*** in event form create CATCH, RES is: ***`, res) // TypeError: Failed to execute 'json' on 'Response': body stream already read
        const data = await res.json(); // get data from db
        console.log(`*** in event form create CATCH, DATA is: ***`, data) // TypeError: Failed to execute 'json' on 'Response': body stream already read
        if (data && data.errors) { // if errors from db
          setErrors(data.errors); // setErrors
        }
      };

    }

    // else if (formType === 'Update Event') {

    //   try {
    //     const res = await dispatch(updateEventThunk(event)); // VS Code gives note about not needing 'await', but it IS needed here
    //     console.log(`*** in form UPDATE try, res is: ***`, res)
    //     if (res.id) {
    //       setErrors({});
    //       history.push(`/events/${res.id}`);
    //     } else {
    //       return res;
    //     }
    //   } catch (res) { // if exception in above code, run .catch()
    //     console.log(`*** in form UPDATE catch, res is: ***`, res) // TypeError: Failed to execute 'json' on 'Response': body stream already read
    //     const data = await res.json(); // get data from db
    //     console.log(`*** in form UPDATE catch, data is: ***`, data) // TypeError: Failed to execute 'json' on 'Response': body stream already read
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   };
    // }

  };

  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  return (
    <>
      <form onSubmit={handleSubmit}>

        <div className='create-group-form-section'>
          <div className='form-top-header'>
            {formType === 'Create Event' ? `Create a new event for ${groupName}` : `Update your event for ${groupName}`}
          </div>
        </div>

        <div className='create-group-form-section'>

          <div className='create-group-form-text'>What is the name of your event?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Event Name"
              />
            </span>
          </div>
          {errors.name ? <div className="group-create-error-text">{errors.name}</div> : null}

        </div>

        <div className='create-group-form-section'>

          <div className='create-group-form-text'>Is this an in-person or online event?</div>
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
          {errors.type && (<div className="group-create-error-text">{errors.type}</div>)}

          {/* <div className='create-group-form-text'>Is this group private or public?</div>
          <div>
            <select
              className="input-spacer input-text"
              onChange={(e) => setPrivacy(e.target.value)}
              value={privacy}
            >
              <option key='(select one)' value='(select one)'>(select one)</option>
              <option key='Private' value={true}>Private</option>
              <option key='Public' value={false}>Public</option>
            </select>
          </div>
          {errors.privacy && (<div className="group-create-error-text">{errors.privacy}</div>)} */}

          <div className='create-group-form-text'>What is the attendance capacity for your event?</div>
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
          {errors.capacity && (<div className="group-create-error-text">{errors.capacity}</div>)}

          <div className='create-group-form-text'>What is the price for your event?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="number"
                name="price"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                placeholder={`Type "0" if it's free!`}
              />
            </span>
          </div>
          {errors.price && (<div className="group-create-error-text">{errors.price}</div>)}

        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-text'>When does your event start?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                type="date"
                name="startDate"
                onChange={(e) => setStartDate(e.target.value)}
                value={startDate}
              />
            </span>
            <span>
              <input
                className="input-spacer input-text"
                type="time"
                name="startTime"
                onChange={(e) => setStartTime(e.target.value)}
                value={startTime}
              />
            </span>
          </div>
          {errors.startDate && (<div className="group-create-error-text">{errors.startDate}</div>)}

          <div className='create-group-form-text'>When does your event end?</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                type="date"
                name="endDate"
                onChange={(e) => setEndDate(e.target.value)}
                value={endDate}
                placeholder="MM/DD/YYY HH:mm PM"
              />
            </span>
            <span>
              <input
                className="input-spacer input-text"
                type="time"
                name="endTime"
                onChange={(e) => setEndTime(e.target.value)}
                value={endTime}
              />
            </span>
          </div>
          {errors.endDate && (<div className="group-create-error-text">{errors.endDate}</div>)}
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-text'>Please add an image URL for your event below:</div>
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

        <div className='create-group-form-section'>
          <div className='create-group-form-text'>Please describe your event:</div>
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
          {errors.description && (<div className="group-create-error-text">{errors.description}</div>)}
        </div>


        <button
          className={disabled ? "create-group-form-button-disabled" : "create-group-form-button"}
          disabled={disabled}
        >
          {formType === 'Create Event' ? 'Create event' : 'Update event'}
        </button>

      </form>
    </>
  )
}
