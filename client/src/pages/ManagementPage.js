import React from 'react'
import { Tab, Tabs } from '@material-ui/core'
import LoginForm from '../components/LoginForm'
import ShiftsTab from '../components/ShiftsTab'
import UsersTab from '../components/UsersTab'
import ManageTab from '../components/ManageTab'
import { URL } from "../helper/utils"
import axios from 'axios'

class ManagementPage extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      loginStatus: false,
      tabState: 0
    }
    this.authManager = this.authManager.bind(this)
  }

  componentDidMount(){
    axios.get(`${URL()}/api/auth`, {withCredentials:true}).then(res => {
      if(res.status === 200){
        if(res.data.message === "logged in"){
          this.setState({loginStatus:true})
        } else {
          this.setState({loginStatus:false})
        }
      }
    })
  }

  componentDidUpdate(){
    axios.get(`${URL()}/api/auth`, {withCredentials:true}).then(res => {
      return
    })
  }

  handleTabs = (event, tabState) => {
    this.setState({tabState})
  }

  authManager(password){
    if(this.props.selectedUserId){
      axios.post(`${URL()}/api/auth`, {id:this.props.selectedUserId, password:password}, {withCredentials:true}).then(res => {
        if(res.status === 201){
          this.setState({loginStatus:true})
        }
      })
    }
  }

  render(){
    return(
      <div>
        {this.state.loginStatus ? 
        <div>
          <Tabs 
            value={this.state.tabState}
            onChange={this.handleTabs}
          >
            <Tab label="Shifts" />
            <Tab label="user" />
            <Tab label="manage" />
          </Tabs>
          {this.state.tabState === 0 && <ShiftsTab />}
          {this.state.tabState === 1 && <UsersTab />}
          {this.state.tabState === 2 && <ManageTab />}
        </div>  
        :  
        <LoginForm authManager={this.authManager}/>}
      </div>
    )
  }
}

export default ManagementPage