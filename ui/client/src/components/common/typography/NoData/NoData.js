import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const NoData = ({ children }) => {
  return (
    <Typography
      align="center"
      color="textSecondary"
      component="h5"
      variant="h5"
    >
      {children}
    </Typography>
  );
};

NoData.propTypes = {
  children: PropTypes.node,
};

export default NoData;
