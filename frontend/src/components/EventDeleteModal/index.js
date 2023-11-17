import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { useModal } from "../../context/Modal";
import { deleteEventThunk } from "../../store/events";
import { useHistory } from "react-router-dom";
import "./EventDeleteModal.css";

export default function EventDeleteModal({ eventId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  const singleGroup = useSelector(state => state.groups.singleGroup);

  let groupId;
  if (singleGroup.id !== undefined && singleGroup.id !== null) {
    groupId = singleGroup.id;
  };

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
        <div className="confirm-delete-text">Do you want to delete this event?</div>
        <button
          className="admin-button-delete-event"
          onClick={deleteEvent}
        >
          Delete event
        </button>
        <button
          className="admin-button-keep-event"
          onClick={closeModal}
        >
          Keep event
        </button>
      </div>
    </>
  )
};
