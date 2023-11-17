import React, { useEffect, useState } from "react";
import * as sessionActions from "../../store/session"; // sessionActions is obj
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { useParams } from 'react-router-dom';
import { deleteGroupThunk } from "../../store/groups";
import { useHistory } from "react-router-dom";
import "./GroupDeleteModal.css";

function GroupDeleteModal({ groupId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  // const { groupId } = useParams();

  const [errors, setErrors] = useState('');

  const deleteGroup = async (e) => {
    e.preventDefault();

    setErrors({});

    // return dispatch(sessionActions.login({ credential, password }))
    //   .then(closeModal)
    //   .catch(async (res) => {
    //     const data = await res.json();
    //     if (data && data.errors) {
    //       setErrors(data.errors);
    //     }
    //   });

    // successfully deletes, but does not close modal
    // try {
    //   const res = await dispatch(deleteGroupThunk(groupId)); // VS Code gives note about not needing 'await', but it IS needed here
    //   if (res.message === 'Successfully deleted') {
    //     setErrors({});
    //     closeModal();
    //     history.push(`/groups/`);
    //   } else {
    //     return res;
    //   }
    // } catch (res) { // if exception in above code, run .catch()
    //   const data = await res.json(); // get data from db
    //   if (data && data.errors) { // if errors from db
    //     setErrors(data.errors); // setErrors
    //   }
    // };

    setErrors({});


    // try {
    //   const res = await dispatch(deleteGroupThunk(groupId)); // VS Code gives note about not needing 'await', but it IS needed here
    //   if (res.message === 'Successfully deleted') {
    //     history.push(`/groups/`);
    //   } else {
    //     return res;
    //   }
    // } catch (res) { // if exception in above code, run .catch()
    //   const data = await res.json(); // get data from db
    //   if (data && data.errors) { // if errors from db
    //     setErrors(data.errors); // setErrors
    //   }
    // };


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


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setErrors({});
  //   return dispatch(sessionActions.login({ credential, password }))
  //     .then(closeModal)
  //     .catch(async (res) => {
  //       const data = await res.json();
  //       if (data && data.errors) {
  //         setErrors(data.errors);
  //       }
  //     });
  // };

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
  );
}

export default GroupDeleteModal;
