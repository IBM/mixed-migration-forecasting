import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import { finishUserListDataLoad } from '../../redux/userList/actions';
import Divider from '@material-ui/core/Divider';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { initUserListDataLoad } from '../../redux/userList/actions';
import { initUserAction } from '../../redux/userConfigurations/actions';
import { initModal } from '../../redux/ui/Modal/actions';
import { START_USER_ACTION_DELETE } from '../../redux/actionTypes';

import userListTheme from './UserList.theme';

const useStyles = makeStyles(userListTheme);

const UserListPage = props => {
  const classes = useStyles();
  const [currentListData, setCurrentListData] = useState([]);
  const { userList, isLoading } = props;
  let userData = userList.userList;

  useEffect(() => {
    props.initUserListLoad();
  }, []);

  useEffect(() => {
    if (userData && userData.length) {
      setCurrentListData(userData);
    }
  }, [props.userList, userData]);

  const filteredList = e => {
    let userListData = userData.filter(
      item =>
        item.first_name.toLowerCase().search(e.target.value.toLowerCase()) !==
          -1 ||
        item.last_name.toLowerCase().search(e.target.value.toLowerCase()) !==
          -1,
    );
    setCurrentListData(userListData);
  };

  const replaceUserList = (userList, id) => {
    return userList.filter(user => user._id !== id);
  };

  const updatesAfterDelete = async user => {
    await props.makeUserAction({
      type: START_USER_ACTION_DELETE,
      data: { user },
    });
    props.initUserListLoad();
    // await setCurrentListData(replaceUserList(currentListData, user._id));
    // await props.finishUserListDataLoad(
    //   replaceUserList(currentListData, user._id),
    // );
  };

  const drawUserList = data => {
    if (data && data.length) {
      return data.map(user => (
        <div key={user.email}>
          <ListItem className={classes.listItem}>
            <div className={classes.avatarAndDescription}>
              <ListItemAvatar>
                <div
                  className={classes.userAvatar}
                >{`${user.first_name[0]}${user.last_name[0]}`}</div>
              </ListItemAvatar>

              <ListItemText
                primary={`${user.first_name}  ${user.last_name}`}
                secondary={
                  <React.Fragment>
                    <Typography
                      className={classes.inline}
                      color="textPrimary"
                      component="span"
                      variant="body2"
                    >
                      Email: {` ${user.email}`}
                    </Typography>
                    <Typography
                      className={classes.inline}
                      color="textPrimary"
                      component="span"
                      variant="body2"
                    >
                      Organization Name:{user.org_name}
                    </Typography>
                    <Typography
                      className={classes.inline}
                      color="textPrimary"
                      component="span"
                      variant="body2"
                    >
                      Organization Type:{user.org_type}
                    </Typography>
                  </React.Fragment>
                }
              />
            </div>
            {props.userData &&
            props.userData.userData &&
            props.userData.userData.role === 'Administrator' ? (
              <div className={classes.configButtonsBlock}>
                <Button
                  className={classes.button}
                  onClick={() => {
                    props.initModal({ type: 'userEdit', data: user });
                  }}
                  variant="contained"
                >
                  Edit
                </Button>
                <Button
                  className={classes.button}
                  onClick={() => {
                    updatesAfterDelete(user);
                  }}
                  variant="contained"
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </ListItem>
          <Divider component="li" variant="inset" />
        </div>
      ));
    }
  };

  return (
    <div>
      <div className={classes.userControlsBlock}>
        <TextField
          className={classes.textField}
          helperText="Please input user name"
          label="User Name*"
          margin="dense"
          onChange={filteredList}
          variant="outlined"
        />
        {props.userData &&
        props.userData.userData &&
        props.userData.userData.role === 'Administrator' ? (
          <Button
            color="primary"
            fullWidth
            onClick={() => {
              props.initModal({ type: 'userEdit', data: '' });
            }}
            variant="contained"
          >
            Create User
          </Button>
        ) : null}
      </div>

      <List>{!isLoading && drawUserList(currentListData)}</List>
    </div>
  );
};
const mapStateToProps = state => ({
  userList: state.userListStore,
  userData: state.userDataStore,
});

const mapDispatchToProps = dispatch => ({
  makeUserAction: data => dispatch(initUserAction(data)),
  initUserListLoad: () => dispatch(initUserListDataLoad()),
  initModal: data => dispatch(initModal(data)),
  finishUserListDataLoad: data => dispatch(finishUserListDataLoad(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(UserListPage);
