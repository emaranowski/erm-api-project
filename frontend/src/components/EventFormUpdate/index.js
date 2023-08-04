import { useParams, Redirect } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleEventThunk } from '../../store/events';
import EventForm from '../EventForm';

export default function EventFormUpdate() { // http://localhost:3000/events/2/update
    const dispatch = useDispatch();
    const { eventId } = useParams();
    // const sessionUser = useSelector(state => state.session.user);
    const session = useSelector(state => state.session);
    console.log(`*** session is: ***`, session)

    const event = useSelector(state => state.events.singleEvent);
    const organizerId = event.organizerId;

    // console.log(`*** sessionUser.id is: ***`, sessionUser.id)
    console.log(`*** organizerId is: ***`, organizerId)

    useEffect(() => {
        dispatch(getSingleEventThunk(eventId));
    }, [dispatch, eventId]);

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
        </>
    );
};
