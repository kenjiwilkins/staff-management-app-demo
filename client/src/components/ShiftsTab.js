import React, {useEffect, useState} from 'react'
import { 
  Button, Table, TableHead, TableBody, TableRow, TableCell, Snackbar, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@material-ui/core'
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker } from '@material-ui/pickers'
import datefnsutils from '@date-io/date-fns'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import { formatTime, clockHandler } from '../helper/timer'
import { URL } from '../helper/utils'

const useStyles = makeStyles({
  table:{
    maxWidth:"95%"
  },
  cancelButton:{
    color:"white",
    backgroundColor:"orange"
  },
  deleteButton:{
    color:"white",
    backgroundColor:"red",
    right: "40em"
  },
  updateButton:{
    color:"white",
    backgroundColor:"green"
  },
  timePickerGrid:{
    padding:"3em"
  }
})

const ShiftsTab = props => {
  const classes = useStyles()
  const [shifts, setShifts] = useState([])
  const [newStartTime, setNewStartTime] = useState(new Date)
  const [newEndTime, setNewEndTime] = useState(new Date)
  const [shiftDate, setShiftDate] = useState(undefined)
  const [popupOpen, setPopupOpen] = useState(false)
  const [severity, setSeverity] = useState("success")
  const [message, setMessage] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState(undefined)

  const handleNewStartTime = date => {
    setNewStartTime(clockHandler(date))
  }
  const handleNewEndTime = date => {
    setNewEndTime(clockHandler(date))
  }

  const handleShiftDate = date => {
    setShiftDate(date)
  }

  const updateButtonClicked = shiftId => {
    setDialogOpen(false)
    setSelectedShift(undefined)
    updateShift(shiftId)
  }

  const deleteButtonClicked = shiftId => {
    setDialogOpen(false)
    setSelectedShift(undefined)
    deleteShift(shiftId)
  }

  function approveAll(){
    axios.post(`${URL()}/api/manage/approveall`,{}, {withCredentials:true}).then(res => {
      getShifts()
    })
  }

  const updateShift = async shiftId => {
    const newShift = {
      startTime: newStartTime,
      endTime: newEndTime
    }
    await axios.post(`${URL()}/api/manage/updateShift/${shiftId}`, {newShift: newShift}, {withCredentials:true}).then(res => {
      if(res.status === 200){
        setMessage(res.data.message)
        setSeverity("success")
      } else {
        setMessage("something went wrong")
        setSeverity("error")
      }
      if(shiftDate){
        getSelectDateShifts()
      } else {
        getShifts()
      }
    })
  }

  const deleteShift = async shiftId => {
    await axios.post(`${URL()}/api/manage/deleteShift/${shiftId}`, {}, {withCredentials:true}).then(res => {
      if(shiftDate){
        getSelectDateShifts()
      } else {
        getShifts()
      }
    })
  }

  const handleSnackBar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setPopupOpen(false);
  }

  const editShiftClicked = shift => {
    setSelectedShift(shift)
    setNewStartTime(shift.startTime)
    setNewEndTime(shift.endTime)
    setDialogOpen(true)
  }

  const resetClicked = () => {
    setShiftDate(undefined)
    getShifts()
  }

  useEffect(() => {
    getShifts()
  }, [])
  const getShifts = () => {
    axios.get(`${URL()}/api/manage/shifts/all`, {withCredentials:true}).then(res => {
      setShifts(res.data.shifts)
    }).catch(err => {
      console.log(err)
    })
  }
  const getSelectDateShifts = () => {
    if(shiftDate){
      axios.get(`${URL()}/api/manage/shifts/date/${shiftDate}`, {withCredentials:true}).then(res => {
        setShifts(res.data.shifts)
      }).catch(err => {
        console.log(err)
      })
    }
  }

  const approveShift = shiftId => {
    axios.post(`${URL()}/api/manage/approve/${shiftId}`, {}, {withCredentials:true}).then(res => {
      if(res.status === 200){
        setMessage(res.data.message)
        setSeverity("success")
        getShifts()
      } else {
        setMessage("something went wrong!")
        setSeverity("error")
        getShifts()
      }
    })
  }
  return(
    <div>
      <Snackbar open={popupOpen} autoHideDuration={3000} onClose={handleSnackBar}
        anchorOrigin={{vertical:'top', horizontal:'center'}}
      >
        {severity === "success" &&
          <Alert elevation={6} severity="success">
            {message}
          </Alert>
        }
        {severity === "error" &&
          <Alert elevation={6} severity="error">
            {message}
          </Alert>
        }
      </Snackbar>
      {selectedShift &&
        <Dialog fullWidth maxWidth="lg" open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle >
            <Typography variant="h4" component="h2">
              {`Change shift details of ${selectedShift.firstName} `}
            </Typography>
            <Typography variant="h5" component="h2">
              {`from ${formatTime(selectedShift.startTime)} to ${formatTime(selectedShift.endTime)} (worked ${selectedShift.totalHours}h)`}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <MuiPickersUtilsProvider utils={datefnsutils}>
              <Grid container spacing={3} justify="space-evenly">
                <Grid item xs={4}>
                  <DateTimePicker
                    label="change start time"
                    value={newStartTime}
                    onChange={handleNewStartTime}
                    format="MM/dd/yyyy HH:mm"
                  />
                </Grid>
                <Grid item xs={4}>
                  <DateTimePicker
                    label="change finish time"
                    value={newEndTime}
                    onChange={handleNewEndTime}
                    format="MM/dd/yyyy HH:mm"
                  />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
          </DialogContent>
          <DialogActions>
            <Button className={classes.deleteButton} variant="contained" size="large" onClick={() => deleteButtonClicked(selectedShift.id)}>Delete</Button>
            <Button className={classes.cancelButton} variant="contained" size="large" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className={classes.updateButton} variant="contained" size="large" onClick={() => updateButtonClicked(selectedShift.id)}>Update</Button>
          </DialogActions>
        </Dialog>
      }
      <Grid className={classes.timePickerGrid} container spacing={3}>
        <MuiPickersUtilsProvider utils={datefnsutils}>
          <Grid item xs={4}>
            <DatePicker
              label="select date"
              value={shiftDate}
              onChange={handleShiftDate}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" color="primary" onClick={() => getSelectDateShifts()}>
              Search
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" color="inherit" onClick={() => resetClicked()}>
              reset
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="secondary" onClick={() => approveAll()}>
              approve all
            </Button>
          </Grid>
        </MuiPickersUtilsProvider>
      </Grid>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>staff name</TableCell>
            <TableCell>start time</TableCell>
            <TableCell>end time</TableCell>
            <TableCell>total time</TableCell>
            <TableCell>approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shifts.length > 0 && 
            shifts.map((shift, index) => {
              return (
              <TableRow key={index}>
                <TableCell>{`${shift.firstName}`}</TableCell>
                <TableCell>{formatTime(shift.startTime)}</TableCell>
                <TableCell>{formatTime(shift.endTime)}</TableCell>
                <TableCell>{`${shift.totalHours}h`}</TableCell>
                <TableCell>
                  {shift.approved ?
                    <Typography variant="subtitle2" color="secondary">
                      approved
                    </Typography>:
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="secondary"
                      onClick={() => approveShift(shift.id)}
                    >approve</Button>
                  }
                  <Button size="small" variant="outlined" onClick={() => editShiftClicked(shift)}>
                    edit?
                  </Button>
                </TableCell>
              </TableRow>)
            })
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default ShiftsTab