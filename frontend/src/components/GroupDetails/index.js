import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getSingleGroupThunk } from '../../store/groups';
// import { getAllUsersThunk } from '../../store/session';

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


  // WORKING -- V1
  // const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  // const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  // let previewImageURL;
  // if (groupImages.length) {
  //   previewImageURL = groupImages[0].url;
  // }

  // console.log(`*** group is: ***`, group)
  // console.log(`*** groupImages is: ***`, groupImages)
  // console.log(`*** previewImageURL is: ***`, previewImageURL)


  // WORKING -- V2
  const group = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const groupImages = useSelector(state => state.groups.singleGroup.GroupImages ? state.groups.singleGroup.GroupImages : []); // {}

  let previewImageURL;
  if (groupImages.length) {
    const previewImages = groupImages.filter(image => {
      return image.preview === true;
    })
    previewImageURL = previewImages[0].url;
  }

  // console.log(`*** group is: ***`, group)
  // console.log(`*** groupImages is: ***`, groupImages)
  // console.log(`*** previewImageURL is: ***`, previewImageURL)














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





  ////////////// ORGANIZER NAME //////////////
  const singleGroup = useSelector(state => state.groups.singleGroup ? state.groups.singleGroup : {}); // {}
  const organizerId = singleGroup.organizerId;
  const organizer = singleGroup.Organizer;
  // const organizerFirstName = singleGroup.Organizer.firstName;
  // const organizerLastName = singleGroup.Organizer.lastName;


  // console.log(`*** singleGroup is: ***`, singleGroup)
  // console.log(`*** organizer is: ***`, organizer)

  // if (Object.values(organizer).length) {
  //   const organizerFirstName = singleGroup.Organizer.firstName;
  //   const organizerLastName = singleGroup.Organizer.lastName;
  // }

  let organizerFirstName;
  let organizerLastName;
  if (organizer !== null && organizer !== undefined) {
    organizerFirstName = singleGroup.Organizer.firstName;
    organizerLastName = singleGroup.Organizer.lastName;
  }

  // console.log(`*** organizerFirstName is: ***`, organizerFirstName)
  // console.log(`*** organizerLastName is: ***`, organizerLastName)

  // const allGroups = useSelector(state => state.groups.allGroups ? state.groups.allGroups : {}); // {}
  // console.log(`*** allGroups is: ***`, allGroups)

  // useEffect(() => {
  //   dispatch(getAllUsersThunk());
  // }, [dispatch]);


  ////////////// 'JOIN' BUTTON LOGIC //////////////
  // if user is logged in and created group, 'JOIN' BUTTON should hide
  const currUser = useSelector(state => state.session ? state.session : {}); // {}
  const currUserId = useSelector(state => state.session.user.id ? state.session.user.id : {}); // {}
  console.log(`*** currUser is: ***`, currUser)
  console.log(`*** currUserId is: ***`, currUserId)

  let hideJoinButton = true;
  if (currUserId !== organizerId) hideJoinButton = false;

  // // if not logged in, 'JOIN' BUTTON should hide
  // const sessionUser = useSelector(state => state.session.user);
  // if (!sessionUser) hideJoinButton = true;

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
            Organized by: {organizerFirstName} {organizerLastName}
          </div>

          {hideJoinButton ? null :
            <div id="join-group-button-div">
              <OpenModalButtonJoinGroup
                buttonText="Join this group"
                modalComponent={<JoinGroupModal />} />
            </div>
          }

        </div>
      </div>

      <div className='group-info-box'>

        <div className='group-info-header'>Organizer</div>
        <div className='group-organizer-name'>{organizerFirstName} {organizerLastName}</div>

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
