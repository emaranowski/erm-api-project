import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GroupForm from '../GroupForm';

export default function GroupFormUpdate() {
    const { groupId } = useParams();

    const allGroups = useSelector(state => state.groups.allGroups);
    const group = allGroups[groupId];

    return (
        <GroupForm group={group} formType='Update Group' />
    );
};
