import React from 'react'
import { Grid, Drawer } from '@material-ui/core'
import UserList from '../components/UserList'
import StartWork from '../components/StartWork'
import FinishWork from '../components/FinishWork'
import LandingMessage from '../components/LandingMessage'
import axios from 'axios'
import ManagementPage from '../pages/ManagementPage'
import { URL } from "../helper/utils"
import '../App.css'

class LandingPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      users:[],
      selectedUserId:"0",
      selectedUser:undefined,
      selectedUserShifts:[],
      selectedUserInfos:undefined,
      postSuccessful: false,
    }
    this.handleSelectedUser = this.handleSelectedUser.bind(this)
    this.startShift = this.startShift.bind(this)
    this.finishShift = this.finishShift.bind(this)
    this.getUserData = this.getUserData.bind(this)
  }
  handleSelectedUser(userId){
    if(userId === this.state.selectedUserId){
      return
    }
    this.logout()
    if(userId !== "0"){
      axios.get(`${URL()}/api/users/shift/${userId}`).then(res => {
        this.setState({
            selectedUserId:userId,
            selectedUser:this.state.users.find(user => user._id === userId),
            selectedUserShifts:res.data.shifts,
            selectedUserInfos:{
              totalHours: res.data.totalHours,
              totalOverworkHours: res.data.totalOverworkHours,
              totalSaturdayHours: res.data.totalSaturdayHours,
              totalSundayHours: res.data.totalSundayHours,
              totalWeeklyHours: res.data.totalWeeklyHours
            }
          })
      })
    } else {
      this.setState({
        selectedUserId:"0",
        selectedUser:undefined,
        selectedUserShifts:[],
      })
    }
  }
  startShift(userId){
    if(userId !== "0"){
      axios.post(`${URL()}/api/startShift/${userId}`).then(response => {
        this.getUserData()
        window.location.reload()
        if(response.data.message === "successful" || response.status === 201){
          this.handleSelectedUser(userId)
        } else if(response.data.message === "failed"){
          this.setState({postSuccessful: false})
        }
      })
    }
  }
  finishShift(finishTime){
    if(this.state.selectedUserId !== "0"){
      axios.post(`${URL()}/api/finishShift/${this.state.selectedUserShifts[0]._id}`,
        {
          startTime:this.state.selectedUserShifts[0].startTime,
          finishTime:finishTime
        }
      ).then(res => {
        if(res.data.message === "successful"){
          window.location.reload()
          this.setState({selectedUserId:res.data.id})
        }
      }).catch(err => console.log(err))
    }
  }
  componentDidMount(){
    this.getUserData()
  }

  getUserData(){
    axios.get(`${URL()}/api/users/all`).then(res => {
      this.setState({users:res.data.sortedUsers})
    })
  }

  logout(){
    axios.get(`${URL()}/api/auth/logout`).then(res => {
      return
    })
  }

  render(){
    return(
      <div>
        <Grid container spacing={2}>
          <Drawer
            variant="permanent"
            anchor="left"
            className="Drawer"
          >
            <UserList users={this.state.users} handleSelectedUser={this.handleSelectedUser} selectedUserId={this.state.selectedUserId} getUserData={this.getUserData}/>
          </Drawer>
          <Grid container spacing={2} justify="flex-end">
            <Grid item xs={10}>
              {this.state.selectedUserId !== "0" ? 
              <div>
                {this.state.selectedUser.isManager ?
                  <ManagementPage {...this.props} selectedUserId={this.state.selectedUserId} selectedUser={this.state.selectedUser}/>
                :<div>
                  {this.state.selectedUser.isWorking ?
                    <FinishWork
                      selectedUser={this.state.selectedUser} 
                      selectedUserShifts={this.state.selectedUserShifts}
                      finishShift={this.finishShift}
                    />:
                    <StartWork 
                      selectedUser={this.state.selectedUser} 
                      selectedUserShifts={this.state.selectedUserShifts}
                      selectedUserInfos={this.state.selectedUserInfos}
                      startShift={this.startShift}
                    />
                  }
                </div>}
              </div> :
              <LandingMessage 
                users={this.state.users}
              />
              }
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default LandingPage