import React, { useState } from 'react'
import { Button, Grid, List, ListItem, Divider, Typography, FormControl, TextField} from '@material-ui/core'
import { MuiPickersUtilsProvider, DatePicker, } from '@material-ui/pickers'
import datefnsutils from '@date-io/date-fns'
import axios from 'axios'
import moment from 'moment'
import { ExportToCsv } from "export-to-csv"
import DayPicker from 'react-day-picker';
import { URL } from '../helper/utils'
import 'react-day-picker/lib/style.css';

const ManageTab = props => {
  const [date, setDate] = useState(moment().startOf('week').add(1, 'day'))
  const [selectedDays, setSelectedDays] = useState([moment().startOf('week').add(1, 'day').toDate()])
  const [hoverRange, setHoverRange] = useState()
  const daysAreSelected = selectedDays.length > 0
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [success, setSuccess] = useState(false)

  const allShiftOptions = { 
    filename:`all_shifts_${moment(selectedDays[0]).format("DD/MM/YYYY")}`,
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true, 
    showTitle: true,
    title: `all_shifts_${moment(selectedDays[0]).format("DD/MM/YYYY")}`,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };
  const totalPerStaffOptions = { 
    filename:`total_per_staff_${moment(selectedDays[0]).format("DD/MM/YYYY")}`,
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true, 
    showTitle: true,
    title: `total_per_staff_${moment(selectedDays[0]).format("DD/MM/YYYY")}`,
    useTextFile: false,
    useBom: true,
    headers:['First Name', 'Total Hours', 'Weekday', 'Overwork', 'Monday', 'Tuesday', 'Wednesdayday', 'Thursday', 'Friday', 'Sataurday', 'Sunday']
  };
  const downloadAllShifts = async () => {
    const dateparam = moment(date).format("YYYY-MM-DD")
    await axios.get(`${URL()}/api/manage/download/allShifts/${dateparam}`, {withCredentials:true}).then(res => {
      const csvExporter = new ExportToCsv(allShiftOptions)
      csvExporter.generateCsv(res.data.csvObjects)
    })
  }
  const downloadPerUser = async () => {
    const dateparam = moment(selectedDays[0]).format("YYYY-MM-DD")
    await axios.get(`${URL()}/api/manage/download/totalperuser/${dateparam}`, {withCredentials:true}).then(res => {
      const csvExporter = new ExportToCsv(totalPerStaffOptions)
      csvExporter.generateCsv(res.data.csvObjects)
    })
  }

  function getWeekDays(weekStart) {
    const days = [weekStart];
    for (let i = 1; i < 7; i += 1) {
      days.push(
        moment(weekStart)
          .add(i, 'days')
          .toDate()
      );
    }
    return days;
  }

  function getWeekRange(day) {
    return {
      from: moment(day)
        .startOf('week').add(1, "day")
        .toDate(),
      to: moment(day)
        .endOf('week').add(1, "day")
        .toDate(),
    };
  }

  function handleDayChange(day) {
    setSelectedDays(
      getWeekDays(getWeekRange(day).from)
    )
  };

  const modifiers = {
    hoverRange,
    selectedRange: daysAreSelected && {
      from: selectedDays[0],
      to: selectedDays[6],
    },
    hoverRangeStart: hoverRange && hoverRange.from,
    hoverRangeEnd: hoverRange && hoverRange.to,
    selectedRangeStart: daysAreSelected && selectedDays[0],
    selectedRangeEnd: daysAreSelected && selectedDays[6],
  };

  async function handleChangeAccessCodeClicked(){
    setCurrentPassword("")
    setNewPassword("")
    await axios.post(`${URL()}/api/manage/landingPage`, {
      currentPassword:currentPassword,
      newPassword:newPassword
    }, {withCredentials:true}).then(res => {
      if(res){
        setSuccess(true)
      }
    })
  }

  return(
    <div>
      <List>
        <ListItem>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              {/* <MuiPickersUtilsProvider utils={datefnsutils}>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  format="dd/MM/yyyy"
                  label="start day"
                />
              </MuiPickersUtilsProvider> */}
              <DayPicker
                showWeekNumbers
                firstDayOfWeek={1}
                selectedDays={selectedDays}
                modifiers={modifiers}
                onDayClick={handleDayChange}
              />
            </Grid>
            <Grid item xs={6} container spacing={3}>
              {/* <Grid item>
                <Button variant="outlined" onClick={() => downloadAllShifts()}>donwload All Shifts</Button>
              </Grid> */}
              <Grid item>
                <Button variant="outlined" onClick={() => downloadPerUser()}>download total hours</Button>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
        <Divider />
        <ListItem>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <Typography variant="h6">Change Access Code</Typography>
                {success && <Typography variant="subtitle1" color="secondary">Success!</Typography>}
                <TextField
                  label="current password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <TextField
                  label="new password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Button variant="outlined" style={{marginTop:"24px"}} onClick={() => handleChangeAccessCodeClicked()}>Change</Button>
              </FormControl>
            </Grid>
          </Grid>
        </ListItem>
      </List>
    </div>
  )
}

export default ManageTab