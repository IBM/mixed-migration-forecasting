import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router';
import cardReportStyles from './ReportCard.theme';
import { A, navigate } from 'hookrouter';

const useStyle = makeStyles(cardReportStyles);

const ReportCard = props => {
  const history = useHistory();
  const { id, title, status, author, img } = props;
  const classes = useStyle();
  const handleClick = () => navigate(`/analysis-register/${id}`);
  const thumbnailStyle =
    img && img.includes('base64') ? { backgroundImage: `url(${img})` } : {};
  return (
    <A
      className={classes.cardContainer}
      href={`/analysis-register/${id}`}
      onClick={handleClick}
    >
      <div className={classes.imgBlock} style={thumbnailStyle}>
        <img alt="" className={classes.img} />
      </div>
      <div className={classes.infoBlock}>
        <div style={{ flexGrow: '1' }}>
          <Typography variant="h6" component="h4" className={classes.title}>
            {title}
          </Typography>
          <Typography
            component="p"
            color="textSecondary"
            gutterBottom
            variant="body2"
          >
            Author: {author}
            <br />
            Status: {status}
          </Typography>
        </div>
        <p className={classes.subInfoBlock}>Read more &#8594;</p>
      </div>
    </A>
  );
};
export default ReportCard;
