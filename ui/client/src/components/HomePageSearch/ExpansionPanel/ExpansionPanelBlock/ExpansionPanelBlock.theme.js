const expansionPanelBlock = theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    // minHeight:'5rem',
    fontWeight: theme.typography.fontWeightRegular,
    color: '#fff',
  },
  chartBlock: {
    height: '70px',
    width: '35%',
  },
  headName: {
    width: '25%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  headSource: {
    width: '17.5%',
  },
  headValue: {
    width: '17.5%',
  },
});
export default expansionPanelBlock;
