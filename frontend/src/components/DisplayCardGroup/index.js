import { Link } from 'react-router-dom';
// import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// import { getAllGroupsThunk } from '../../store/groups';

import './DisplayCardGroup.css';

export default function DisplayCardGroup({ group }) {

  /////////////////////////// NUM EVENTS
  const groupIdAsNum = group.id;
  const allEvents = useSelector(state => state.events.allEvents);

  let numEvents;
  if (Object.values(allEvents).length) {
    let allEventsArr = Object.values(allEvents);

    let eventsByThisGroup = allEventsArr.filter(eventObj => {
      return eventObj.groupId === groupIdAsNum;
    });

    numEvents = eventsByThisGroup.length;
  };

  // console.log(`*** IN DISPLAY CARD displayType is: ***`, displayType)
  // console.log(`*** IN DISPLAY CARD group is: ***`, group)


  // // console.log(`*** group.previewImage is: ***`, group.previewImage);

  // const groupPulled = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  // const groupPulledImages = group.GroupImages;

  // console.log(`*** groupPulled is: ***`, groupPulled);
  // console.log(`*** groupPulledImages is: ***`, groupPulledImages);


  // let previewImageURL;
  // let previewImages;
  // if (groupPulledImages.length !== undefined) {
  //   previewImages = groupPulledImages.filter(image => {
  //     return image.preview === true;
  //   })
  //   // previewImageURL = previewImages[0].url; // orig
  //   previewImageURL = previewImages[previewImages.length - 1].url;


  // WORKING -- V2
  // const group2 = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  //   const group2Images = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  //   let previewImageURL;
  //   let previewImages;
  //   if (group2Images.length) {
  //     previewImages = group2Images.filter(image => {
  //       return image.preview === true;
  //     })
  //     // previewImageURL = previewImages[0].url; // orig
  //     previewImageURL = previewImages[previewImages.length - 1].url;
  //   }

  //   // console.log(`*** group is: ***`, group)
  //   // console.log(`*** groupImages is: ***`, groupImages)
  //   // console.log(`*** previewImages is: ***`, previewImages)
  //   console.log(`*** previewImageURL is: ***`, previewImageURL)
  // }

  return (
    <>

      <Link to={`/groups/${group.id}`}>
        <div className='group-card'>

          {group.previewImage ? <div><img className='group-card-img' src={group.previewImage}></img></div> : ''}

          <div className='group-info'>
            <div className='group-name'>
              {group.name}
            </div>

            <div className='group-location'>
              {group.city}, {group.state}
            </div>

            <div className='group-text'>
              {group.about}
            </div>

            <div className='group-num-of-events'>
              {numEvents === 1 ? `${numEvents} event` : `${numEvents} events`} · {group.privacy ? <span>Private</span> : <span>Public</span>}
            </div>
          </div>

        </div>
      </Link>

    </>
  )
};
