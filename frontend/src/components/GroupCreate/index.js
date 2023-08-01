import { useState, useEffect } from "react";
import './GroupCreate.css';

const STATES = [
  "(select a state)",
  "AL - Alabama",
  "AK - Alaska",
  "AZ - Arizona",
  "AR - Arkansas",
  "AS - American Samoa",
  "CA - California",
  "CO - Colorado",
  "CT - Connecticut",
  "DE - Connecticut",
  "DC - District of Columbia",
  "FL - Florida",
  "GA - Georgia",
  "GU - Guam",
  "HI - Hawaii",
  "ID - Idaho",
  "IL - Illinois",
  "IN - Indiana",
  "IA - Iowa",
  "KA - Kansas",
  "KY - Kentucky",
  "LA - Louisiana",
  "ME - Maine",
  "MD - Maryland",
  "MA - Massachusetts",
  "MI - Michigan",
  "MN - Minnesota",
  "MS - Mississippi",
  "MO - Missouri",
  "MT - Montana",
  "NE - Nebraska",
  "NV - Nevada",
  "NH - New Hampshire",
  "NJ - New Jersey",
  "NM - New Mexico",
  "NY - New York",
  "NC - North Carolina",
  "ND - North Dakota",
  "MP - Northern Mariana Islands",
  "OH - Ohio",
  "OK - Oklahoma",
  "OR - Oregon",
  "PA - Pennsylvania",
  "PR - Puerto Rico",
  "RI - Rhode Island",
  "SC - South Carolina",
  "SD - South Dakota",
  "TN - Tennessee",
  "TX - Texas",
  "TT - Trust Territories",
  "UT - Utah",
  "VT - Vermont",
  "VA - Virginia",
  "VI - Virgin Islands",
  "WA - Washington",
  "WV - West Virginia",
  "WI - Wisconsin",
  "WY - Wyoming",
];

export default function GroupCreate() {
  // controlled inputs
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [place, setPlace] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [url, setURL] = useState('');

  const [errors, setErrors] = useState({});
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // validations
  const errsObj = {};
  // useEffect(() => {
  //   if (city.length < 3) errsObj.name = "City must be 3 or more characters";
  //   // if (state.length > 2 || state.length < 2) errsObj.state = "State must be 2 characters";
  //   if (state === '(select a state)') errsObj.state = "Please select a state or territory";
  //   if (place === 'noValue') errsObj.place = "Please select in person or online";
  //   if (privacy === 'noValue') errsObj.place = "Please select private or public";

  //   setErrors(errsObj);
  // }, [city, state, place, privacy]);

  // submission
  const handleSubmit = e => {
    e.preventDefault();

    if (city.length < 3) errsObj.name = "City must be 3 or more characters";
    // if (state.length > 2 || state.length < 2) errsObj.state = "State must be 2 characters";
    if (state === '(select a state)') errsObj.state = "Please select a state or territory";
    if (place === 'noValue') errsObj.place = "Please select in person or online";
    if (privacy === 'noValue') errsObj.place = "Please select private or public";

    setErrors(errsObj);

    setClickedSubmit(true);

    // render validation errors
    if (Object.values(errors).length) {
      return;
    }

    // Create a new object for the contact us information.
    const contactUsInformation = {
      city,
      state,
      groupName,
      groupDesc,
      place,
      privacy,
      url,
      // submittedOn: new Date()
    };

    // Ideally, we'd persist this information to a database using a RESTful API.
    // For now, though, just log the contact us information to the console.
    // console.log(contactUsInformation);

    // Reset form state.
    setCity('');
    setState('');
    setGroupName('');
    setGroupDesc('');
    setPlace('');
    setPrivacy('');
    setURL('');

    setErrors({});
    setClickedSubmit(false);
    setHasSubmitted(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>

        <div className='create-group-form-section'>
          <div className='create-group-form-become-organizer'>BECOME AN ORGANIZER</div>
          <div className='create-group-form-header'>We'll walk you through a few steps to build your local community</div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>First, set your group's location.</div>
          <div className='create-group-form-text'>MeetBuds groups meet locally, in person and online. We'll connect you with people
            in your area, and more can join you online</div>
          <div>
            <span>
              <input
                className="input-spacer input-text"
                size="26"
                type="text"
                name="city"
                onChange={(e) => setCity(e.target.value)}
                value={city}
                placeholder='City'
              />
            </span>
            <span>
              {/* <input
              className="input-spacer input-text"
              size="12"
              type="text"
              name="state"
              onChange={(e) => setState(e.target.value)}
              value={state}
              placeholder='STATE'
            /> */}
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

          <div className='form-error'>
            {clickedSubmit && errors.city ? errors.city : null}
          </div>

          {/* {errors.city ? <div className="errors">{errors.city}</div> : null}
        {errors.state ? <div className="errors">{errors.state}</div> : null} */}
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>What will your group's name be?</div>
          <div className='create-group-form-text'>Choose a name that will give people a clear idea of what the group is about.
            Feel free to get creative! You can edit this later if you change your mind.</div>
          <div>
            <input
              className="input-spacer input-text"
              size="57"
              type="text"
              name="groupName"
              onChange={(e) => setGroupName(e.target.value)}
              value={groupName}
              placeholder='What is your group name?'
            />
          </div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Now describe what your group will be about</div>
          <div className='create-group-form-text'>People will see this when we promote your group, but you'll be able to add to it later, too.</div>
          <div className='create-group-form-text'>1. What's the purpose of the group?</div>
          <div className='create-group-form-text'>2. Who should join?</div>
          <div className='create-group-form-text'>3. What will you do at your events?</div>
          <div>
            <textarea
              className="input-spacer input-text"
              rows="6" cols="39"
              id='comments'
              name='groupDesc'
              onChange={e => setGroupDesc(e.target.value)}
              value={groupDesc}
              placeholder='Please write at least 30 characters'
            />
          </div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Final steps...</div>

          <div className='create-group-form-text'>Is this an in person or online group?</div>
          <div>
            <select
              className="input-spacer input-text"
              onChange={(e) => setPlace(e.target.value)}
              value={place}
            >
              <option key='noValue' value='noValue'>(select one)</option>
              <option key='In Person' value='In Person'>In Person</option>
              <option key='Online' value='Online'>Online</option>
              {/* {placeOptions.map(place => (
              <option
                key={place}
                value={place}
              >
                {place}
              </option>
            ))} */}
            </select>
          </div>

          <div className='create-group-form-text'>Is this group private or public?</div>
          <div>
            <select
              className="input-spacer input-text"
              onChange={(e) => setPrivacy(e.target.value)}
              value={place}
            >
              <option key='noValue' value='noValue'>(select one)</option>
              <option key='Private' value='Private'>Private</option>
              <option key='Public' value='Public'>Public</option>
              {/* {privacyOptions.map(privacy => (
              <option
                key={privacy}
                value={privacy}
              >
                {privacy}
              </option>
            ))} */}
            </select>
          </div>

          <div className='create-group-form-text'>Please add an image url for your group below:</div>
          <div>
            <input
              className="input-spacer input-text"
              size="57"
              type="text"
              name="url"
              onChange={(e) => setURL(e.target.value)}
              value={url}
              placeholder='Image URL'
            />
          </div>
        </div>

        <button className='create-group-form-button' disabled={Object.values(errors).length}>
          Create group
        </button>

      </form>
    </>
  )
}
