import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const SubTitle = ({ children, style }) => {
  return (
    <Typography
      color="primary"
      component="h6"
      gutterBottom
      style={{ color: '#cc051f', ...style }}
      variant="subtitle1"
    >
      {children}
    </Typography>
  );
};

SubTitle.propTypes = {
  children: PropTypes.node,
};

export default SubTitle;
