import { useParams, Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleGroupThunk } from '../../store/groups';
import GroupForm from '../GroupForm';

export default function GroupFormUpdate() { // http://localhost:3000/groups/2/update
    const dispatch = useDispatch();
    const { groupId } = useParams();
    // const sessionUser = useSelector(state => state.session.user);
    const session = useSelector(state => state.session);
    console.log(`*** session is: ***`, session)

    const group = useSelector(state => state.groups.singleGroup);
    const organizerId = group.organizerId;

    // console.log(`*** sessionUser.id is: ***`, sessionUser.id)
    console.log(`*** organizerId is: ***`, organizerId)

    useEffect(() => {
        dispatch(getSingleGroupThunk(groupId));
    }, [dispatch, groupId]);

    if (!session.user) return <Redirect to="/" />;

    let hideGroupFormUpdate = true;
    if (session.user === null) { // logged out
        hideGroupFormUpdate = true;
    } else if (session.user !== null && session.user !== undefined) { // logged in
        const sessionUserId = session.user.id; // must create in block, after confirming !null && !undefined
        if (sessionUserId === organizerId) hideGroupFormUpdate = false; // logged in + created group: so display admin btns
    }

    if (hideGroupFormUpdate) return <Redirect to="/" />;

    return (
        <>
            {!hideGroupFormUpdate ? <GroupForm group={group} formType='Update Group' /> : <div>403 Forbidden</div>}

            {/* <GroupForm group={group} formType='Update Group' /> */}
        </>
    );
};


/////////// before 2023-08-02:

// export default function GroupFormUpdate() { // http://localhost:3000/groups/2/update
//     const dispatch = useDispatch();
//     const { groupId } = useParams();
//     // const sessionUser = useSelector(state => state.session.user);
//     const session = useSelector(state => state.session);
//     console.log(`*** session is: ***`, session)

//     const group = useSelector(state => state.groups.singleGroup);
//     const organizerId = group.organizerId;

//     // console.log(`*** sessionUser.id is: ***`, sessionUser.id)
//     console.log(`*** organizerId is: ***`, organizerId)

//     useEffect(() => {
//         dispatch(getSingleGroupThunk(groupId));
//     }, [dispatch, groupId]);

//     // if (!sessionUser) return <Redirect to="/" />;

//     // let hideGroupFormUpdate = true;
//     // if (sessionUser === null) { // logged out
//     //     hideGroupFormUpdate = true;
//     // } else if (sessionUser !== null && sessionUser !== undefined) { // logged in
//     //     const sessionUserId = sessionUser.id; // must create in block, after confirming !null && !undefined
//     //     if (sessionUserId === organizerId) hideGroupFormUpdate = false; // logged in + created group: so display admin btns
//     // }

//     // if (hideGroupFormUpdate) return <Redirect to="/" />;

//     return (
//         <>
//             {/* {!hideGroupFormUpdate ? <GroupForm group={group} formType='Update Group' /> : <div>403 Forbidden</div>} */}

//             <GroupForm group={group} formType='Update Group' />
//         </>
//     );
// };
