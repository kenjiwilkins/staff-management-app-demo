import createError from "http-errors"
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import passport from 'passport'
import pl, { Strategy } from 'passport-local'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import mongoose, { model } from 'mongoose'
import moment from 'moment'
import models, { ShiftDoc, UserDoc } from './models'
import timeHelper from './timeHelper'
import { hashPassword, passwordIsMatched } from './authHelper'

mongoose.set('debug', true)
const app = express()
const baseCookieOptions = {
  name:"staffapp-demo-session",
  secret:"something hard to guess",
  httpOnly: false,
  signed: true,
}
app.use(morgan("dev"))
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser(baseCookieOptions.secret))
app.use(cors({
  origin: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? "http://localhost:19006" : "https://staffapp.herokuapp.com",
  credentials:true
}))
app.use(session({
  ...baseCookieOptions,
  resave:false,
  saveUninitialized:false,
  cookie:{
    secure:false,
    maxAge:300000
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.resolve(__dirname, '../client/build')))

if ( process.env.NODE_ENV === 'test' || process.env.NODE_ENV === "development" ) { 
  mongoose.connect(
    process.env.PRODUCTION_MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    );
} else if(process.env.NODE_ENV === "production"){
  mongoose.connect(
    process.env.DEVELOPMENT_MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    );
} else {
  console.log("Please set process env")
}

console.log("Process Env:", process.env.NODE_ENV)


const db = mongoose.connection
db.once("open", () => console.log("connected to the database:" + db.name));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

passport.use( 'id+password', new Strategy ({
  usernameField: 'id',
  passwordField:'password'
}, async (id, password, done) => {
  try {
    await models.userModel.findById(id).then(doc => {
      if(!doc){
        return done(null, false)
      }
      if(!passwordIsMatched(doc.password, password)){
        return done(null, false)
      }
      return done(null, doc)
    }).catch(err => {
      if(err){
        return done(err)
      }
    })
  } catch (error) {
    done(error)
  }
}))

app.get('/hello', async (req, res) => {
  return res.status(200).json({message:"hello world"})
})


// better to change auth methods to use redux
// passport has some problem to delete cookies
app.post('/api/auth', passport.authenticate('id+password', {failureMessage:"auth failed"}),
  (req, res) => {
    res.status(201).send({message:"auth success", user:req.user, auth:true})
  }
)
app.get('/api/auth', (req, res) => {
  if(!req.isAuthenticated()){
    res.status(200).send({message:"not logged in", auth:false})
  } else {
    res.status(200).send({message:"logged in", auth:true})
  }
})

app.get('/api/auth/logout', async (req, res) => {
  // @ts-ignore
  req.session.passport =  undefined
  res.status(200).send({message:"logged out", auth:false, user:req.user})

})

app.post('/api/manage/landingPage', async (req, res) => {
  if(!req.user){
    return res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.landingModel.findOneAndUpdate({password:hashPassword(req.body.currentPassword)}, {password:hashPassword(req.body.newPassword)}).then(doc => {
      return res.status(201).json({successful:true})
    }).catch(err => {
      if(err){
        res.status(404).json({error:true})
      }
    })
  }
})

app.post('/api/manage/approve/:shiftId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
    return
  } else {
    await models.shiftModel.findByIdAndUpdate(req.params.shiftId, {approved:true}, {new:true}).exec().then(shift => {
      res.status(200).send({message:"shift has been approved", shift})
    })
  }
})

app.post('/api/manage/approveall', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
    return
  } else {
    await models.shiftModel.updateMany({approved:false}, {approved:true}).exec().then(result => {
      res.status(201).send({message:"all shifts have been approved", result})
    })
  }
})

app.post('/api/manage/deleteShift/:shiftId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.shiftModel.findByIdAndDelete(req.params.shiftId).then(shift => {
      res.status(201).send({message:"shift has been deleted", shift})
    })
  }
})

app.post('/api/manage/updateShift/:shiftId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.shiftModel.findByIdAndUpdate(req.params.shiftId, req.body.newShift, {new: true}).then(shift => {
      res.status(200).send({message:"shift has been updated", shift})
    }).catch(err => {
      if(err){
        res.status(401).send({message:err})
      }
    })
  }
})

app.post('/api/manage/createShift/:userId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.shiftModel.create({
      userId:req.params.userId,
      startTime:moment(req.body.shift.startTime).toDate(),
      endTime:moment(req.body.shift.endTime).toDate(),
      approved:true
    }).then(shift => {
      res.status(201).send({message:"shift has been created", shift})
    }).catch(err => {
      if(err){
        res.send({message:err})
      }
    })
  }
})

