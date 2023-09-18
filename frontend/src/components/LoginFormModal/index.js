import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session"; // sessionActions is obj
import "./LoginForm.css";

export default function LoginFormModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");

  const [disabled, setDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // disable button
  useEffect(() => {
    if (credential.length >= 4 && password.length <= 6) setDisabled(false);
    if (credential.length < 4 || password.length < 6) setDisabled(true);
  }, [credential, password]);

  // validations
  // useEffect(() => {
  //   const errsObj = {};

  //   if (credential.length < 4) errsObj.credential = "Username or email must be at least 4 characters"
  //   if (password.length < 6) errsObj.password = "Password must be at least 6 characters"

  //   if (Object.keys(errsObj).length) setDisabled(true);
  //   if (!Object.keys(errsObj).length) setDisabled(false);

  //   setErrors(errsObj);
  // }, [credential, password])

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const handleDemoUser = async (e) => {
    e.preventDefault();
    setErrors({});
    const credential = 'DemoUser1'
    const password = 'password1'
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      })
  };

  return (
    <>
      <div id="modal-log-in-form-box">

        <h1 id="modal-log-in-form-header">Log In</h1>

        <form onSubmit={handleSubmit}>

          {errors.credential && (
            <div className="log-in-error-text">
              {errors.credential}
            </div>
          )}

          <label className="modal-log-in-label">
            <br></br>Username or Email<br></br>
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </label>

          <label className="modal-log-in-label">
            <br></br>Password<br></br>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            id={disabled ? "modal-log-in-button-disabled" : "modal-log-in-button"}
            type="submit"
            disabled={disabled}
          >
            Log In
          </button>
        </form>
        <div>
          <button id='demo-user-btn' onClick={handleDemoUser}>
            Log in as demo user
          </button>
        </div>
      </div>
    </>
  );
};
