import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createGroupThunk } from "../../store/groups";
import './GroupCreate.css';

// const STATESold = [
//   "STATE",
//   "AL - Alabama",
//   "AK - Alaska",
//   "AZ - Arizona",
//   "AR - Arkansas",
//   "AS - American Samoa",
//   "CA - California",
//   "CO - Colorado",
//   "CT - Connecticut",
//   "DE - Connecticut",
//   "DC - District of Columbia",
//   "FL - Florida",
//   "GA - Georgia",
//   "GU - Guam",
//   "HI - Hawaii",
//   "ID - Idaho",
//   "IL - Illinois",
//   "IN - Indiana",
//   "IA - Iowa",
//   "KA - Kansas",
//   "KY - Kentucky",
//   "LA - Louisiana",
//   "ME - Maine",
//   "MD - Maryland",
//   "MA - Massachusetts",
//   "MI - Michigan",
//   "MN - Minnesota",
//   "MS - Mississippi",
//   "MO - Missouri",
//   "MT - Montana",
//   "NE - Nebraska",
//   "NV - Nevada",
//   "NH - New Hampshire",
//   "NJ - New Jersey",
//   "NM - New Mexico",
//   "NY - New York",
//   "NC - North Carolina",
//   "ND - North Dakota",
//   "MP - Northern Mariana Islands",
//   "OH - Ohio",
//   "OK - Oklahoma",
//   "OR - Oregon",
//   "PA - Pennsylvania",
//   "PR - Puerto Rico",
//   "RI - Rhode Island",
//   "SC - South Carolina",
//   "SD - South Dakota",
//   "TN - Tennessee",
//   "TX - Texas",
//   "TT - Trust Territories",
//   "UT - Utah",
//   "VT - Vermont",
//   "VA - Virginia",
//   "VI - Virgin Islands",
//   "WA - Washington",
//   "WV - West Virginia",
//   "WI - Wisconsin",
//   "WY - Wyoming",
// ];

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