app.post('/api/manage/createUser', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    console.log(req.body.newUser)
    const newUserObject:any = {
      firstName:req.body.newUser.firstName,
      isWorking:false,
      isManager:req.body.newUser.isManager,
      priority:parseInt(req.body.newUser.priority),
    }
    if(req.body.newUser.isManager && req.body.newUser.password){
      newUserObject.password = hashPassword(req.body.newUser.password)
    }
    await models.userModel.create(newUserObject).then(newUser => {
      res.status(201).send({message:"staff user has been created", newUser})
    })
  }
})

app.post('/api/manage/updateUser/:userId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    const newUserObject:any = {
      firstName:req.body.newUser.firstName,
      lastName:req.body.newUser.lastName,
      isWorking:false,
      priority:parseInt(req.body.newUser.priority),
      isManager:req.body.newUser.isManager
    }
    if(req.body.newUser.isManager && req.body.newUser.password){
      newUserObject.password = hashPassword(req.body.newUser.password)
    }
    await models.userModel.findByIdAndUpdate(req.params.userId ,newUserObject, {new:true}).then(newUser => {
      res.status(200).send({message:"user has been updated", newUser})
    })
  }
})

app.post('/api/manage/deleteUser/:userId', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.userModel.findByIdAndDelete(req.params.userId).then(doc => {
      res.status(201).send({message:"user has been deleted"})
    })
  }
})

app.get('/api/manage/shifts/date/:date', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.shiftModel.find({
      startTime:{
        $gte: moment(req.params.date).subtract(1,'day').startOf('date').toDate(),
        $lte: moment(req.params.date).subtract(1,'day').endOf('date').toDate()
      }
    }).sort("-startTime").limit(50).exec().then(shifts => {
      models.userModel.find().exec().then(users => {
        const formatShift = shifts.map(shift => {
          const user = users.find(u => u.id === shift.userId)
          console.log({
            startDate:moment(shift.startTime).format("DD/MM/YYYY"),
            user:user,
            id:shift.id
          })
          return {
            id:shift.id,
            firstName: user.firstName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            approved: shift.approved,
            totalHours: timeHelper.getDuration(moment(shift.startTime), moment(shift.endTime))
          }
        })
        res.json({shifts:formatShift})
      })
    }).catch(error => {
      if(error){
        res.json({error})
      }
    })
  }
})

app.get('/api/manage/shifts/all', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    await models.shiftModel.find().sort("-startTime").limit(50).exec().then(shifts => {
      models.userModel.find().exec().then(users => {
        const formatShift = shifts.map(shift => {
          const user = users.find(u => u.id === shift.userId)
          return {
            id:shift.id,
            firstName: user.firstName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            approved: shift.approved,
            totalHours: timeHelper.getDuration(moment(shift.startTime), moment(shift.endTime))
          }
        })
        res.json({shifts:formatShift})
      })
    }).catch(error => {
      if(error){
        res.json({error})
      }
    })
  }
})

app.get('/api/manage/download/totalperuser/:date', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    interface totalData {
      firstName:string,
      totalHours:number,
      totalWeeklyHours:number,
      totalOverworkHours:number,
      totalMondayHours:number,
      totalTuesdayHours:number,
      totalWednesdayHours:number,
      totalThursdayHours:number,
      totalFridayHours:number,
      totalSaturdayHours:number,
      totalSundayHours:number,
    }
    const csvObjects: totalData [] = []
    const startDay = moment(req.params.date).startOf('day'), endDay = startDay.clone().add(6, "day").endOf('day')
    const users = await models.userModel.find({isManager:false}).sort({"priority":"1"}).exec()
    const shifts = await models.shiftModel.find({
      startTime:{
        $gte:startDay.toDate(),
        $lte:endDay.toDate()
      }})
    for(const user of users){
      let userShift : ShiftDoc[] = []
      for (const shift of shifts) {
        if(shift.userId === user.id){
          userShift.push(shift)
        } else {
          continue
        }
      }
      csvObjects.push({
        firstName:user.firstName,
        totalHours:timeHelper.sumAllHours(userShift),
        totalWeeklyHours:timeHelper.getWeeklyHours(userShift),
        totalOverworkHours:timeHelper.getTotalOverworkHours(userShift),
        totalMondayHours:timeHelper.getMondayHours(userShift),
        totalTuesdayHours:timeHelper.getTuesdayHours(userShift),
        totalWednesdayHours:timeHelper.getWednesdayHours(userShift),
        totalThursdayHours:timeHelper.getThursdayHours(userShift),
        totalFridayHours:timeHelper.getFridayHours(userShift),
        totalSaturdayHours:timeHelper.getSaturdayHours(userShift),
        totalSundayHours:timeHelper.getSundayHours(userShift)
      })
      userShift = []
    }
    res.status(200).json({csvObjects})
  }
})

