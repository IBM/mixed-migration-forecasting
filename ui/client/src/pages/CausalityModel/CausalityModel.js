//Base imports
import React from 'react';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

//Page styling theme
import causalityModelTheme from './CausalityModel.theme';

const useStyles = makeStyles(causalityModelTheme);

const CausalityModel = props => {
  const classes = useStyles();
  return (
    <Container className={classes.root} maxWidth="false">
      <iframe
        title={'map'}
        src={'https://foresight-bn.eu-gb.mybluemix.net/ui/explorer/index.html'}
        style={{ width: '100%', border: 'none' }}
      />
    </Container>
  );
};

export default CausalityModel;
