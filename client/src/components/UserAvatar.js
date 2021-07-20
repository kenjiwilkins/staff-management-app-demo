import React from 'react'
import {ListItemAvatar, Avatar, Badge} from '@material-ui/core'
import UserIcon from '@material-ui/icons/Person'

const UserAvatar = props => {
  return(
    <ListItemAvatar>
      {props.isWorking ?
        <Badge color="secondary" variant="dot">
          <Avatar>
            <UserIcon />
          </Avatar>
        </Badge>:
          <Avatar>
            <UserIcon />
          </Avatar>
      }
    </ListItemAvatar>
  )
}

export default UserAvatar