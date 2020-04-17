import React from 'react';
import { useCookies } from 'react-cookie';
import { makeStyles } from '@material-ui/core/styles';
import pageHeader from '../PageHeader.theme';
import { A } from 'hookrouter';

import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
const useStyles = makeStyles(pageHeader);

const ProfileTooltip = props => {
  const { user } = props;
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <div className={classes.tooltipHeader}>
        <div
          className={classes.avatar}
        >{`${user.first_name[0]}${user.last_name[0]}`}</div>
        <div className={classes.headerInfo}>
          <div
            className={classes.fullName}
          >{`${user.first_name} ${user.last_name}`}</div>
          <div className={classes.email}>{user.email}</div>
        </div>
      </div>
      <div onClick={props.handleProfileAway} className={classes.headerLinks}>
        <A href="/profile">
          <MenuItem className={classes.linkInProfile}>Profile</MenuItem>
        </A>
        <a href="/logout">
          <MenuItem className={classes.linkInProfile}>Log Out</MenuItem>
        </a>
      </div>
    </Paper>
  );
};
export default ProfileTooltip;
