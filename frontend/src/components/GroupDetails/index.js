import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getSingleGroupThunk } from '../../store/groups';

import OpenModalButtonJoinGroup from '../../components/OpenModalButtonJoinGroup';
import JoinGroupModal from '../../components/JoinGroupModal';

import './GroupDetails.css';

export default function GroupDetails() {
  const { groupId } = useParams();

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


  // WORKING
  const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  let previewImageURL;
  if (groupImages.length) {
    previewImageURL = groupImages[0].url;
  }

  console.log(`*** group is: ***`, group)
  console.log(`*** groupImages is: ***`, groupImages)
  console.log(`*** previewImageURL is: ***`, previewImageURL)


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

  return (
    <>
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
            # events · {group.privacy ? <span>Private</span> : <span>Public</span>}
          </div>
          <div className='group-detail-organized-by'>
            Organized by {group.organizerId}
          </div>

          <div id="join-group-button-div">
            <OpenModalButtonJoinGroup
              buttonText="Join this group"
              modalComponent={<JoinGroupModal />}
            />
          </div>
        </div>
      </div>

      <div className='group-info-box'>

        <div className='group-info-header'>Organizer</div>
        <div className='group-organizer-name'>Organizer Name {group.organizerId}</div>

        <div className='group-info-header'>What we're about</div>
        <div className='group-info-text'>
          {group.about}
        </div>

        <div className='group-info-header'>Upcoming Events (#)</div>

        <div className='group-info-header'>Past Events (#)</div>

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
    </>
  )
}
