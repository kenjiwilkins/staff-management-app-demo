import moment from 'moment'

export const getStartTime = () => {
  let startTime = moment().minute()
  if(startTime <= 15){
    return moment().startOf("hour").add(15, "minute")
  } else if (startTime <= 30) {
    return moment().startOf("hour").add(30, "minute")
  } else if (startTime <= 45) {
    return moment().startOf("hour").add(45, "minute")
  } else {
    return moment().startOf("hour").add(1, "hour")
  }
}

export const getFinishTime = () => {
  let finishTime = moment().minute()
  if(finishTime <= 15){
    return moment().startOf("hour")
  } else if (finishTime <= 30){
    return moment().startOf("hour").add(15, "minute")
  } else if (finishTime <= 45){
    return moment().startOf("hour").add(30, "minute")
  } else {
    return moment().startOf("hour").add(45, "minute")
  }
}

export const clockHandler = time => {
  let minute = moment(time).minutes()
  if(minute <= 7 && minute >= 0){
    return moment(time).startOf("hour")
  } else if (minute >= 8 && minute <= 22){
    return moment(time).startOf("hour").add(15, "minutes")
  } else if (minute >= 23 && minute <= 37){
    return moment(time).startOf("hour").add(30, "minutes")
  } else if (minute >= 38 && minute <= 52){
    return moment(time).startOf("hour").add(45, "minutes")
  } else if (minute >= 53){
    return moment(time).startOf("hour")
  }
}

export const formatTime = value => {
  return moment(value).format("DD/MM/YYYY HH:mm:ss")
}

function timeConvert(n) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return  rhours + " hour(s) and " + rminutes + " minute(s).";
  }

export const getCurrentWorkingTime = value => {
  let time = moment().diff(moment(value), "minute")
  const text = timeConvert(time)
  time = Math.floor( (moment().diff(moment(value), "minute") / 60) * 100) / 100
  if(time < 0){
    return 0
  } else {
    return text
  }
}

export const getDuration = (start, finish) => {
  return moment(finish).diff(start, "minute") / 60
}

export const getTotalHoursOfTheWeek = shifts => {
  let total = 0
  shifts.forEach(shift => {
    if(shift.totalHours){
      total += shift.totalHours
    }
  })
  return total
}