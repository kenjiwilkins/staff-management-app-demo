import React from 'react'
import './App.css';
import LandingPage from './pages/LandingPage'
import LandingLogin from './pages/LangingLogin'
import { URL } from './helper/utils'
import moment from 'moment'
import axios from 'axios';
import { accessGranted, accessExpired, login, logout } from './actions/index'
import { connect } from 'react-redux'

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      accessFail:false
    }
    this.setAccessFail = this.setAccessFail.bind(this)
    this.isExpired = this.isExpired.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
  }
  setAccessFail(value){
    this.setState({
      accessFail:value
    })
  }
  isExpired(){
    if(this.props.access_state.access &&
      Math.abs(moment(this.props.access_state.expired_at).diff(moment(), "milliseconds")) >= 43200000){
        this.props.accessExpired()
      }
  }
  componentDidMount(){
    this.isExpired()
  }
  checkPassword(password){
    axios.post(`${URL()}/api/landingPage`, {password:password}).then(res => {
      if(res.data._id){
        // setLogoutTimer()
        this.setAccessFail(false)
        this.props.accessGranted()
      } else {
        this.setAccessFail(true)
      }
    })
  }
  render(){
    return (
      <div className="App">
        {this.props.access_state.access ? <LandingPage {...this.props}/> : 
          <LandingLogin {...this.props} checkPassword={this.checkPassword} accessFail={this.state.accessFail}/>}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  access_state: state.access_state,
  login_state: state.login_state,
})

const mapDispatchToProps = {
  accessGranted,
  accessExpired,
  login,
  logout
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default AppContainer
