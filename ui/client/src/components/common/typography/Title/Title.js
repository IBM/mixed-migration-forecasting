import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const Title = ({ children, style }) => {
  return (
    <Typography
      color="primary"
      component="h6"
      gutterBottom
      style={{ color: '#cc051f', ...style }}
      variant="h6"
    >
      {children}
    </Typography>
  );
};

Title.propTypes = {
  children: PropTypes.node,
};

export default Title;
