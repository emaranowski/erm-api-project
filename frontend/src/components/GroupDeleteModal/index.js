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
  console.log(`****** groupId is : ******`, groupId)

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
    //   console.log(`*** in group DELETE modal try, res is: ***`, res)
    //   if (res.message === 'Successfully deleted') {
    //     setErrors({});
    //     closeModal();
    //     history.push(`/groups/`);
    //   } else {
    //     return res;
    //   }
    // } catch (res) { // if exception in above code, run .catch()
    //   console.log(`*** in group DELETE modal catch, res is: ***`, res) // TypeError: Failed to execute 'json' on 'Response': body stream already read
    //   const data = await res.json(); // get data from db
    //   console.log(`*** in group DELETE modal catch, data is: ***`, data) // TypeError: Failed to execute 'json' on 'Response': body stream already read
    //   if (data && data.errors) { // if errors from db
    //     setErrors(data.errors); // setErrors
    //   }
    // };

    setErrors({});


    // try {
    //   const res = await dispatch(deleteGroupThunk(groupId)); // VS Code gives note about not needing 'await', but it IS needed here
    //   console.log(`*** in group DELETE modal try, res is: ***`, res)
    //   if (res.message === 'Successfully deleted') {
    //     history.push(`/groups/`);
    //   } else {
    //     return res;
    //   }
    // } catch (res) { // if exception in above code, run .catch()
    //   console.log(`*** in group DELETE modal catch, res is: ***`, res) // TypeError: Failed to execute 'json' on 'Response': body stream already read
    //   const data = await res.json(); // get data from db
    //   console.log(`*** in group DELETE modal catch, data is: ***`, data) // TypeError: Failed to execute 'json' on 'Response': body stream already read
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
        <div className="confirm-delete-header">Confirm Delete</div>
        <div className="confirm-delete-text">Are you sure you want to remove this group?</div>
        <button
          className="admin-button-delete-red"
          onClick={deleteGroup}
        >
          Yes (Delete Group)
        </button>
        <button
          className="admin-button-delete"
          onClick={closeModal}
        >
          No (Keep Group)
        </button>
      </div>
    </>
  );
}

export default GroupDeleteModal;
