import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { createGroupThunk } from "../../store/groups";
import { updateGroupThunk } from "../../store/groups";
import './GroupForm.css';

const STATES = [
  "STATE",
  "AL",
  "AK",
  "AZ",
  "AR",
  "AS",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KA",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "TT",
  "UT",
  "VT",
  "VA",
  "VI",
  "WA",
  "WV",
  "WI",
  "WY",
];

export default function GroupForm({ group, formType }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();

  // controlled inputs
  const [city, setCity] = useState(group?.city);
  const [state, setState] = useState(group?.state);
  const [name, setName] = useState(group?.name);
  const [about, setAbout] = useState(group?.about);
  const [type, setType] = useState(group?.type);
  const [privacy, setPrivacy] = useState(group?.privacy);
  const [url, setURL] = useState(group?.previewImage);

  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});

  // submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    group = {
      ...group,
      city,
      state,
      name,
      about,
      type,
      privacy,
      url,
      groupId,
    }

    if (formType === 'Create Group') {

      try {
        const res = await dispatch(createGroupThunk(group)); // VS Code gives note about not needing 'await', but it IS needed here
        if (res.id) {
          setErrors({});
          history.push(`/groups/${res.id}`);
        } else {
          return res;
        }
      } catch (res) { // if exception in above code, run .catch()
        const data = await res.json(); // get data from db
        if (data && data.errors) { // if errors from db
          setErrors(data.errors); // setErrors
        }
      };

    } else if (formType === 'Update Group') {

      try {
        const res = await dispatch(updateGroupThunk(group)); // VS Code gives note about not needing 'await', but it IS needed here
        if (res.id) {
          setErrors({});
          history.push(`/groups/${res.id}`);
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

  return (
    <>
      <form id='group-form' onSubmit={handleSubmit}>

        <div className='create-group-form-section'>
          <div className='form-top-header'>
            {formType === 'Create Group' ? 'Start a new group' : 'Update your group'}
          </div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-become-organizer'>BECOME AN ORGANIZER</div>
          <div className='create-group-form-header'>We'll walk you through a few steps to build your community</div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>What will your group's name be?</div>
          <div className='create-group-form-text'>Choose a name that will give a clear idea of what the group is about. Get creative! You can edit this later if you want.
          </div>
          <div>
            <input
              className="input-spacer input-text"
              size="57"
              type="text"
              name="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Group name'
            />
          </div>
          {errors.name && (<div className="group-create-error-text">{errors.name}</div>)}
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Set your group's location.</div>
          <div className='create-group-form-text'>MeetBuds groups meet locally, in person, and online. Select the city and state you'll be primarily based out of.</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="city"
                onChange={(e) => setCity(e.target.value)}
                value={city}
                placeholder="City"
              />
            </span>
            <span>
              <select
                className="input-spacer input-text"
                onChange={(e) => setState(e.target.value)}
                value={state}
              >
                {STATES.map(state => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                ))}
              </select>
            </span>
          </div>
          {errors.city && !errors.state ? <div className="group-create-error-text">{errors.city}</div> : null}
          {errors.state && !errors.city ? <div className="group-create-error-text">{errors.state}</div> : null}
          {errors.city && errors.state ? <div className="group-create-error-text">{errors.city} | {errors.state}</div> : null}

          <div className='create-group-form-text'>Will this group be in-person or online?</div>
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

        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Describe the purpose of your group.</div>
          <div className='create-group-form-text'>People will see this when we promote your group, but you'll be able to add to it later, too.</div>
          <div className='create-group-form-text'>1. What's the purpose of the group?</div>
          <div className='create-group-form-text'>2. Who should join?</div>
          <div className='create-group-form-text'>3. What will you do at your events?</div>
          <div>
            <textarea
              className="input-spacer input-text"
              rows="6" cols="39"
              id='comments'
              name='about'
              onChange={e => setAbout(e.target.value)}
              value={about}
              placeholder='Please include at least 30 characters'
            />
          </div>
          {errors.about && (<div className="group-create-error-text">{errors.about}</div>)}
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Final steps...</div>

          <div className='create-group-form-text'>Is this group private or public?</div>
          <div>
            <select
              className="input-spacer input-text"
              onChange={(e) => setPrivacy(e.target.value)}
              value={privacy}
            >
              <option key='(select one)' value='(select one)'>(select one)</option>
              <option key='true' value={true}>Private</option>
              <option key='false' value={false}>Public</option>
            </select>
          </div>
          {errors.privacy && (<div className="group-create-error-text">{errors.privacy}</div>)}

          <div className='create-group-form-text'>Please add an image URL for your group below:</div>
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
          {/* {urlError ? <div className="group-create-error-text">Image URL must be valid (must end in .png, .jpg, or .jpeg)</div> : null} */}
          {/* {url === '' ? <div className="group-create-error-text">Image URL must be valid (must end in .png, .jpg, or .jpeg)</div> : null} */}
          {/* {errors.url && (<div className="group-create-error-text">{errors.url}</div>)} */}
          {/* {errors.url && (<div className="group-create-error-text">Image URL must be valid (must end in .png, .jpg, or .jpeg)</div>)} */}
        </div>

        <button
          className={disabled ? "create-group-form-button-disabled" : "create-group-form-button"}
          disabled={disabled}
        >
          {formType === 'Create Group' ? 'Create Group' : 'Update Group'}
        </button>

      </form>
    </>
  )
}
