import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Title from '../common/typography/Title/Title';

const createData = (
  country,
  type,
  countOfType,
  victimGender,
  countOfVictims,
) => ({
  country,
  type,
  countOfType,
  victimGender,
  countOfVictims,
});

const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const stableSort = (array, cmp, page, rowsPerPage) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis
    .map(el => el[0])
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
};

const getSorting = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
};

const headCells = [
  { id: 'country', numeric: false, disablePadding: true, label: 'Country' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
  {
    id: 'countOfType',
    numeric: true,
    disablePadding: false,
    label: 'Count of Type',
  },
  {
    id: 'victimGender',
    numeric: false,
    disablePadding: false,
    label: 'Victim Gender',
  },
  {
    id: 'countOfVictims',
    numeric: true,
    disablePadding: false,
    label: 'Victim Age',
  },
];

const EnhancedTableHead = props => {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            align={headCell.numeric ? 'right' : 'left'}
            key={headCell.id}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => {
  let highlight = null;
  if (theme.palette.type === 'light') {
    highlight = {
      color: theme.palette.secondary.main,
      backgroundColor: lighten(theme.palette.secondary.light, 0.85),
    };
  } else {
    highlight = {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.secondary.dark,
    };
  }
  return {
    root: {
      padding: '0',
    },
    highlight,
    spacer: {
      flex: '1 1 100%',
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    title: {
      flex: '0 0 auto',
    },
  };
});

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  return (
    <Toolbar className={classes.root}>
      <div>
        <Title>Trafficking Data Table</Title>
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const Orders = props => {
  const classes = useStyles();
  const { dashboardContent } = props;
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('country');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };
  const rows = [];
  if (dashboardContent && dashboardContent.filterData.length) {
    dashboardContent.filterData.map(element => {
      rows.push(
        createData(
          element.Country,
          element['Trafficking Type'],
          element.Count,
          element['Victim Gender'],
          element['Victim Age'],
        ),
      );
    });
  }
  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  return (
    <div className={classes.root}>
      <EnhancedTableToolbar numSelected={selected.length} />
      <div className={classes.tableWrapper}>
        <Table
          aria-labelledby="tableTitle"
          className={classes.table}
          size={'medium'}
        >
          <EnhancedTableHead
            classes={classes}
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
            order={order}
            orderBy={orderBy}
            rowCount={rows.length}
          />
          <TableBody>
            {stableSort(
              rows,
              getSorting(order, orderBy),
              page,
              rowsPerPage,
            ).map((row, index) => {
              const isItemSelected = isSelected(row.country);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  aria-checked={isItemSelected}
                  hover
                  key={`${row.country}__${index}`}
                  onClick={event => handleClick(event, row.country)}
                  role="checkbox"
                  selected={isItemSelected}
                  tabIndex={-1}
                >
                  <TableCell
                    component="th"
                    id={labelId}
                    padding="none"
                    scope="row"
                  >
                    {row.country}
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell align="right">{row.countOfType}</TableCell>
                  <TableCell>{row.victimGender}</TableCell>
                  <TableCell align="right">{row.countOfVictims}</TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        component="div"
        count={rows.length}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default Orders;
