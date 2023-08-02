import { Link } from 'react-router-dom';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// import { getAllGroupsThunk } from '../../store/groups';

import './GroupCard.css';

export default function GroupCard({ group }) {

  console.log(group)

  return (
    <Link to={`/groups/${group.id}`}>
      <div className='group-card'>
        <div className='group-img'>
          [ image ]
        </div>
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
            # events
          </div>
          <div className='group-privacy'>
            {group.privacy ? <span>Private</span> : <span>Public</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
