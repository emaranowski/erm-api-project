import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { deleteGroupThunk } from "../../store/groups";
import { useHistory } from "react-router-dom";
import "./GroupDeleteModal.css";

export default function GroupDeleteModal({ groupId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  const [errors, setErrors] = useState('');

  const deleteGroup = async (e) => {
    e.preventDefault();

    setErrors({});

    return dispatch(deleteGroupThunk(groupId))
      .then(closeModal)
      .then(() => {
        history.push(`/groups/`);
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
      <div className="group-delete-modal">
        <div className="confirm-delete-header">Delete Group</div>
        <div className="confirm-delete-text">Do you want to delete this group?</div>
        <button
          className="admin-button-delete-red"
          onClick={deleteGroup}
        >
          Delete
        </button>
        <button
          className="admin-button-delete"
          onClick={closeModal}
        >
          Keep
        </button>
      </div>
    </>
  )
};