export default function GroupCreate() {
  const dispatch = useDispatch();
  const history = useHistory();
  // const sessionUser = useSelector(state => state.session.user);
  // const organizerId = sessionUser.id;
  // console.log(`*** sessionUser is: ***`, sessionUser)
  // console.log(`*** sessionUser.id is: ***`, sessionUser.id)

  // controlled inputs
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('');
  const [privacy, setPrivacy] = useState(undefined);
  const [url, setURL] = useState('');

  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // disable button when fields are empty
  // useEffect(() => {
  //   if (!city.length) setDisabled(true);
  //   if (!state.length) setDisabled(true);
  //   if (state === 'STATE') setDisabled(true);
  //   if (!name.length) setDisabled(true);
  //   if (!about.length) setDisabled(true);
  //   if (!type.length) setDisabled(true);
  //   if (type === '(select one)') setDisabled(true);
  //   if (privacy === undefined) setDisabled(true);
  //   if (privacy === '(select one)') setDisabled(true);
  //   // if (!url.length) setDisabled(true);

  //   if (city.length &&
  //     state.length &&
  //     (state !== 'STATE') &&
  //     name.length &&
  //     about.length &&
  //     type.length &&
  //     (type !== '(select one)') &&
  //     (privacy !== undefined) &&
  //     (privacy !== '(select one)')) setDisabled(false); // removed && url.length
  // }, [city, state, name, about, type, privacy, url]);

  // validations
  // useEffect(() => {
  // const errsObj = {};
  //   if (city.length < 3) errsObj.name = "City must be 3 or more characters";
  //   // if (state.length > 2 || state.length < 2) errsObj.state = "State must be 2 characters";
  //   if (state === 'STATE') errsObj.state = "Please select a state or territory";
  //   if (type === 'noValue') errsObj.type = "Please select in person or online";
  //   if (privacy === 'noValue') errsObj.privacy = "Please select private or public";

  //   setErrors(errsObj);
  // }, [city, state, type, privacy]);


  // submission
  const handleSubmit = async (e) => { // added async
    e.preventDefault();

    let group = {
      city,
      state,
      name,
      about,
      type,
      privacy,
    }

    let groupImage = {
      url
    }


    ////// SEEMS FULLY WORKING
    ////// redirects if no errors; otherwise, displays errors
    try {
      const res = await dispatch(createGroupThunk(group)); // VS Code gives note about not needing 'await', but it IS needed here
      console.log(`*** in form try, res is: ***`, res)
      if (res.id) {
        setErrors({});
        history.push(`/groups/${res.id}`);
      } else {
        return res;
      }
    } catch (res) { // if exception in above code, run .catch()
      console.log(`*** in form catch, res: ***`, res)
      const data = await res.json(); // get data from db
      if (data && data.errors) { // if errors from db
        setErrors(data.errors); // setErrors
      }
    };


    ////// this displays errors if there are any -- but does not redirect
    // setErrors({});
    // return dispatch(createGroupThunk(group))
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     // console.log(`*** in catch, res: ***`, res)
    //     const data = await res.json(); // get data from db
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   });



    ////// this redirects when no errors -- but fails to display errors if there are any
    // const res = await dispatch(createGroupThunk(group));
    // // group = createdGroup;
    // console.log(`*** res is: ***`, res)
    // // console.log(`*** res.id is: ***`, res.id)

    // if (res.errors) {
    //   setErrors(res.errors);
    // }

    // if (res.id) {
    //   setErrors({});
    //   history.push(`/groups/${res.id}`);
    // }



    // let createdGroup;
    // try {
    //   createdGroup = dispatch(createGroupThunk(group));
    //   console.log(`*** form's createdGroup is: ***`, createdGroup)
    // } catch (res) {
    //   const data = await res.json(); // get data from db
    //   if (data && data.errors) { // if errors from db
    //     setErrors(data.errors); // setErrors
    //   }
    // }
    // if (createdGroup) {
    //   setErrors({});
    //   history.push(`/groups/${createdGroup.id}`);
    // }




    // if (createdGroup.errors) {
    //   setErrors(createdGroup.errors);
    // } else {
    //   history.push(`/groups/${createdGroup.id}`);
    // }

    // WORKING
    // setErrors({});
    // return dispatch(createGroupThunk(group))
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     // console.log(`*** in catch, res: ***`, res)
    //     const data = await res.json(); // get data from db
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   });

    // setErrors({});
    // group = { ...group, understanding, improvement };
    // if (formType === 'Update Group') {
    //   const updatedGroup = await dispatch(updateGroupThunk(group));
    //   group = updatedGroup;
    // } else if (formType === 'Create Group') {
    //   const createdGroup = await dispatch(createGroupThunk(group));
    //   group = createdGroup;
    // }

    // if (group.errors) {
    //   setErrors(group.errors);
    // } else {
    //   history.push(`/groups/${group.id}`);
    // }


    // setErrors({});
    // return dispatch(createGroupThunk(group))
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     // console.log(`*** in catch, res: ***`, res)
    //     const data = await res.json(); // get data from db
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   })
    //   .finally((res) => {
    //     history.push(`/groups/${createdGroup.id}`);
    //   });

    // setErrors({});
    // let createdGroup;
    // createdGroup = await dispatch(createGroupThunk(group))
    //   .then(
    //     console.log(`*** in catch, createdGroup: ***`, createdGroup)
    //   )
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     // console.log(`*** in catch, res: ***`, res)
    //     const data = await res.json(); // get data from db
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   });


    // let createdGroup;
    // try {
    //   createdGroup = dispatch(createGroupThunk(group));
    //   console.log(`*** form's createdGroup is: ***`, createdGroup)
    // } catch (res) {
    //   const data = await res.json(); // get data from db
    //   if (data && data.errors) { // if errors from db
    //     setErrors(data.errors); // setErrors
    //   }
    // }
    // if (createdGroup) {
    //   setErrors({});
    //   history.push(`/groups/${createdGroup.id}`);
    // }




    // WORKING
    // setErrors({});
    // return dispatch(createGroupThunk(group))
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     // console.log(`*** in catch, res: ***`, res)
    //     const data = await res.json(); // get data from db
    //     if (data && data.errors) { // if errors from db
    //       setErrors(data.errors); // setErrors
    //     }
    //   });



    // setErrors({});
    // return dispatch(createGroupThunk(group))
    //   .catch(async (res) => { // if exception in above code, run .catch()
    //     console.log(`*** in GroupCreate form catch -- res is: ***`, res)
    //     const data = await res.json();
    //     console.log(`*** in GroupCreate form catch -- data is: ***`, data);
    //     if (data && !data.errors) {
    //     } else if (data && data.errors) {
    //       setErrors(data.errors);
    //       // history.push(`/groups/${}`);
    //     }
    //   });





    // setClickedSubmit(true);

    // // render validation errors
    // if (Object.values(errors).length) {
    //   return;
    // }

    // Reset form state.
    // setCity('');
    // setState('');
    // setName('');
    // setAbout('');
    // setType('');
    // setPrivacy('');
    // setURL('');

    // setClickedSubmit(false);
    // setHasSubmitted(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>

        <div className='create-group-form-section'>
          <div className='form-top-header'>Start a new group</div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-become-organizer'>BECOME AN ORGANIZER</div>
          <div className='create-group-form-header'>We'll walk you through a few steps to build your local community</div>
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Set your group's location.</div>
          <div className='create-group-form-text'>MeetBuds groups meet locally, in person, and online. We'll connect you with people in your area.</div>
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
          {/* {errors.city && (<div className="group-create-error-text">{errors.city}</div>)} */}
          {/* {errors.state && (<div className="group-create-error-text">{errors.state}</div>)} */}
          {errors.city && !errors.state ? <div className="group-create-error-text">{errors.city}</div> : null}
          {errors.state && !errors.city ? <div className="group-create-error-text">{errors.state}</div> : null}
          {errors.city && errors.state ? <div className="group-create-error-text">{errors.city} | {errors.state}</div> : null}
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
              name="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='What is your group name?'
            />
          </div>
          {errors.name && (<div className="group-create-error-text">{errors.name}</div>)}
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
              placeholder='Please write at least 50 characters'
            />
          </div>
          {errors.about && (<div className="group-create-error-text">{errors.about}</div>)}
        </div>

        <div className='create-group-form-section'>
          <div className='create-group-form-header'>Final steps...</div>

          <div className='create-group-form-text'>Is this an in-person or online group?</div>
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

          <div className='create-group-form-text'>Is this group private or public?</div>
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
          {errors.privacy && (<div className="group-create-error-text">{errors.privacy}</div>)}

          <div className='create-group-form-text'>Please add an image URL for your group below:</div>
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
          {errors.url && (<div className="group-create-error-text">{errors.url}</div>)}
        </div>

        <button
          className={disabled ? "create-group-form-button-disabled" : "create-group-form-button"}
          disabled={disabled}
        >
          Create group
        </button>

      </form>
    </>
  )
}
