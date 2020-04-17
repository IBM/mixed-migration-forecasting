import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import bubbleMarker from './BubbleMarker.theme';
const useStyle = makeStyles(bubbleMarker);

const BubbleMarker = props => {
  const classes = useStyle();
  return (
    <div
      className={classes.marker}
      onClick={props.onClick}
      onMouseEnter={props.onEnterMarker}
      onMouseLeave={props.onLeaveMarker}
      style={props.style}
    >
      {props.children}
    </div>
  );
};
export default BubbleMarker;
