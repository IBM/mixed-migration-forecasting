import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import expandedDetails from './ExpandedDetails.theme';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(expandedDetails);
const ExpandedDetails = props => {
  const classes = useStyles();
  const { indicatorData, backgroundColor, textColor } = props;
  return (
    <ExpansionPanelDetails
      style={{ backgroundColor: backgroundColor || '#666' }}
    >
      <Grid container spacing={3}>
        <Grid item md={9}>
          <Typography
            color="primary"
            component="h6"
            style={{ color: textColor || '#fff' }}
            variant="subtitle1"
          >
            Detail
          </Typography>
          <Typography
            component="p"
            style={{ color: textColor || '#fff' }}
            variant="body1"
          >
            {indicatorData.detail}
          </Typography>
        </Grid>
        <Grid item md={3}>
          <Typography
            color="primary"
            component="h6"
            style={{ color: textColor || '#fff' }}
            variant="subtitle1"
          >
            Last updated
          </Typography>
          <Typography
            component="p"
            style={{ color: textColor || '#fff' }}
            variant="body1"
          >
            {indicatorData['last updated']}
          </Typography>
        </Grid>
      </Grid>
      {/* <div className={classes.expandedBlock} style={{ width: '60%' }}>
        <div>
          <div className={classes.expandedInfo}>
            <div className={classes.infoElement}>Detail</div>
            <div className={classes.infoElement}>
              Last updated
            </div>
          </div>
          <div className={classes.infoContentBlock}>
            <div className={classes.infoElement}>{indicatorData.detail}</div>
            <div className={classes.infoElement}>
              {indicatorData['last updated']}
            </div>
          </div>
        </div>
      </div> */}
    </ExpansionPanelDetails>
  );
};
export default ExpandedDetails;
