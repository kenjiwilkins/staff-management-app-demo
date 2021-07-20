import mongoose from 'mongoose'
import express from 'express'

export interface ShiftDoc extends mongoose.Document {
  userId: string,
  startTime: Date,
  userName?: string,
  endTime?: Date,
  dayOfWeek?: number,
  totalHours?: number,
  approved:boolean
}

export interface UserDoc extends mongoose.Document {
  firstName: string,
  isWorking: boolean,
  isManager: boolean,
  password?: string,
  priority?: number,
}

export interface LandingPageDoc extends mongoose.Document {
  password: string
}

const userSchema = new mongoose.Schema({
  firstName:{
    type: String,
    required:[true, 'first name required']
  },
  isWorking:{
    type:Boolean,
    required:[true, 'isWorking undefined']
  },
  isManager:{
    type:Boolean,
    required:[true, 'isManager undefined'],
  },
  password:{
    type:String,
  },
  priority:{
    type: Number,
  }
})

const userModel = mongoose.model<UserDoc>('users', userSchema, 'wagaya-shift')

const shiftSchema = new mongoose.Schema({
  userId: {
    type:String,
    required:[true, 'userID missing']
  },
  startTime: Date,
  endTime: Date,
  totalHours: Number,
  approved:Boolean
})

const shiftModel = mongoose.model<ShiftDoc>('shift', shiftSchema, 'user-shift')

const landingSchema = new mongoose.Schema({
  password: String
})

const landingModel = mongoose.model<LandingPageDoc>('landing', landingSchema, 'landing-page')

export default {userModel, shiftModel, landingModel}