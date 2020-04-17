import React from 'react';
import numeral from 'numeral';

import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import RemoveIcon from '@material-ui/icons/Remove';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Box from '@material-ui/core/Box';

const KPICard = props => {
  const { countryName, currentInd, classes, countryDataArray } = props;
  let indValueChange = 0;
  if (countryDataArray.length > 1) {
    const currentVal = countryDataArray[countryDataArray.length - 1].yeild || 0;
    const prevVal = countryDataArray[countryDataArray.length - 2].yeild || 0;
    indValueChange = currentVal - prevVal;
  }
  return (
    <Card>
      <CardContent style={{ display: 'flex', flexDirection: 'row' }}>
        <Box>
          <Typography
            className={classes.title}
            color="primary"
            gutterBottom
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
            variant="h6"
          >
            {countryName}
          </Typography>
          <Typography component="h2" gutterBottom variant="h5">
            <q>{currentInd}</q>
          </Typography>
          <Typography
            align="left"
            component="h6"
            gutterBottom
            style={{ display: 'flex', alignItems: 'flex-end' }}
            variant="h6"
          >
            {countryDataArray[countryDataArray.length - 1]
              ? countryDataArray[countryDataArray.length - 1].year
              : 2018}
            :
            <Typography
              align="left"
              component="p"
              style={{
                color: '#fc7b1e',
                marginLeft: '.2rem',
                fontWeight: 'bold',
              }}
              variant="h4"
            >
              {numeral(
                countryDataArray[countryDataArray.length - 1]
                  ? countryDataArray[countryDataArray.length - 1].yeild
                  : 0,
              ).format('0.0[0]a')}
            </Typography>
            {indValueChange === 0 ? (
              <RemoveIcon style={{ color: 'blue', alignSelf: 'center' }} />
            ) : indValueChange > 0 ? (
              <Tooltip
                arrow
                title={
                  <div style={{ fontSize: '1rem' }}>
                    {`Increase on previous year of ${numeral(
                      indValueChange,
                    ).format('0.0[0]a')}`}
                  </div>
                }
              >
                <ArrowUpwardIcon
                  style={{ color: 'blue', alignSelf: 'center' }}
                />
              </Tooltip>
            ) : (
              <Tooltip
                arrow
                title={
                  <div style={{ fontSize: '1rem' }}>
                    {`Decrease on previous year of ${numeral(
                      Math.abs(indValueChange),
                    ).format('0.0[0]a')}
                                `}
                  </div>
                }
              >
                <ArrowDownwardIcon
                  style={{ color: 'blue', alignSelf: 'center' }}
                />
              </Tooltip>
            )}
          </Typography>
          <Typography
            align="left"
            component="h6"
            style={{ display: 'flex', alignItems: 'flex-end' }}
            variant="h6"
          >
            Average:
            <Typography
              align="left"
              component="p"
              style={{
                color: '#6e32c9',
                marginLeft: '.2rem',
                fontWeight: 'bold',
              }}
              variant="h5"
            >
              {numeral(
                countryDataArray.length > 0
                  ? countryDataArray
                      .map(el => el.yeild)
                      .reduce((a, b) => {
                        const x = a || 0;
                        const y = b || 0;
                        return x + y;
                      }, 0) / countryDataArray.length
                  : 0,
              ).format('0.0[0]a')}
            </Typography>
          </Typography>
        </Box>
        <img
          src="https://image.shutterstock.com/image-vector/refugees-illustration-over-white-color-260nw-314202338.jpg"
          style={{
            height: '120px',
            width: '120px',
            alignSelf: 'center',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default KPICard;
