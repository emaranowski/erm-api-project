import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroupsThunk } from '../../store/groups';
import { getAllEventsThunk } from '../../store/events';
import DisplayCardGroup from '../DisplayCardGroup';
import DisplayCardEvent from '../DisplayCardEvent';
import './DisplayAll.css';

export default function DisplayAll({ displayType }) {
  const dispatch = useDispatch();

  const groupsStateArr = Object.values(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr
  const groupsStateKeys = Object.keys(
    useSelector((state) => (state.groups ? state.groups : {}))
  ); // ret arr // 0: allGroups, 1: singleGroup

  const allGroups = groupsStateArr[0];
  const allGroupsArr = Object.values(allGroups)

  const state = useSelector(state => state)
  const stateEventsSlice = useSelector(state => state.events)

  const allEvents = useSelector(state => state.events.allEvents)
  // console.log(`*** allEvents is: ***`, allEvents) // normalized obj -- { 1: {id: 1, ...}, 2: {id: 2, ...}, 3: {id: 3, ...} }
  // ^ each obj includes startDate
  const allEventsArr = Object.values(allEvents)
  // console.log(`*** allEventsArr is: ***`, allEventsArr) // arr --[ 0: {id: 1, ...}, 1: {id: 2, ...}, 2: {id: 3, ...} ]
  // ^ each ele/obj includes startDate -- like allEventsArr[0].startDate




  // console.log(`***** allEventsArr *****`, allEventsArr); // arr of Event objs
  // console.log(`***** allEventsArr is Array *****`, Array.isArray(allEventsArr)); // TRUE is array
  allEventsArr.forEach(eventObj => {
    // console.log(`***** eventObj.startDate typeof *****`, typeof eventObj.startDate); // string form
    // console.log(`***** eventObj.startDate *****`, eventObj.startDate);
    // console.log(`**********`)
    // console.log(`***** eventObj.startDate typeof *****`, typeof Date.parse(eventObj.startDate)); // number form
    // console.log(`***** eventObj.startDate typeof *****`, Date.parse(eventObj.startDate)); //
    // console.log(`**********`)
  });

  // // use number form --> Date.parse(eventObj.startDate)
  // // created ordered array



  // if (allEventsArr[0] !== undefined && allEventsArr[0] !== null) {
  //   let startDateNumToCompare = Date.parse(allEventsArr[0].startDate);
  //   // console.log(`***** date string form *****`, allEventsArr[0].startDate);
  //   console.log(`***** startDateNumToCompare *****`, startDateNumToCompare);
  //   allEventsArr.forEach(eventObj => {
  //     const startDateNum = Date.parse(eventObj.startDate);
  //     console.log(`***** startDateNum *****`, startDateNum);

  //   });
  // }

  let startDateNumsUnordered = [];
  let allEventsArrDESC = [];
  if (allEventsArr[0] !== undefined && allEventsArr[0] !== null) {
    allEventsArr.forEach(eventObj => {
      const startDateNum = Date.parse(eventObj.startDate);
      startDateNumsUnordered.push(startDateNum);
    });
    // console.log(`***** startDateNumsUnordered *****`, startDateNumsUnordered);

    let startDateNumsASC = startDateNumsUnordered.toSorted();
    // console.log(`***** startDateNumsASC *****`, startDateNumsASC);

    let startDateNumsDESC = startDateNumsASC.toReversed();
    // console.log(`***** startDateNumsDESC *****`, startDateNumsDESC);


    for (let i = 0; i < startDateNumsDESC.length; i++) {
      const startDateNumDESC = startDateNumsDESC[i];

      for (let j = 0; j < allEventsArr.length; j++) {
        const startDateNum = Date.parse(allEventsArr[j].startDate);
        if (startDateNum === startDateNumDESC) {
          allEventsArrDESC.push(allEventsArr[j]);
        }
      }
    }





    // allEventsArr.forEach(eventObj => {
    //   const startDateNum = Date.parse(eventObj.startDate);
    //   if (startDateNum === ) {
    //     allEventsArrDESC.push(eventObj);
    //   }
    // })
  };

  console.log(`***** startDateNumsUnordered *****`, startDateNumsUnordered);
  console.log(`***** allEventsArrDESC *****`, allEventsArrDESC);









  ///// COME BACK TO THIS FOR THE ORDERING OF EVENTS
  // const allEventsArrOrdered = []; // order: future to past

  // for (let i = 0; i < allEventsArr.length; i++) {
  //   const currEvent = allEventsArr[i];
  //   let mostRecentDateTime;
  //   let currStartDate;
  // }
  // ////////////// START DATE + TIME //////////////
  // let startDateArr = [];
  // let startTimeArr = [];
  // if (allEventsArr.length) {
  //   const startDateTime = event.startDate; // startDateTime is string
  //   const startDateTimeArr = startDateTime.split('');

  //   for (let i = 0; i < 10; i++) {
  //     startDateArr.push(startDateTimeArr[i]);
  //   }
  //   for (let i = 11; i < 16; i++) {
  //     startTimeArr.push(startDateTimeArr[i]);
  //   }
  // }
  // let startDateStr = startDateArr.join('');
  // let startTimeStr = startTimeArr.join('');



  useEffect(() => {
    dispatch(getAllGroupsThunk());
    dispatch(getAllEventsThunk());
  }, [dispatch]);

  return (
    <>
      <div className='all-groups-events-box'>
        <div className='centering-box'>

          {displayType === 'Groups' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <Link to='/events'>
                  <span className='events-groups-header-spacer non-active-event-group-header'>
                    Events
                  </span>
                </Link>
                <span className='active-event-group-header'>
                  Groups
                </span>
              </div>
              <div className='events-groups-subhead'>
                Groups on MeetBuds
              </div>
            </div>
            : null
          }

          {displayType === 'Groups' ?
            allGroupsArr.map((group) => (
              <div key={group.id}>
                <DisplayCardGroup group={group} />
              </div>
            ))
            : null
          }


          {displayType === 'Events' ?
            <div className="events-groups-header-box">
              <div className="events-groups-header">
                <span className='events-groups-header-spacer active-event-group-header'>
                  Events
                </span>
                <Link to='/groups'>
                  <span className='non-active-event-group-header'>
                    Groups
                  </span>
                </Link>
              </div>
              <div className='events-groups-subhead'>
                Events on MeetBuds
              </div>
            </div>
            : null
          }

          {displayType === 'Events' ?
            allEventsArrDESC.map((event) => (
              <div key={event.id}>
                {/* {console.log(`*** event is: ***`, event)} */}
                <DisplayCardEvent event={event} />
              </div>
            ))
            : null
          }

        </div>
      </div>
    </>
  )
}

// NOTE 2023-08-04: changed allEventsArr.map to allEventsArrDESC.map
