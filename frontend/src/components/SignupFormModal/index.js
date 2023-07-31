import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // validations
  useEffect(() => {
    const errsObj = {};

    if (!email.length) errsObj.email = "Email is required"
    if (username.length < 4) errsObj.username = "Username must be at least 4 characters"
    if (!username.length) errsObj.username = "Username is required"
    if (!firstName.length) errsObj.firstName = "First name is required"
    if (!lastName.length) errsObj.lastName = "Last name is required"
    if (!confirmPassword.length) errsObj.confirmPassword = "Confirmed password is required"
    if (password.length < 6) errsObj.password = "Password must be at least 6 characters"
    if (!password.length) errsObj.password = "Password is required"

    if (Object.keys(errsObj).length) setDisabled(true);
    if (!Object.keys(errsObj).length) setDisabled(false);

    setErrors(errsObj);
  }, [email, username, firstName, lastName, password, confirmPassword])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  return (
    <>
      <div id="modal-sign-up-form-box">
        <h1 id="modal-sign-up-form-header">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <label className="modal-sign-up-label">
            <br></br>Email<br></br>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {errors.email && <div className="sign-up-error-text">{errors.email}</div>}
          <label className="modal-sign-up-label">
            <br></br>Username<br></br>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          {errors.username && <div className="sign-up-error-text">{errors.username}</div>}
          <label className="modal-sign-up-label">
            <br></br>First Name<br></br>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          {errors.firstName && <div className="sign-up-error-text">{errors.firstName}</div>}
          <label className="modal-sign-up-label">
            <br></br>Last Name<br></br>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
          {errors.lastName && <div className="sign-up-error-text">{errors.lastName}</div>}
          <label className="modal-sign-up-label">
            <br></br>Password<br></br>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors.password && <div className="sign-up-error-text">{errors.password}</div>}
          <label className="modal-sign-up-label">
            <br></br>Confirm Password<br></br>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {errors.confirmPassword && (
            <div className="sign-up-error-text">{errors.confirmPassword}</div>
          )}

          <button
            // id="modal-sign-up-button"
            id={disabled ? "modal-sign-up-button-disabled" : "modal-sign-up-button"}
            type="submit"
            disabled={disabled}
          >
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
}

export default SignupFormModal;
