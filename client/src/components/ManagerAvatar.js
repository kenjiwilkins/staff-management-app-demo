import React from 'react'
import {ListItemAvatar, Avatar, Badge} from '@material-ui/core'
import SupervisorIcon from '@material-ui/icons/SupervisorAccount'

const SupervisorAvatar = props => {
  return(
    <ListItemAvatar>
      {props.isWorking ?
        <Badge color="secondary" variant="dot">
          <Avatar>
            <SupervisorIcon />
          </Avatar>
        </Badge>:
          <Avatar>
            <SupervisorIcon />
          </Avatar>
      }
    </ListItemAvatar>
  )
}

export default SupervisorAvatar