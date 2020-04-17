//Base imports
import React from 'react';
import clsx from 'clsx';
import { A } from 'hookrouter';
import { connect } from 'react-redux';
import { initModal } from '../../../redux/ui/Modal/actions';

//Material UI components
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Hidden } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import StarsIcon from '@material-ui/icons/Stars';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Collapse from '@material-ui/core/Collapse';

//Page styling theme
import pageHeaderTheme from './PageHeader.theme';

//Custom components
import UserProfile from './UserProfile/UserProfile';
import logo from '../../../static/DRC_logo.png';

const useStyles = makeStyles(pageHeaderTheme);

const headerLinksData = [
  {
    color: 'textPrimary',
    href: '/home',
    variant: 'button',
    text: 'Home',
  },
  {
    color: 'textPrimary',
    href: '/map',
    variant: 'button',
    text: 'INDICATOR TIMELINE',
  },
  {
    color: 'textPrimary',
    href: '/analysis-register',
    variant: 'button',
    text: 'SIT REP',
  },
  {
    color: 'textPrimary',
    href:
      'https://visual-insights.bluemix.net/?query=Population%20Displacement%2BAfghanistan',
    external: true,
    variant: 'button',
    text: 'News explorer',
  },
  {
    color: 'textPrimary',
    href: '/dashboard',
    variant: 'button',
    text: 'Dashboard',
  },
  // {
  //   color: 'textPrimary',
  //   href: 'https://foresight-bn.eu-gb.mybluemix.net/ui/explorer/index.html',
  //   external: true,
  //   variant: 'button',
  //   text: 'Causality Model',
  // },
  {
    color: 'textPrimary',
    href: '/causality-model',
    variant: 'button',
    text: 'Causality Model',
  },
];

const headerSourceLinksData = [
  {
    color: 'textPrimary',
    href: 'https://ucdp.uu.se/',
    variant: 'button',
    text: 'UCDP',
  },
  {
    color: 'textPrimary',
    href: 'https://www.worldbank.org/',
    variant: 'button',
    text: 'Worldbank',
  },
  {
    color: 'textPrimary',
    href: 'https://www.who.int/',
    variant: 'button',
    text: 'WHO',
  },
  {
    color: 'textPrimary',
    href: 'https://www.emdat.be/',
    variant: 'button',
    text: 'EMDAT',
  },
  {
    color: 'textPrimary',
    href: 'https://www.internal-displacement.org/',
    variant: 'button',
    text: 'IDMC',
  },
  {
    color: 'textPrimary',
    href: 'https://www.unhcr.org/',
    variant: 'button',
    text: 'UNHCR',
  },
  {
    color: 'textPrimary',
    href: 'https://www.systemicpeace.org/',
    variant: 'button',
    text: 'Systemic Peace',
  },
  {
    color: 'textPrimary',
    href: 'https://www.un.org/development/desa/en/',
    variant: 'button',
    text: 'UNDESA',
  },
  {
    color: 'textPrimary',
    href: 'https://drc.ngo/',
    variant: 'button',
    text: 'DRC',
  },
  {
    color: 'textPrimary',
    href: 'https://www.acleddata.com/',
    variant: 'button',
    text: 'ACLED',
  },
  {
    color: 'textPrimary',
    href: 'http://www.fao.org/home/en/',
    variant: 'button',
    text: 'FAO',
  },
  {
    color: 'textPrimary',
    href: 'https://freedomhouse.org/',
    variant: 'button',
    text: 'Freedom House',
  },
  {
    color: 'textPrimary',
    href: 'http://www.politicalterrorscale.org/',
    variant: 'button',
    text: 'Political Terror Scale',
  },
  {
    color: 'textPrimary',
    href: 'https://www.wfp.org/',
    variant: 'button',
    text: 'World Food Programme',
  },
  {
    color: 'textPrimary',
    href: 'https://www.v-dem.net/en/',
    variant: 'button',
    text: 'V-Dem: Varieties of Democracy',
  },
  {
    color: 'textPrimary',
    href: 'https://fundforpeace.org/',
    variant: 'button',
    text: 'Fund for Peace',
  },
];

