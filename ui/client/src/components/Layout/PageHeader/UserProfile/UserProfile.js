import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { A } from 'hookrouter';
import pageHeaderTheme from '../PageHeader.theme';
import ProfileTooltip from './ProfileTooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(pageHeaderTheme);

const UserProfile = props => {
  const { user } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleProfile = () => {
    setOpen(prevState => !prevState);
  };

  const handleProfileAway = () => {
    setOpen(false);
  };

  return (
    <div className={classes.selectAndIconContainer}>
      {user ? (
        <ClickAwayListener onClickAway={handleProfileAway}>
          <div className={classes.wrapper}>
            <Button
              className={classes.profile}
              onClick={handleProfile}
              type="button"
            >
              {`${user.first_name[0]}${user.last_name[0]}`}
            </Button>
            {open ? (
              <ProfileTooltip
                user={user}
                handleProfileAway={handleProfileAway}
              />
            ) : null}
          </div>
        </ClickAwayListener>
      ) : null}
    </div>
  );
};
export default UserProfile;