app.get('/api/manage/download/allShifts/:date', async (req, res) => {
  if(!req.user){
    res.status(401).send({message:"not logged in or expired", auth:false})
  } else {
    interface eachShift {
      firstName: string,
      startTime: string,
      endTime: string,
      hours: number
    }
    let data: eachShift[]
    const shifts = await models.shiftModel.find({
      startTime:{
        $gte: moment(req.params.date).startOf('day').toDate(),
        $lte: moment(req.params.date).endOf('day').add(6, 'day').toDate()
      }
    }).sort("-startTime").exec()
    const users = await models.userModel.find({}).exec()
    shifts.forEach(shift => {
      const user = users.find(user => {
        if(shift.userId === user.id){
          return {firstName: user.firstName, }
        }
      })
      const start = moment(shift.startTime), end = moment(shift.endTime)
      data.push({
        firstName:user.firstName,
        startTime:start.format("DD/MM/YYYY HH:mm:ss"),
        endTime:end.format("DD/MM/YYYY HH:mm:ss"),
        hours:timeHelper.getDuration(start, end)
      })
    })
    res.status(200).json({data})
  }
})

app.get('/api/users/all', (req, res) => {
  models.userModel.find({}).sort({"priority":"1"}).exec().then(users => {
    console.log(users)
    const sortedUsers = users.sort((a, b) => {
      if(a.isWorking){
        return -1
      } else {
        return 0
      }
    })
    res.json({users, sortedUsers})
  }).catch(error => {
    if(error){
      res.json({error})
    }
  })
})

app.get('/api/users/shift/:id', (req, res) => {
  const startOfWeek = timeHelper.getDayOfWeek(moment()) === 0 ? 
    moment().subtract(1, "week").startOf("week").add(1, "day").toDate() : 
    moment().startOf("week").add(1, "day").toDate()
  const endOfWeek = timeHelper.getDayOfWeek(moment("2021-05-10")) === 0 ? 
    moment().subtract(1, "week").endOf("week").add(1, "day").toDate() : 
    moment().startOf("week").add(1, "day").endOf("week").add(1, "day").toDate()
  models.shiftModel.find({
      userId:req.params.id,
      startTime:{
        $gte:startOfWeek, $lte:endOfWeek
      }
    }
  ).sort("-startTime").exec().then(shifts => {
    res.json({
      shifts,
      totalHours: timeHelper.sumAllHours(shifts),
      totalWeeklyHours: timeHelper.getWeeklyHours(shifts),
      totalOverworkHours: timeHelper.getTotalOverworkHours(shifts),
      totalSaturdayHours: timeHelper.getSaturdayHours(shifts),
      totalSundayHours: timeHelper.getSundayHours(shifts),
    })
  }).catch(error => {
    if(error){
      res.json({error})
    }
  })
})

app.get('/test', async (req, res) => {
  if(process.env.NODE_ENV === "development"){
  await models.shiftModel.deleteMany({})
  await models.userModel.deleteMany({})
  await models.landingModel.create({
    password:hashPassword('test')
  })
  await models.userModel.create({
    firstName:"Yoshihiko",
    isWorking:false,
    isManager:true,
    password:hashPassword('test')
  })
  await models.userModel.create({
    firstName:"Kenji",
    lastName:"Wilkins",
    isWorking:false,
    isManager:false,
    priority:100
  }).then( doc => res.json(doc))
  } else {
    return res.json({message:"not allowed"})
  }
})

app.post('/api/landingPage', async (req, res) => {
  await models.landingModel.findOne({password:hashPassword(req.body.password)}).then(doc => {
    return res.send(doc)
  })
})

app.post('/api/startShift/:id', async (req, res) => {

  const startTime = timeHelper.formatStartTime(moment())
  const user = await models.userModel.findById(req.params.id)
  const shift: object = {
    userId:req.params.id,
    userName: user.firstName,
    startTime,
    approved: false
  }
  models.shiftModel.create(shift).then(val => {
    models.userModel.findByIdAndUpdate(req.params.id, {isWorking:true}, {new:true}).then(userVal => {
      return res.status(201).send({message:"successful"})
    }).catch(err => {
      if(err){return res.status(500).send({message:"user update failed"})}
    })
  }).catch(err => {
    if(err){
      return res.status(500).send({message:"shift create failed"})
    }
  })
})

app.post('/api/finishShift/:shiftId', async (req, res) => {
  const shift: object = {
    endTime: timeHelper.formatEndTime(moment()),
  }
  models.shiftModel.findByIdAndUpdate(req.params.shiftId, shift, {new:true}).then(shiftVal => {
    models.userModel.findByIdAndUpdate(shiftVal.userId, {isWorking: false}, {new:true}).then(userVal => {
      return res.status(201).send({message:"successful", user:userVal})
    }).catch(err => {
      if(err){
        res.status(500).send({message:"user update failed"})
      }
    })
  }).catch(err => {
    if(err){
      res.status(500).send({message:"shift update failed"})
    }
  })
})

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser( async (id, done) => {
  try {
    await models.userModel.findById(id).then(user => {
      done(null, user)
    })
  } catch (error) {
    console.log(error)
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
})

export default app