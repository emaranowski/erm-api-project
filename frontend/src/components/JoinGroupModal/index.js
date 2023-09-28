import React, { useEffect, useState } from "react";
import * as sessionActions from "../../store/session"; // sessionActions is obj
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./JoinGroupModal.css";

function JoinGroupModal() {
  const dispatch = useDispatch();

  return (
    <>
      <div className="feature-coming-soon">
        Feature coming soon
      </div>
    </>
  );
}

export default JoinGroupModal;
