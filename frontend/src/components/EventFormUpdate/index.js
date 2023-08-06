import { useParams, Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleGroupThunk } from '../../store/groups';
import { getSingleEventThunk } from '../../store/events';
import EventForm from '../EventForm';

export default function EventFormUpdate() {
    const dispatch = useDispatch();
    const { groupId, eventId } = useParams();
    // const sessionUser = useSelector(state => state.session.user);
    const session = useSelector(state => state.session);
    // console.log(`*** session is: ***`, session)
    // console.log(`*** groupId is: ***`, groupId)
    // console.log(`*** eventId is: ***`, eventId)

    const group = useSelector(state => state.groups.singleGroup);
    const event = useSelector(state => state.events.singleEvent);
    const organizerId = group.organizerId;
    // console.log(`*** group is: ***`, group)
    // console.log(`*** event is: ***`, event)
    // console.log(`*** organizerId is: ***`, organizerId)

    // console.log(`*** sessionUser.id is: ***`, sessionUser.id)
    // console.log(`*** organizerId is: ***`, organizerId)

    useEffect(() => {
        dispatch(getSingleGroupThunk(groupId));
        dispatch(getSingleEventThunk(eventId));
    }, [dispatch, groupId, eventId]);

    if (!session.user) return <Redirect to="/" />;

    let hideEventFormUpdate = true;
    if (session.user === null) { // logged out
        hideEventFormUpdate = true;
    } else if (session.user !== null && session.user !== undefined) { // logged in
        const sessionUserId = session.user.id; // must create in block, after confirming !null && !undefined
        if (sessionUserId === organizerId) hideEventFormUpdate = false; // logged in + created event: so display admin btns
    }

    if (hideEventFormUpdate) return <Redirect to="/" />;

    return (
        <>
            {!hideEventFormUpdate ? <EventForm event={event} formType='Update Event' /> : <div>403 Forbidden</div>}

            {/* {!false ? <EventForm event={event} formType='Update Event' /> : <div>403 Forbidden</div>} */}

        </>
    );
};
