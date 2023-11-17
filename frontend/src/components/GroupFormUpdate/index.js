import { useParams, Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleGroupThunk } from '../../store/groups';
import GroupForm from '../GroupForm';

export default function GroupFormUpdate() {
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const session = useSelector(state => state.session);
  const group = useSelector(state => state.groups.singleGroup);

  useEffect(() => {
    dispatch(getSingleGroupThunk(groupId));
  }, [dispatch, groupId]);

  if (!session.user) return <Redirect to="/" />;

  let hideGroupFormUpdate = true;
  if (session.user === null) { // logged out
    hideGroupFormUpdate = true; // hide
  } else if (session.user !== null && session.user !== undefined) { // logged in
    if (session.user.id === group.organizerId) { // user is group organizer/creator
      hideGroupFormUpdate = false; // display
    }
  }

  if (hideGroupFormUpdate) return <Redirect to="/" />;

  return (
    <>
      {hideGroupFormUpdate ?
        <div>403 Forbidden</div>
        : <GroupForm group={group} formType='Update Group' />
      }
    </>
  );
};
