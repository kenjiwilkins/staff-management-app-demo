import React, {useState} from 'react'
import { Button, Dialog, DialogContent, DialogTitle, Typography, LinearProgress, CircularProgress } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/styles'
import { getStartTime, formatTime, getTotalHoursOfTheWeek } from '../helper/timer'

const GreenLinearProgress = withStyles({
  colorPrimary:{
    backgroundColor:"#004225"
  },
  barColorPrimary:{
    backgroundColor:"#DFFFF1"
  }
})(LinearProgress)

const useStyles = makeStyles({
  root:{
    marginTop:"20%",
    marginButton:"20%"
  },
  typography:{
    paddingTop:"1em",
    paddingBottom:"1em"
  },
  button:{
    width:"12em",
    height:"4em"
  },
  dialogTitle:{
    paddingTop: "3em",
    paddingLeft:"3em",
    paddingRight:"3em"
  },
  dialogContent:{
    paddingBottom: "3em",
    paddingLeft:"3em",
    paddingRight:"3em"
  },
  progressBar:{
    paddingTop:"8px",
    right:"24px"
  }
})

const StartWork = props => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const startShiftClicked = () => {
    setOpen(false)
    setWaiting(true)
    props.startShift(props.selectedUser._id)
  }
  return(
    <div>
      <div className={classes.root}>
        {waiting && <CircularProgress />}
        {props.selectedUser &&
        <div>
          <Typography variant="h6" className={classes.typography}>
            {`${props.selectedUser.firstName} `}
          </Typography>
          <Typography variant="subtitle1" className={classes.typography}>
            {`Total working hours this week: ${props.selectedUserInfos.totalHours}h`}
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="primary" 
            onClick={() => setOpen(true)}
            className={classes.button}>
              Start
          </Button>
          <Typography variant="subtitle1" className={classes.typography}>
            {`So far, you have worked ${props.selectedUserShifts.length ? props.selectedUserShifts.length : '0'}
            shift this week`}
          </Typography>
          <Typography variant="subtitle1">
            {`Weekdays: ${props.selectedUserInfos.totalWeeklyHours}h including overwork: ${props.selectedUserInfos.totalOverworkHours}h`}
          </Typography>
          <Typography variant="subtitle1">
            {`Saturday: ${props.selectedUserInfos.totalSaturdayHours}h`}
          </Typography>
          <Typography variant="subtitle1">
            {`Sunday: ${props.selectedUserInfos.totalSundayHours}h`}
          </Typography>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle className={classes.dialogTitle}>
              <Typography variant="h5">
                {`Start work ${props.selectedUser.firstName}?`}
              </Typography>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <Typography variant="h6" className={classes.typography}>starting time：{formatTime(getStartTime())}</Typography>
              {waiting ?
              <Button className={classes.button} variant="contained" color="primary" disabled>start</Button> :
              <Button className={classes.button} variant="contained" color="primary" onClick={() => startShiftClicked()}>
                start
              </Button>}
            </DialogContent>
          </Dialog>
        </div>
        }
      </div>
    </div>
  )
}

export default StartWork