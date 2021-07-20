import React, {useState} from 'react'
import { Button, Dialog, DialogContent, DialogTitle, Typography, LinearProgress, CircularProgress } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/styles'
import { formatTime, getCurrentWorkingTime, getFinishTime } from '../helper/timer'

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
  }
})

const FinishWork = props => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const finishClicked = () => {
    setOpen(false)
    setWaiting(true)
    props.finishShift(getFinishTime())
  }
  return(
    <div>
      {waiting && <GreenLinearProgress />}
      <div className={classes.root}>
      {waiting && <CircularProgress />}
        {props.selectedUser &&
          <div>
            <Typography variant="h6" className={classes.typography}>
              {`${props.selectedUser.firstName}`}
            </Typography>
            <Typography variant="subtitle1" className={classes.typography}>
              {`Hours worked: ${props.selectedUserShifts.length ? 
                getCurrentWorkingTime(props.selectedUserShifts[0].startTime) : 'not yet'}
              `}
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              color="secondary" 
              onClick={() => setOpen(true)}
              className={classes.button}>
                Finish
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle className={classes.dialogTitle}>
                <Typography variant="h5">
                  {`Finish shift of: ${props.selectedUser.firstName}`}
                </Typography>
              </DialogTitle>
              <DialogContent className={classes.dialogContent}>
                <Typography variant="h6">{`Time Finish：${formatTime(getFinishTime())}`}</Typography>
                <Typography variant="h6">{`total：${getCurrentWorkingTime(props.selectedUserShifts[0].startTime)}h`}</Typography>
                {waiting ? 
                <Button className={classes.button} variant="contained" color="secondary" disabled>Finish</Button> :
                <Button className={classes.button} variant="contained" color="secondary" 
                  onClick={() => finishClicked()}>
                  Finish
                </Button>}
              </DialogContent>
            </Dialog>
          </div>}
      </div>
    </div>
  )
}

export default FinishWork