const PageHeader = props => {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const classes = useStyles();
  const toggleDrawer = open => event => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleSourceButtonClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseDrawer = () => {
    setAnchorEl(null);
  };

  const [isSublistOpen, setSublistOpen] = React.useState(true);
  const handleSublistClick = () => {
    setSublistOpen(!isSublistOpen);
  };
  return (
    <React.Fragment>
      <AppBar className={classes.appBar} color="default" position="fixed">
        <Toolbar>
          <div className={classes.title}>
            <A href={'/'}>
              <img alt={'DRC Logo'} className={classes.logo} src={logo} />
            </A>
          </div>
          <nav>
            <Hidden smDown>
              {headerLinksData.map(link => {
                return link.external && link.external === true ? (
                  <a
                    className={clsx(classes.link, classes.linkMargin)}
                    color={link.color}
                    href={link.href}
                    key={link.text}
                    target="_blank"
                    variant={link.variant}
                  >
                    {link.text}
                  </a>
                ) : (
                  <A
                    className={clsx(classes.link, classes.linkMargin)}
                    href={link.href}
                    key={link.text}
                  >
                    {link.text}
                  </A>
                );
              })}
              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleSourceButtonClick}
                style={{ padding: '0', minWidth: 'unset' }}
              >
                <StarsIcon className={clsx(classes.link, classes.linkMargin)} />
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseDrawer}
              >
                {headerSourceLinksData.map(link => (
                  <a
                    className={classes.link}
                    color={link.color}
                    href={link.href}
                    key={link.text}
                    target="_blank"
                    variant={link.variant}
                  >
                    <MenuItem
                      style={{ color: '#cc051f' }}
                      onClick={handleCloseDrawer}
                    >
                      {link.text}
                    </MenuItem>
                  </a>
                ))}
              </Menu>
            </Hidden>
          </nav>
          <UserProfile initModal={props.initModal} user={props.user} />
          <Hidden mdUp>
            <Button
              onClick={toggleDrawer(true)}
              style={{ padding: '0', minWidth: 'unset', marginLeft: '1rem' }}
            >
              <MenuIcon style={{ color: '#fff' }} />
            </Button>
            <Drawer
              anchor="right"
              open={isDrawerOpen}
              onClose={toggleDrawer('right', false)}
            >
              <div
                role="presentation"
                style={{
                  width: '250px',
                  backgroundColor: '#3c3d41',
                  height: '100%',
                }}
              >
                <List>
                  {headerLinksData.map(link => {
                    return link.external && link.external === true ? (
                      <a
                        className={classes.link}
                        color={link.color}
                        href={link.href}
                        key={link.text}
                        target="_blank"
                        variant={link.variant}
                        onClick={toggleDrawer(false)}
                        onKeyDown={toggleDrawer(false)}
                      >
                        <ListItem color="secondary">{link.text}</ListItem>
                      </a>
                    ) : (
                      <A
                        className={classes.link}
                        href={link.href}
                        key={link.text}
                        onClick={toggleDrawer(false)}
                        onKeyDown={toggleDrawer(false)}
                      >
                        <ListItem color="secondary">{link.text}</ListItem>
                      </A>
                    );
                  })}
                  <ListItem button onClick={handleSublistClick}>
                    <ListItemText className={classes.link} primary="Sources" />
                    {isSublistOpen ? (
                      <ExpandLess className={classes.link} />
                    ) : (
                      <ExpandMore className={classes.link} />
                    )}
                  </ListItem>
                  <Collapse in={isSublistOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {headerSourceLinksData.map(link => (
                        <a
                          className={classes.link}
                          color={link.color}
                          href={link.href}
                          key={link.text}
                          target="_blank"
                          variant={link.variant}
                          onClick={toggleDrawer(false)}
                          onKeyDown={toggleDrawer(false)}
                        >
                          <ListItem color="secondary">{link.text}</ListItem>
                        </a>
                      ))}
                    </List>
                  </Collapse>
                </List>
              </div>
            </Drawer>
          </Hidden>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarSpacer} />
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  initModal: data => dispatch(initModal(data)),
});

export default connect(null, mapDispatchToProps)(PageHeader);
