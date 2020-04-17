//Base imports
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

//Redux
import { initUserDataLoad } from '../../redux/account/actions';
import { USER_DATA_UPDATE } from '../../redux/constRequestURLs';

//Material Ui components
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import { Select } from '@material-ui/core';
import Container from '@material-ui/core/Container';

import UserList from '../UserList/UserList';
//Page styling theme
import profileStyles from './Profile.theme';

const textFieldsdArray = [
  {
    helperText: 'Please specify the first name',
    label: 'First name*',
    element: 'first_name',
    type: 'text',
  },
  {
    helperText: 'Please specify the last name',
    label: 'Last name*',
    element: 'last_name',
    type: 'text',
  },
  {
    label: 'Email Address*',
    element: 'email',
    type: 'text',
  },
  {
    label: 'Organization Name*',
    element: 'org_name',
    type: 'select',
    values: ['IBM', 'DRC', 'Other'],
  },
  {
    label: 'Organization Type',
    element: 'org_type',
    type: 'select',
    values: ['Technology Partner', 'Non-Government Organisation', 'Other'],
  },
  {
    label: 'Role',
    element: 'role',
    type: 'select',
    values: ['Administrator', 'Standard User', 'Reader'],
    disable: true,
  },
];

const useStyle = makeStyles(profileStyles);

const Profile = props => {
  const classes = useStyle();

  const { userData } = props;

  const [textFields, setTextFields] = useState({
    first_name: '',
    last_name: '',
    email: '',
    org_name: '',
    org_type: '',
    role: '',
  });
  const [fieldCount, setFieldCount] = useState(0);

  useEffect(() => {
    setTextFields({
      first_name: userData.userData ? userData.userData.first_name : '',
      last_name: userData.userData ? userData.userData.last_name : '',
      email: userData.userData ? userData.userData.email : '',
      org_name: userData.userData ? userData.userData.org_name : '',
      org_type: userData.userData ? userData.userData.org_type : '',
      role: userData.userData ? userData.userData.role : '',
    });
  }, [userData.userData]);

  useEffect(() => {
    let counter = 0;
    Object.keys(textFields).forEach(el => {
      if (textFields[el].trim()) counter++;
    });
    setFieldCount(counter);
  }, [textFields]);

  const setField = (element, value) => {
    setTextFields({
      ...textFields,
      [element]: value,
    });
  };
  const drawTextFields = () => {
    return textFieldsdArray.map(userInput => (
      <Grid item key={userInput.label} lg={6} md={6} xs={12}>
        {userInput.type === 'text' ? (
          <TextField
            className={classes.textField}
            disabled={userInput.disable ? userInput.disable : false}
            helperText={userInput.helperText}
            // id="outlined-basic"
            label={userInput.label}
            margin="dense"
            onChange={e => {
              setField(userInput.element, e.target.value);
            }}
            value={textFields[userInput.element]}
            variant="outlined"
          />
        ) : (
          <React.Fragment key={userInput.element}>
            <Select
              className={classes.textField}
              disabled={userInput.disable ? userInput.disable : false}
              label={userInput.label}
              native
              onChange={e => {
                setField(userInput.element, e.target.value);
              }}
              value={textFields[userInput.element]}
            >
              {userInput.values.map(value => (
                <option key={value}>{value}</option>
              ))}
            </Select>
            <InputLabel htmlFor="age-native-label-placeholder" shrink>
              {userInput.label}
            </InputLabel>
          </React.Fragment>
        )}
      </Grid>
    ));
  };

  const allFieldsQuantity = Object.keys(textFields).length;
  const fieldsFulled = Math.ceil(
    fieldCount ? 100 / (allFieldsQuantity / fieldCount) : 0,
  );

  const editUsetHandler = (oldUser, newUser) => {
    axios({
      method: 'post',
      url: USER_DATA_UPDATE,
      headers: {},
      data: { oldUser, newUser },
    });
  };
  return (
    <section className={classes.root}>
      <Container className={classes.container} maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item lg={6} md={6} xs={12}>
            <Paper>
              <UserList />
            </Paper>
          </Grid>
          <Grid item lg={6} md={6} xs={12}>
            <Paper>
              <Box className={classes.leftContainer}>
                <Box className={classes.contentContainer}>
                  <Box className={classes.timeAndIcon}>
                    <Box className={classes.profileTime}>01:02 PM (GTM-7)</Box>
                    <Box className={classes.profileIconContainer}>
                      <Box className={classes.profileIcon}>
                        {textFields.first_name.length &&
                        textFields.last_name.length
                          ? `${textFields.first_name[0]}${textFields.last_name[0]}`
                          : ''}
                      </Box>
                    </Box>
                  </Box>
                  <Box className={classes.profileCompleted}>
                    {`Profile completeness: ${fieldsFulled}%`}
                    <LinearProgress
                      value={fieldsFulled}
                      variant="determinate"
                    />
                  </Box>
                </Box>

                <Box className={classes.buttonsContainer}>
                  <input
                    accept="image/*"
                    className={classes.input}
                    id="raised-button-file"
                    style={{ display: 'none' }}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      className={classes.button}
                      color="primary"
                      component="span"
                    >
                      Upload picture
                    </Button>
                  </label>
                  <Button color="default" size="large">
                    REMOVE PICTURE
                  </Button>
                </Box>
              </Box>
            </Paper>
            <Paper className={classes.infoPaper} style={{ marginTop: '20px' }}>
              <Box className={classes.rightContainer}>
                <Box className={classes.infoHeader}>
                  <Box className={classes.infoHeaderProfile}>Profile</Box>
                  <Box className={classes.infoHeaderEdit}>
                    The information can be edited
                  </Box>
                </Box>
                <Box className={classes.inputsBlock}>
                  <Grid container spacing={1}>
                    {drawTextFields()}
                  </Grid>
                </Box>
                <Box className={classes.saveBtnBlock}>
                  <Button
                    className={classes.btnSave}
                    color="primary"
                    onClick={() => {
                      editUsetHandler(userData.userData, textFields);
                    }}
                    size="large"
                    variant="contained"
                  >
                    save details
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

const mapStateToProps = state => {
  return {
    userData: state.userDataStore,
  };
};

export default connect(mapStateToProps, null)(Profile);
