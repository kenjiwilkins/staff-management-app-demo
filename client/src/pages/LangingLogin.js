import React, { Component, Fragment } from 'react'
import { withStyles } from "@material-ui/core/styles";
import {
  Container,
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  CardHeader,
  InputAdornment
} from "@material-ui/core";
import { Send, Mail, Lock } from "@material-ui/icons";

const styles = theme => ({
  card: {
    marginTop: "136px",
    minWidth: 275
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  },
  action: {
    flexDirection: "row-reverse"
  }
});

export default withStyles(styles)(
  class LoginForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        password: ""
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }

    handleChange(password){
      this.setState({
        password:password
      })
    }

    handleClick(){
      this.setState({
        password:""
      })
      this.props.checkPassword(this.state.password)
    }

    render() {
      const { classes } = this.props,
        { email, password } = this.state;
      return (
        <Fragment>
          <Container>
            <Card className={classes.card}>
              <CardHeader
                title="Access"
              />
              <CardContent>
                {this.props.accessFail ?
                  <TextField
                    error
                    required
                    autoFocus
                    type="password"
                    id="password"
                    label="Access Denied"
                    value={password}
                    onChange={e => this.handleChange(e.target.value)}
                    margin="normal"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      )
                    }}
                  />:
                    <TextField
                      required
                      autoFocus
                      type="password"
                      id="password"
                      label="password"
                      value={password}
                      onChange={e => this.handleChange(e.target.value)}
                      margin="normal"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        )
                      }}
                    />
                  }
              </CardContent>
              <CardActions className={classes.action}>
                <Button
                  id="btn_login"
                  onClick={e => this.handleClick()}
                  color="primary"
                  className={classes.button}
                  variant="contained">
                  <Send className={classes.extendedIcon} />
                  Access
                </Button>
              </CardActions>
            </Card>
          </Container>
        </Fragment>
      );
    }
  }
);
