import { combineReducers } from 'redux'
import moment from 'moment'

const accessState = {
  access: false,
  expired_at: moment()
},

loginState = {
  login:false,
  expired_at: moment()
}

export const access_state = (state = accessState, action) => {
  // if(accessState.access || Math.abs(accessState.expired_at.diff(moment(), "milliseconds")) >= 43200000){
  //   return {
  //     ...state,
  //     access: false
  //   }
  // }
  switch(action.type){
    case "ACCESS_GRANTED" :
      return {
        ...state,
        access: true,
        expired_at: moment().add(12, "hour")
      }
    case "ACCESS_EXPIRED" :
      return {
        ...state,
        access:false
      }
    default:
      return state
  }
}

export const login_state = (state = loginState, action) => {
  if(loginState.access || Math.abs(loginState.expired_at.diff(moment(), "milliseconds")) >= 600000){
    return {
      ...state,
      access: false
    }
  }
  switch(action.type){
    case "LOGIN" :
      return {
        ...state,
        login: true,
        expired_at: moment().add(10, "minute")
      }
    case "LOGOUT" :
      return {
        ...state,
        login:false
      }
    default:
      return state
  }
}

export const reducers = combineReducers({
  access_state,
  login_state
});