import moment, { Moment } from 'moment'
import models, {ShiftDoc} from './models'

/*

  helper functions to calculate hours worked

*/

// move start time up to next quarter hour
const formatStartTime = (time: Moment): Date => {
  const minute:number = time.minute()
  let startTime:Moment
  if(minute <= 15){
    startTime = moment().startOf("hour").add(15, "minute")
  } else if (minute <= 30){
    startTime = moment().startOf("hour").add(30, 'minute')
  } else if (minute <= 45){
    startTime = moment().startOf("hour").add(45, 'minute')
  } else {
    startTime = moment().startOf("hour").add(1, 'hour')
  }
  return startTime.toDate()
}

// put finish time back to recent quarter hour
const formatEndTime = (time: Moment): Date => {
  const minute:number = time.minute()
  let endTime:Moment
  if(minute <= 15){
    endTime = moment().startOf("hour")
  } else if (minute <= 30){
    endTime = moment().startOf("hour").add(15, "minute")
  } else if (minute <= 45){
    endTime = moment().startOf("hour").add(30, "minute")
  } else {
    endTime = moment().startOf("hour").add(45, "minute")
  }
  return endTime.toDate()
}

const getDayOfWeek = (date: Moment): number => {
  return date.day()
}

const getDuration = (start: Moment, finish: Moment): number => {
  return finish.diff(start, "minute") / 60
}

const getOverworked = (start:Moment, finish: Moment): number => {
  const tenOclock: Moment = start.clone()
  tenOclock.startOf("day").add(22, "hour")
  const result: number = finish.diff(tenOclock, "minute") / 60
  if( result < 0){
    return 0
  } else {
    return result
  }
}
const getTotalHours = (shifts:number[]): number =>{
  let total:number = 0
  for (const shift of shifts) {
    total = total + shift
  }
  return total
}

const getWeeklyHours = (shifts: ShiftDoc[]):number => {
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts) {
    const thisDay:number = getDayOfWeek(moment(shift.startTime))
    if(!shift.endTime){
      continue
    }
    if(thisDay === 6 || thisDay === 0){
      continue
    } else {
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

const getTotalOverworkHours = (shifts: ShiftDoc[]):number => {
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts) {
    const thisDay:number = getDayOfWeek(moment(shift.startTime))
    if(!shift.endTime){
      continue
    }
    if(thisDay === 6 || thisDay === 0){
      continue
    } else {
      totalTime += getOverworked(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

function getMondayHours(shifts: ShiftDoc[]):number{
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 1){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

function getTuesdayHours(shifts: ShiftDoc[]):number{
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 2){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

function getWednesdayHours(shifts: ShiftDoc[]):number{
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 3){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

function getThursdayHours(shifts: ShiftDoc[]):number{
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 4){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

function getFridayHours(shifts: ShiftDoc[]): number{
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 5){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

const getSaturdayHours = (shifts: ShiftDoc[]):number => {
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 6){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

const getSundayHours = (shifts: ShiftDoc[]):number => {
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for (const shift of shifts){
    if(!shift.endTime){
      continue
    }
    if(getDayOfWeek(moment(shift.endTime)) === 0){
      totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
    }
  }
  return totalTime
}

const sumAllHours = (shifts: ShiftDoc[]):number => {
  if(shifts.includes(undefined)){
    return 0
  }
  let totalTime:number = 0
  for(const shift of shifts){
    if(!shift.endTime){
      continue
    }
    totalTime += getDuration(moment(shift.startTime), moment(shift.endTime))
  }
  return totalTime
}

export default {
  formatStartTime,
  formatEndTime,
  getDayOfWeek,
  getDuration,
  getOverworked,
  getTotalHours,
  getWeeklyHours,
  getTotalOverworkHours,
  getMondayHours,
  getTuesdayHours,
  getWednesdayHours,
  getThursdayHours,
  getFridayHours,
  getSaturdayHours,
  getSundayHours,
  sumAllHours
}