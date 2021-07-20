import React, { useEffect, useState } from 'react'
import { Button, Collapse, Dialog, DialogTitle, DialogActions, DialogContent, 
  List, ListItem, ListSubheader, ListItemText, ListItemIcon, ListItemSecondaryAction, 
  LinearProgress, Typography, TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import UserAvatar from './UserAvatar'
import ManagerAvatar from './ManagerAvatar'
import { formatTime, getDuration } from '../helper/timer'
import { URL } from '../helper/utils'

const useStyles = makeStyles({
  nestedList:{
    paddingLeft: "24px"
  },
  createButton:{
    color:"white",
    backgroundColor:"blue"
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
})

const UsersTab = props => {
  const classes = useStyles()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(-1)
  const [selectedUserInfo, setSelectedUserInfo] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogUser, setDialogUser] = useState({
    firstName: "",
    isManager: false,
  })
  const [updateUserInfo, setUpdateUserInfo] = useState({
    firstName: "",
    isManager: false,
    password: "",
    priority: 0,
  })
  const handleDialog = user => {
    setDialogOpen(true)
    setDialogUser(user)
    setUpdateUserInfo(user)
  }
  const handleCollapse = async (userId, index) => {
    if(index === selectedUser){
      setSelectedUser(-1)
      return
    }
    await axios.get(`${URL()}/api/users/shift/${userId}`).then(res => {
      setSelectedUserInfo(res.data)
      setSelectedUser(index)
    })
  }
  const createUserDialog = () => {
    setUpdateUserInfo({
      firstName:"",
      isManager:false
    })
    setDialogUser({
      firstName: "",
      isManager: false,
    })
    setDialogOpen(true)
  }
  const createUserClicked = () => {
    setDialogOpen(false)
    axios.post(`${URL()}/api/manage/createUser`, {newUser:updateUserInfo}, {withCredentials:true}).then(res => {
      getUsers()
    }
    )
  }
  const handleFirstName = value => {
    setUpdateUserInfo({
      ...updateUserInfo,
      firstName: value
    })
  }
  const handleIsManager = value => {
    setUpdateUserInfo({
      ...updateUserInfo,
      isManager: value,
      password:"",
    })
  }
  const handlePriority = value => {
    setUpdateUserInfo({
      ...updateUserInfo,
      priority:value
    })
  }
  const handleDeleteClicked = userId => {
    setDialogOpen(false)
    axios.post(`${URL()}/api/manage/deleteUser/${userId}`, {}, {withCredentials:true}).then(res =>{
      getUsers()
    }
    )
  }
  const handleCancelClicked = user => {
    setDialogOpen(false)
  }
  const handleUpdateClicked = userId => {
    setDialogOpen(false)
    axios.post(`${URL()}/api/manage/updateUser/${userId}`, {newUser:updateUserInfo}, {withCredentials:true}).then(res => {
      getUsers()
    }
    )
  }
  const getUsers = () => {
    axios.get(`${URL()}/api/users/all`).then(res => {
      setUsers(res.data.users)
    })
  }
  useEffect(() => {
    getUsers()
  }, [])
  return(
    <div>
      {dialogUser &&
        <Dialog open={dialogOpen} fullWidth maxWidth="lg" onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {dialogUser.firstName.length > 0 ? `Edit User: ${dialogUser.firstName}` : "Create User"}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="first name"
              placeholder="first name"
              value={updateUserInfo.firstName}
              onChange={e => handleFirstName(e.target.value)}
            />
            <TextField
              fullWidth
              label="priority"
              placeholder="priority"
              type="number"
              value={updateUserInfo.priority}
              onChange={e => handlePriority(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox checked={updateUserInfo.isManager} onChange={e => handleIsManager(e.target.checked)} />}
              label="Manager"
            />
            {updateUserInfo.isManager && 
              <TextField 
                fullWidth
                label="password"
                placeholder="password"
                type="password"
                onChange={e => setUpdateUserInfo({...updateUserInfo, password:e.target.value})}
              />
            }
          </DialogContent>
          <DialogActions>
            {dialogUser.firstName.length > 0 ?
            <Button size="large" variant="contained" className={classes.deleteButton} onClick={() => handleDeleteClicked(dialogUser._id)}>Delete</Button> :
            <></>}
            <Button size="large" variant="contained" className={classes.cancelButton} onClick={() => handleCancelClicked()}>Cancel</Button>
            {dialogUser.firstName.length > 0 ?
            <Button size="large" variant="contained" className={classes.updateButton} onClick={() => handleUpdateClicked(dialogUser._id)}>Update</Button> :
            <Button size="large" variant="contained" className={classes.createButton} onClick={() => createUserClicked()}>Create</Button>
            }
          </DialogActions>
        </Dialog>
      }
      <List
        subheader={
          <ListSubheader>
            users
          </ListSubheader>
        }
      > 
        <ListItem>
          <Button variant="contained" size="large" className={classes.createButton} onClick={() => createUserDialog()}>Create User</Button>
        </ListItem>
        {console.log(users)}
        {users.map((user, index) => {
          return (
            <div key={index}>
              <ListItem key={index} button onClick={() => handleCollapse(user._id, index)}>
                <ListItemIcon>
                  {user.isManager ? <ManagerAvatar isWorking={user.isWorking}/> : <UserAvatar isWorking={user.isWorking}/>}
                </ListItemIcon>
                <ListItemText
                  primary={`${user.firstName}`}
                  secondary={user.isWorking ? 'Working' : ''}
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" onClick={() => handleDialog(user)}>edit</Button>
                </ListItemSecondaryAction>
              </ListItem>
              <Collapse in={selectedUser ===  index ? true: false } timeout="auto" unmountOnExit>
                {selectedUserInfo ? 
                <List className={classes.nestedList}>
                  <ListItem>
                    <ListItemText
                      primary={
                      <Typography variant="h6">
                        {`total hours: ${selectedUserInfo.totalHours}h,
                          weekdays: ${selectedUserInfo.totalWeeklyHours}h,
                          overworked: ${selectedUserInfo.totalOverworkHours}h,
                          saturday: ${selectedUserInfo.totalSaturdayHours}h,
                          sunday: ${selectedUserInfo.totalSundayHours}h,
                        `}
                      </Typography>}
                    />
                  </ListItem>
                  <ListItem>
                    <List>
                      {selectedUserInfo.shifts.map((shift, index) => {
                        return(
                          <ListItem>
                            <ListItemText
                              primary={`started: ${formatTime(shift.startTime)} finish: ${formatTime(shift.endTime)}`}
                              secondary={`${getDuration(shift.startTime, shift.endTime)}h worked ${shift.approved ? "it's" : "not"} approved`}
                            />
                            <ListItemSecondaryAction>
                              
                            </ListItemSecondaryAction>
                          </ListItem>
                        )
                      })}
                    </List>
                  </ListItem>
                </List>:<LinearProgress />}
              </Collapse>
            </div>)
        })}
      </List>
    </div>
  )
}

export default UsersTab