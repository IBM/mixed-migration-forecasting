const userListTheme = theme => ({
  userAvatar: {
    display: 'flex',
    marginRight: '12px',
    height: '100px',
    width: '100px',
    justifyContent: 'center',
    textTransform: 'uppercase',
    alignItems: 'center',
    background: 'lightblue',
    borderRadius: '50%',
    color: 'white',
    fontSize: '28px',
  },
  listItem: {
    display: 'block',
    justifyContent: 'space-between',
  },
  avatarAndDescription: {
    display: 'flex',
  },
  textField: {
    width: '100%',
  },
  inline: {
    display: 'block',
  },
  button: {
    margin: theme.spacing(1),
  },
  configButtonsBlock: {
    textAlign: 'right',
  },
});

export default userListTheme;
