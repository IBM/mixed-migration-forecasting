import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { initUserDataLoad } from '../../../../redux/account/actions';
import { useCookies } from 'react-cookie';

import loginModal from './LoginModal.theme';
const useStyle = makeStyles(loginModal);

const LoginModal = props => {
  const classes = useStyle();

  const [, setCookie] = useCookies(['user']);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isCheck, setIsCheck] = useState(false);
  const [error, setError] = useState({
    email: {
      error: false,
      errorText: 'incorrect input',
    },
    password: {
      error: false,
      errorText: 'incorrect input',
    },
  });
  const { isVisible, hideModal, userData } = props;

  const setCookieEmail = newName => {
    setCookie('user', newName, { path: '/' });
  };

  const loginDataRequest = async () => {
    await props.initUserDataLoad({
      userData: {
        email: userEmail,
      },
    });
    await setIsCheck(true);
  };

  const setEmailhandler = event => {
    setUserEmail(event.target.value);
  };

  const setPasswordhandler = event => {
    setUserPassword(event.target.value);
  };

  useEffect(() => {
    if (userData.userData) {
      setCookieEmail(userEmail);
      hideModal();
      setError(false);
    } else if (isCheck && !userData.userData && !userData.isLoading) {
      if (!userEmail.length) {
        setError({
          ...error,
          email: {
            error: true,
            errorText: 'Email is empty',
          },
        });
      } else {
        setError({
          ...error,
          email: {
            error: true,
            errorText: "Email isn't correct",
          },
        });
      }
    }
  }, [userData, isCheck, userEmail, hideModal, error]);
  return (
    <Modal className={classes.modal} onClose={hideModal} open={isVisible}>
      <div className={classes.modalContainer}>
        <TextField
          className={classes.textField}
          error={error.email && error.email.error ? true : false}
          helperText={
            error.email && error.email.error
              ? error.email.errorText
              : 'Input your email'
          }
          label="Email"
          margin="dense"
          onChange={setEmailhandler}
          value={userEmail}
          variant="outlined"
        />
        <TextField
          className={classes.textField}
          error={error.password && error.password.error ? true : false}
          helperText={
            error.password && error.password.error
              ? error.password.errorText
              : 'Input your password'
          }
          label="Password"
          margin="dense"
          onChange={setPasswordhandler}
          type="password"
          value={userPassword}
          variant="outlined"
        />
        <Button
          color="primary"
          onClick={loginDataRequest}
          style={{ marginTop: '15px' }}
          variant="contained"
        >
          Login
        </Button>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  userData: state.userDataStore,
});
const mapDispatchToProps = dispatch => ({
  initUserDataLoad: data => dispatch(initUserDataLoad(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
