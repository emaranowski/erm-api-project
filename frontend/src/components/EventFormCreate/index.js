import EventForm from '../EventForm';

export default function EventFormCreate() {

    let event = {
        venueId: '',
        name: '',
        type: '',
        capacity: '',
        price: '',
        description: '',
        startDate: '',
        endDate: '',
    }

    return (
        <EventForm event={event} formType='Create Event' />
    );
};
