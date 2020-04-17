const loginModal = theme => ({
  loginContainer: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  textField: {
    width: '100%',
    height: '55px',
  },
  incorrectUser: {
    color: 'red',
    fontSize: '11px',
  },
});
export default loginModal;
