//Base imports
import React from 'react';

//Material UI components
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

//Page styling theme
import chipSelectorTheme from './ChipMultiSelector.theme';

const useStyles = makeStyles(chipSelectorTheme);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const getStyles = (name, personName, theme) => ({
  fontWeight:
    personName.indexOf(name) === -1
      ? theme.typography.fontWeightRegular
      : theme.typography.fontWeightMedium,
});

const ChipMultSelector = props => {
  const classes = useStyles();
  const theme = useTheme();
  const {
    title,
    handleChange,
    selectedItem,
    changedSelect,
    filterDataRequest,
    requestParam,
  } = props;
  const items = Array.isArray(props.items) ? props.items.sort() : [];
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor="select-multiple-chip">{title}</InputLabel>
      <Select
        input={<Input id="select-multiple-chip" />}
        MenuProps={MenuProps}
        multiple
        onChange={event => {
          handleChange(changedSelect, event.target.value);
          filterDataRequest(
            {
              requestedCategories: [
                'Incident Report Year',
                'Country',
                'Victim Gender',
                'Trafficking Type',
              ],
              filterOptions: {
                [requestParam]: event.target.value,
              },
            },
            title,
          );
        }}
        renderValue={selected => (
          <div className={classes.selectValues}>{selected.join(',')}</div>
        )}
        value={selectedItem}
      >
        {items &&
          items.map(item => (
            <MenuItem
              key={item}
              style={getStyles(item, selectedItem, theme)}
              value={item}
            >
              {item}
            </MenuItem>
          ))}
      </Select>
      <Grid className={classes.filterControlBlock} item lg={12} md={12} xs={12}>
        <Button
          className={classes.filterControl}
          color="primary"
          onClick={() => handleChange(changedSelect, items)}
        >
          Select All
        </Button>
        <Button
          className={classes.filterControl}
          color="primary"
          onClick={() => {
            handleChange(changedSelect, []);
            filterDataRequest({
              requestedCategories: [
                'Incident Report Year',
                'Country',
                'Victim Gender',
                'Trafficking Type',
              ],
              filterOptions: { [requestParam]: [] },
            });
          }}
        >
          Clear All
        </Button>
      </Grid>
    </FormControl>
  );
};

export default ChipMultSelector;
