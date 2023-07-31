import React, { useEffect, useState } from "react";
import * as sessionActions from "../../store/session"; // sessionActions is obj
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginFormDemo.css";

function LoginFormDemo() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("DemoUser1");
  const [password, setPassword] = useState("password1");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // validations
  useEffect(() => {
    const errsObj = {};

    if (credential.length < 4) errsObj.credential = "Username or email must be at least 4 characters"
    if (password.length < 6) errsObj.password = "Password must be at least 6 characters"

    setErrors(errsObj);
  }, [credential, password])

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

  return (
    <>
      <div id="modal-log-in-form-box">

        <h1 id="modal-log-in-form-header">Log In</h1>

        <form onSubmit={handleSubmit}>

          <label className="modal-log-in-label">
            <br></br>Username or Email<br></br>
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </label>

          {errors.credential && (
            <div className="log-in-error-text">
              {errors.credential}
            </div>
          )}

          <label className="modal-log-in-label">
            <br></br>Password<br></br>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {errors.password && (
            <div className="log-in-error-text">
              {errors.password}
            </div>
          )}

          <button id="modal-log-in-button" type="submit">Log In</button>
        </form>
      </div>
    </>
  );
}

export default LoginFormDemo;
