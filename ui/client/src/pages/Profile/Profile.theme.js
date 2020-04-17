const profileStyles = theme => ({
  root: {
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
    margin: '0 auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  mainContainer: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
  },
  contentContainer: {
    padding: '10px',
    borderBottom: '.5px solid #e8e8e8',
  },
  timeAndIcon: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  profileTime: {
    fontSize: '12px',
    color: 'grey',
    width: '70%',
  },
  profileIconContainer: {
    width: '100px',
  },
  profileIcon: {
    height: '100px',
    display: 'flex',
    color: 'white',
    justifyContent: 'center',
    fontSize: '40px',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'lightblue',
    textTransform: 'uppercase',
  },
  profileCompleted: {
    fontSize: '14px',
    marginTop: '10px',
  },
  infoHeader: {
    padding: '12px',
    borderBottom: '.5px solid #e8e8e8',
  },
  infoHeaderProfile: {
    fontWeight: 'bold',
  },
  infoHeaderEdit: {
    color: 'grey',
    fontWeight: '400',
  },
  inputsBlock: {
    margin: '12px',
  },
  textField: {
    width: '100%',
    height: '55px',
  },
  saveBtnBlock: {
    padding: '12px',
    borderTop: '.5px solid #e8e8e8',
  },
  btnSave: {
    // background: '#05117a',
    // color: 'white',
  },
});
export default profileStyles;
