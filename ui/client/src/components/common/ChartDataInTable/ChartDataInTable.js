//Base imports
import React, { useState } from 'react';

//Material UI components
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';
import numeral from 'numeral';

const ChartDataInTable = props => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const stableSort = (array, page, rowsPerPage) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      return a[1] - b[1];
    });
    return stabilizedThis
      .map(el => el[0])
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
  const downloadCsv = () => {
    let csvContent = `data:text/csv;charset=utf-8,${[
      'Country',
      'Value',
      'Year',
    ]}\n${props.data
      .map(el => [props.country, el.value, el.year].join(','))
      .join('\n')}`;
    let link = document.createElement('a');
    link.href = csvContent;
    const fileName = `${props.indicatorName}+${props.country}.csv`;
    link.download = fileName;
    link.click();
  };
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right" padding="none" size="small">
              <Button
                color="secondary"
                onClick={downloadCsv}
                style={{
                  padding: '0',
                  minWidth: 'auto',
                }}
              >
                <GetAppIcon />
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(props.data, page, rowsPerPage).map(element => (
            <TableRow key={element.year}>
              <TableCell>{element.year}</TableCell>
              <TableCell align="right">
                {numeral(element.value).format('0.0[0]a') || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        component="div"
        count={props.data.length}
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
export default ChartDataInTable;
