import React from 'react'
import { LinearProgress, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/styles'
import UserAvatar from './UserAvatar'
import SupervisorAvatar from './ManagerAvatar'

const GreenLinearProgress = withStyles({
  colorPrimary:{
    backgroundColor:"#004225"
  },
  barColorPrimary:{
    backgroundColor:"#DFFFF1"
  }
})(LinearProgress)

const useStyles = makeStyles({
  drawer:{
    width:"20%"
  }
})

const UserList = props => {
  const classes = useStyles()
  return(
    <div>
      {props.users.length > 0 ? 
      <List>
        <ListItem>
          <Typography variant="caption">
            Manager
          </Typography>
        </ListItem>
        {props.users.map((user, index) => {
          if(user.isManager){
            return user._id === props.selectedUserId ? 
            <ListItem key={index} selected button onClick={() => props.handleSelectedUser(user._id)}>
              <SupervisorAvatar isWorking={user.isWorking} />
              <ListItemText primary={`${user.firstName}`}/>
            </ListItem> :
            <ListItem key={index} button onClick={() => props.handleSelectedUser(user._id)}>
              <SupervisorAvatar isWorking={user.isWorking} />
              <ListItemText primary={`${user.firstName}`}/>
            </ListItem>
          }
        })}
        <ListItem>
          <Typography variant="caption">
            Staff
          </Typography>
        </ListItem>
        {props.users.map((user, index) => {
          if(!user.isManager){
          return user._id === props.selectedUserId ?
          <ListItem key={index} selected button onClick={() => props.handleSelectedUser(user._id)}>
            <UserAvatar isWorking={user.isWorking} />
            <ListItemText
              primary={`${user.firstName}`}
            />
          </ListItem> :
          <ListItem key={index} button onClick={() => props.handleSelectedUser(user._id)}>
            <UserAvatar isWorking={user.isWorking} />
            <ListItemText
              primary={`${user.firstName}`}
            />
          </ListItem>}
          })}
          {props.selectedUserId !== "0" &&
          <ListItem button onClick={() => props.handleSelectedUser("0")}>
            <Typography variant="caption">
              Logout
            </Typography>
          </ListItem>}
          <ListItem button onClick={() => props.getUserData()}>
            <Typography variant="caption">
              Reload
            </Typography>
          </ListItem>
      </List>:
      <GreenLinearProgress />
      }
    </div>
  )
}

export default UserList