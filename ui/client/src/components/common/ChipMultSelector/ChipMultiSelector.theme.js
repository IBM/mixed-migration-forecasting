const chipSelectorTheme = theme => ({
  formControl: {
    margin: theme.spacing(0),
    minWidth: 140,
  },
  selectValues: {
    maxWidth: '140px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
  filterControlBlock: {
    margin: '6px 0',
  },
  filterControl: {
    textTransform: 'capitalize',
    marginRight: '3px',
    padding: '2px',
  },
});

export default chipSelectorTheme;
