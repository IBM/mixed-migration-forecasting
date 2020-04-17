import React from 'react';
import { connect } from 'react-redux';
import { hideModal } from '../../../redux/ui/Modal/actions';
import UserEditModal from '../../Layout/ModalWindows/UserEditModal/UserEditModal';
import LoginModal from '../../Layout/ModalWindows/LoginModal/LoginModal';

const modalTypes = {
  userEdit: UserEditModal,
  login: LoginModal,
};
const ModalWindow = props => {
  const { type, isVisible, data } = props.modal;

  const ModalComponent = modalTypes[type];
  return ModalComponent ? (
    <ModalComponent
      data={data}
      hideModal={props.hideModal}
      isVisible={isVisible}
    />
  ) : null;
};

const mapStateToProps = state => ({
  modal: state.modalStore,
});

const mapDispatchToProps = dispatch => ({
  hideModal: () => dispatch(hideModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalWindow);
