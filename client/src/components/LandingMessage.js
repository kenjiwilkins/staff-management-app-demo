import React from 'react'
import {Grid, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/styles'
import logo from '../app-logo.png'

const useStyles = makeStyles({
  container:{
    paddingTop:'50%'
  },
  textContainer:{
    display:"inline-block",
    width:'60%',
    textAlign:"left",
    paddingTop:'1em',
    paddingLeft: '1em'
  },
  image:{
    display:'inline-block',
    verticalAlign:'top',
    width:'30%',
  }
})

const LandingMessage = props => {
  const classes = useStyles()
  return(
    <div className={classes.root}>
      <Grid container spacing={0} justify="center">
        <Grid item xs={6}>
          <div className={classes.container}>
            <img src={logo} alt="logo" className={classes.image}/>
            <div className={classes.textContainer}>
              <Typography variant="h5">
                Currently Working:
              </Typography>
              <Grid container spacing={3}>
                {props.users.map((user, index) => {
                  if(user.isWorking){
                    return <Grid item xs={4} key={index}>
                        <Typography variant="h6">
                          {user.firstName}
                        </Typography>
                      </Grid>
                  }
                })}
              </Grid>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default LandingMessage