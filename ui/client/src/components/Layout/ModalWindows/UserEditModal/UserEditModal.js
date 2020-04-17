import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  START_USER_ACTION_EDIT,
  START_USER_ACTION_CREATE,
} from '../../../../redux/actionTypes';
import { finishUserListDataLoad } from '../../../../redux/userList/actions';
import { initUserAction } from '../../../../redux/userConfigurations/actions';
import { initUserListDataLoad } from '../../../../redux/userList/actions';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { useForm } from 'react-hook-form';

import userEditModal from './UserEditModal.theme';
const useStyle = makeStyles(userEditModal);

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
    label: 'Password',
    element: 'password',
    type: 'password',
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
  },
];

const UserEditModal = props => {
  const classes = useStyle();
  const { isVisible, hideModal, data, userList } = props;
  const { register, handleSubmit, errors, reset, watch } = useForm();
  const [selectFields, setSelectFields] = useState({
    org_name: textFieldsdArray.filter(el => el.element === 'org_name')[0]
      .values[0],
    org_type: textFieldsdArray.filter(el => el.element === 'org_type')[0]
      .values[0],
    role: textFieldsdArray.filter(el => el.element === 'role')[0].values[0],
  });

  const updateSelectValue = (select, value) => {
    setSelectFields({
      ...selectFields,
      [select]: value,
    });
  };
  const hasError = inputName => !!(errors && errors[inputName]);

  let watchObject = {};
  watchObject.first_name = watch('first_name', data ? data.first_name : '');
  watchObject.last_name = watch('last_name', data ? data.last_name : '');
  watchObject.email = watch('email', data ? data.email : '');
  watchObject.password = watch('password', data ? data.password : '');
  watchObject.org_name = watch('org_name', data ? data.org_name : '');
  watchObject.org_type = watch('org_type', data ? data.org_type : '');
  watchObject.role = watch('role', data ? data.role : '');

  const replaceUserList = (userList, currentUser) => {
    return userList.map(user => {
      if (user.email === currentUser.email) {
        user = currentUser;
      }
      return user;
    });
  };
  const addNewUserToList = (userList, newUser) => {
    delete newUser._id;
    userList.push(newUser);
    return userList;
  };

  const onSubmit = async () => {
    if (data) {
      await props.makeUserAction({
        type: START_USER_ACTION_EDIT,
        data: { oldUser: data, newUser: { ...watchObject, ...selectFields } },
      });
      // await props.setUserListData(
      //   replaceUserList(userList.userList, { ...watchObject, ...selectFields }),
      // );
    } else {
      await props.makeUserAction({
        type: START_USER_ACTION_CREATE,
        data: { user: { ...watchObject, ...selectFields } },
      });
      // await props.setUserListData(
      //   addNewUserToList(userList.userList, {
      //     ...watchObject,
      //     ...selectFields,
      //   }),
      // );
    }
    props.initUserListLoad();
    hideModal();
  };
  let filteredArrayList;
  if (data) {
    filteredArrayList = textFieldsdArray.filter(
      field => field.type !== 'password',
    );
  } else {
    filteredArrayList = textFieldsdArray;
  }
  return (
    <Modal className={classes.modal} onClose={hideModal} open={isVisible}>
      <form
        autoComplete="off"
        className={classes.container}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={classes.modalContainer}>
          <div className={classes.fieldsContainer}>
            {filteredArrayList.map(field =>
              field.type === 'text' || field.type === 'password' ? (
                <TextField
                  autoComplete="new-password"
                  className={classes.textField}
                  error={hasError(field.element)}
                  helperText={
                    hasError(field['label']) && `${field['label']} is mandatory`
                  }
                  inputRef={register({ required: true })}
                  key={field['element']}
                  label={field['label']}
                  name={field.element}
                  type={field.type}
                  value={watchObject[field.element]}
                />
              ) : (
                <React.Fragment key={field.element}>
                  <Select
                    className={classes.textField}
                    disabled={field.disable ? field.disable : false}
                    inputRef={register({ required: true })}
                    label={field['label']}
                    name={field.element}
                    native
                    onChange={e => {
                      updateSelectValue(field.element, e.target.value);
                    }}
                    value={watchObject[field.element]}
                  >
                    {field.values.map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </Select>
                  <InputLabel htmlFor="age-native-label-placeholder" shrink>
                    {field['label']}
                  </InputLabel>
                </React.Fragment>
              ),
            )}
          </div>
          <div>
            <Button
              className={classes.button}
              color="primary"
              type="submit"
              variant="contained"
            >
              {data ? 'Edit' : 'Create'}
            </Button>
            <Button
              className={classes.button}
              onClick={reset}
              variant="contained"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
const mapStateToProps = state => ({
  userList: state.userListStore,
});
const mapDispatchToProps = dispatch => ({
  makeUserAction: data => dispatch(initUserAction(data)),
  setUserListData: data => dispatch(finishUserListDataLoad(data)),
  initUserListLoad: () => dispatch(initUserListDataLoad()),
});
export default connect(mapStateToProps, mapDispatchToProps)(UserEditModal);
