import React, {useState} from 'react'
import { Button, Card, FormGroup, FormControl, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles({
  root:{
    marginTop:"20%",
    marginButton:"20%",
    marginLeft:"20%",
    marginRight:"20%"
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

const LoginForm = props => {
  const classes = useStyles()
  const [password, setPassword] = useState("")
  return(
    <div>
      <Card className={classes.root}>
        <FormGroup>
          <Typography variant="h4">
            Password Required
          </Typography>
          <FormControl margin="dense">
          <TextField className={classes.dialogTitle}
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            variant="filled"
            autoFocus
          />
          </FormControl>
          <FormControl className={classes.dialogContent}>
            <Button variant="contained" color="primary" size="large" onClick={() => props.authManager(password)}>
              Login
            </Button>
          </FormControl>
        </FormGroup>
      </Card>
    </div>
  )
}

export default LoginForm