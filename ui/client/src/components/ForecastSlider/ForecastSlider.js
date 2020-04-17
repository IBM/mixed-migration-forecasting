import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
// import Input from '@material-ui/core/Input';

const useStyles = makeStyles({
  input: {
    width: 42,
  },
  slider: {
    padding: 24,
    margin: '0 auto',
  },
});

const marks = [
  {
    value: 0,
    label: 'worse',
  },
  {
    value: 25,
    label: 'poor',
  },
  {
    value: 50,
    label: 'average',
  },
  {
    value: 75,
    label: 'good',
  },
  {
    value: 100,
    label: 'best',
  },
];

function valueLabelFormat(value, tempMarks) {
  const targetValue = tempMarks.find(mark => mark.value === value);
  return targetValue ? targetValue.label : 'poor';
}

const ForecastSlider = props => {
  const classes = useStyles();
  const { value, handleChange, tempMarks } = props;
  const handleSliderChange = (event, newValue) => {
    handleChange(valueLabelFormat(newValue, tempMarks));
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom id="input-slider">
        {props.title}
      </Typography>
      {tempMarks.length > 0 ? (
        <Grid alignItems="center" container justify="space-between">
          <Grid className={classes.slider} item xs={12}>
            <Slider
              defaultValue={tempMarks.find(mark => mark.label === value).value}
              marks={tempMarks}
              onChange={handleSliderChange}
              step={25}
              style={{ color: '#cc051f' }}
              valueLabelDisplay="off"
            />
          </Grid>
        </Grid>
      ) : null}
    </div>
  );
};

export default ForecastSlider;
