import React, { useEffect, useState } from "react";
import * as sessionActions from "../../store/session"; // sessionActions is obj
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { useModal } from "../../context/Modal";
import { deleteEventThunk } from "../../store/events";
import { useHistory } from "react-router-dom";
import "./EventDeleteModal.css";

function EventDeleteModal({ eventId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();

  const singleGroup = useSelector(state => state.groups.singleGroup);
  let groupId;
  if (singleGroup.id !== undefined && singleGroup.id !== null) {
    groupId = singleGroup.id;
  };
  // console.log(`****** groupId is : ******`, groupId);

  const [errors, setErrors] = useState('');

  const deleteEvent = async (e) => {
    e.preventDefault();

    setErrors({});

    return dispatch(deleteEventThunk(eventId))
      .then(closeModal)
      .then(() => {
        history.push(`/groups/${groupId}`);
      })
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });

  };

  return (
    <>
      <div className="event-delete-modal">
        <div className="confirm-delete-header">Confirm Delete</div>
        <div className="confirm-delete-text">Are you sure you want to remove this event?</div>
        <button
          className="admin-button-delete-red"
          onClick={deleteEvent}
        >
          Yes (Delete Event)
        </button>
        <button
          className="admin-button-delete"
          onClick={closeModal}
        >
          No (Keep Event)
        </button>
      </div>
    </>
  );
}

export default EventDeleteModal;
