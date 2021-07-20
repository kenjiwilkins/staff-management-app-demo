const mongoose = require('mongoose')

mongoose.connect("mongodb://KenjiWilkins:Haruki1984@ds247674.mlab.com:47674/posts", {useNewUrlParser: true, useUnifiedTopology:true})

const db = mongoose.connection

const Schema = mongoose.Schema
const userSchema = new Schema({
  firstName: String,
  lastName: String,
  working: Boolean,

})

const shiftSchema = new Schema({
  userId: String,
  startTime: Date,
  endTime:Date,
  confirmed: Boolean
})

const managerSchema = new Schema({
  username:String,
  password:String
})