const request = require('supertest')
const sha512 = require('js-sha512').sha512
const timeHelper = require('../dist/timeHelper')
const moment = require('moment')
const hash = require('../dist/authHelper').hashPassword
const isMatched = require('../dist/authHelper').passwordIsMatched
const models = require('../dist/models')
const mongoose = require('mongoose')
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
const index_1 = __importDefault(require("../dist/index"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(index_1.default);

const mockData = {
  manager:{
    firstName: "Yoshihiko",
    lastName: "Hara",
    isWorking: false,
    isManager: true,
    password: sha512("12345678")
  },
  staff:{
    firstName: "Kenji",
    lastName: "Wilkins",
    isWorking: false,
    isManager: false,
    priority: 100,
  },
  shift:{
    startTime: moment().startOf('day').add(17,"hour").toDate(),
    endTime: moment().startOf('day').add(23, 'hour').toDate(),
  }
}

beforeEach(async () => {
  await mongoose.connect(
    process.env.DEVELOPMENT_MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    );
  await request(server).get('/api/auth/logout')
})

afterEach(async () => {
  await models.default.shiftModel.deleteMany({}).exec()
  await models.default.userModel.deleteMany({}).exec()
  await mongoose.connection.close()
})

describe("unauthorised call", () => {

  test("if user is not logged in yet", async () => {
    const response = await request(server).post(`/api/manage/approve/1234`)
    expect(response.status).toBe(401)
    expect(response.body.message).toBe("not logged in or expired")
  })
})

describe("manage end point shift manage functions", () => {
  test("approve shift", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const shift = await models.default.shiftModel.create({
      userId:staff.id,
      startTime:mockData.shift.startTime,
      endTime:mockData.shift.endTime,
      approved:false
    })
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/approve/${shift.id}`).expect(200).then(res => {
      expect(res.body.message).toBe("shift has been approved")
    })
    await models.default.shiftModel.findById(shift.id).then(doc => {
      expect(doc.approved).toBeTruthy()
    })
  })

  test("delete shift", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const shift = await models.default.shiftModel.create({
      userId:staff.id,
      startTime:mockData.shift.startTime,
      endTime:mockData.shift.endTime,
      approved:false
    })
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/deleteShift/${shift.id}`).expect(410).then(res => {
      expect(res.body.message).toBe("shift has been deleted")
    })
    await models.default.shiftModel.findById(shift.id).then(doc => {
      expect(doc).toBeNull()
    })
  })

  test("update shift - update startTime", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const shift = await models.default.shiftModel.create({
      userId:staff.id,
      startTime:mockData.shift.startTime,
      endTime:mockData.shift.endTime,
      approved:false
    })
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/updateShift/${shift.id}`).send({
      newShift:{
        startTime:moment().startOf('day').add(18, 'hour').toDate()
      }
    }).expect(200).then(res => {
      expect(res.body.message).toBe("shift has been updated")
    })
    await models.default.shiftModel.findById(shift.id).then(doc => {
      expect(doc.startTime).toEqual(moment().startOf('day').add(18, 'hour').toDate())
    })
  })

  test("create shift", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/createShift/${staff.id}`).send({
      shift:{
        startTime:moment().startOf('day').add(18, 'hour').toDate(),
        endTime:moment().startOf('day').add(22, "hour").toDate()
      }
    }).expect(201).then(res => {
      expect(res.body.message).toBe("shift has been created")
      expect(moment(res.body.shift.startTime).toDate()).toEqual(moment().startOf('day').add(18, 'hour').toDate())
    })
  })

  test("create user - staff", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const agent = request.agent(server)
    const newUser = {
      firstName: mockData.staff.firstName,
      isWorking: false,
      isManager: mockData.staff.isManager,
      priority: mockData.staff.priority
    }
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/createUser`).send({
      newUser: newUser
    }).expect(201).then(res => {
      expect(res.body.message).toBe("staff user has been created")
      expect(res.body.newUser.password).toBeUndefined()
    })
    await agent.get('/api/users/all').expect(200).then(res => {
      expect(res.body.users[1].firstName).toBe(newUser.firstName)
      expect(res.body.users[1].isWorking).toBe(newUser.isWorking)
      expect(res.body.users[1].isManager).toBeFalsy()
      expect(res.body.users[1].priority).toBe(newUser.priority)
    })
  })

  test("create user - manager", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const agent = request.agent(server)
    const newUser = {
      firstName: mockData.manager.firstName,
      lastName: mockData.manager.lastName,
      isWorking: false,
      isManager: mockData.manager.isManager,
      password: "12345678"
    }
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/createUser`).send({
      newUser: newUser
    }).expect(201).then(res => {
      expect(res.body.message).toBe("staff user has been created")
      expect(res.body.newUser.isManager).toBeTruthy()
      expect(res.body.newUser.password).toBe(sha512("12345678"))
    })
  })

  test("update user - staff", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const newUser = {
      firstName: "Asuka",
      isWorking: false,
      isManager: staff.isManager,
      priority: 200
    }
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/updateUser/${staff.id}`).send({
      newUser: newUser
    }).expect(200).then(res => {
      expect(res.body.message).toBe("user has been updated")
      expect(res.body.newUser.firstName).toBe("Asuka")
      expect(res.body.newUser.isManager).toBeFalsy()
      expect(res.body.newUser.priority).toBe(200)
    })
  })

  test("update user to be Manager", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const newUser = {
      firstName: "Asuka",
      lastName: "Okachi",
      isWorking: false,
      isManager: true,
      password: "12345678"
    }
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/updateUser/${staff.id}`).send({
      newUser: newUser
    }).expect(200).then(res => {
      expect(res.body.message).toBe("user has been updated")
      expect(res.body.newUser.firstName).toBe("Asuka")
      expect(res.body.newUser.isManager).toBeTruthy()
      expect(res.body.newUser.password).toBe(sha512("12345678"))
    })
  }),

  test("delete user", async () => {
    const manager = await models.default.userModel.create(mockData.manager)
    const staff = await models.default.userModel.create(mockData.staff)
    const agent = request.agent(server)
    await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
    await agent.post(`/api/manage/deleteUser/${staff.id}`).expect(410).then(res => {
      expect(res.body.message).toBe("user has been deleted")
    })
    await models.default.userModel.findById(staff.id).then(doc => {
      expect(doc).toBeNull()
    })
  })
})