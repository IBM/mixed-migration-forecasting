//Base imports
import React from 'react';

//Material UI components
import GridOnIcon from '@material-ui/icons/GridOn';
import BarChartSharpIcon from '@material-ui/icons/BarChartSharp';

const ChangeViewButton = ({ listView = false, onViewChange, className }) => {
  const button = listView ? (
    <GridOnIcon onClick={onViewChange} style={{ cursor: 'pointer' }} />
  ) : (
    <BarChartSharpIcon onClick={onViewChange} style={{ cursor: 'pointer' }} />
  );
  return <div className={className}>{button}</div>;
};
export default ChangeViewButton;
