//Base imports
import React from 'react';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

//Page styling theme
import pageContentTheme from './PageContent.theme';

const useStyles = makeStyles(pageContentTheme);

const PageContent = props => {
  const classes = useStyles();
  return <main className={classes.content}>{props.children}</main>;
};

export default PageContent;
