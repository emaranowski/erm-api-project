import GroupForm from '../GroupForm';

export default function GroupFormCreate() {

    let group = {
        city: '',
        state: '',
        name: '',
        about: '',
        type: '',
        privacy: undefined,
        url: '',
    }

    return (
        <GroupForm group={group} formType='Create Group' />
    );
};
