const request = require('supertest')
const mongoose = require('mongoose')
const moment = require('moment')
const timeHelper = require('../dist/timeHelper')
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
const models = require('../dist/models');
const index_1 = __importDefault(require("../dist/index"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(index_1.default);

const mockData = {
  users:[
    {
      firstName: "Kenji",
      lastName: "Wilkins",
      isWorking: false,
      isManager: false
    },
    {
      firstName: "Asuka",
      lastName: "Okachi",
      isWorking: false,
      isManager: false
    },
    {
      firstName: "Yoshihiko",
      lastName: "Hara",
      isWorking: false,
      isManager: true
    },
    {
      firstName: "Hiroshi",
      lastName: "Fujimoto",
      isWorking: false,
      isManager: true
    },
    {
      firstName: "Mone",
      lastName: "Kagiya",
      isWorking: false,
      isManager: false
    },
  ],
  shifts:[
    {
      startTime:moment().startOf("week").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(0, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(1, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(1, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(2, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(2, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(3, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(3, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(4, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(4, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(5, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(5, "day").add(23, "hour").toDate()
    },
    {
      startTime:moment().startOf("week").add(6, "day").add(17, "hour").toDate(),
      endTime:moment().startOf("week").add(6, "day").add(23, "hour").toDate()
    }
  ]
}

beforeEach(async () => {
  await mongoose.connect(
    process.env.DEVELOPMENT_MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    );
})

afterEach(async () => {
  await models.default.shiftModel.deleteMany({}).exec()
  await models.default.userModel.deleteMany({}).exec()
  
  await mongoose.connection.close()
})

describe('root call waiting', () => {
  test("/ root test", async () => {
    const response = await request(server).get('/hello')
    expect(response.status).toBe(200)
    expect(response.body.message).toBe("hello world")
  })
})

describe('users api endpoint', () => {
  test("GET /api/users/all with 1 user", async () => {
    const user1 = await models.default.userModel.create(
      mockData.users[0]
    )

    const response = await request(server).get("/api/users/all")
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.users)).toBeTruthy()
    expect(response.body.users.length).toBe(1)
    expect(response.body.users[0]._id).toBe(user1.id)
    expect(response.body.users[0].firstName).toBe(user1.firstName)
    expect(response.body.users[0].lastName).toBe(user1.lastName)
    expect(response.body.users[0].isManager).toBeFalsy()
    expect(response.body.users[0].isWorking).toBeFalsy()
  })

  test("GET /api/users/all with 5 user", async () => {
    for (const user of mockData.users) {
      await models.default.userModel.create(user)
    }

    const response = await request(server).get("/api/users/all")
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.users)).toBeTruthy()
    expect(response.body.users.length).toBe(5)
  })

  test("GET /api/users/shift/:id with 1 user 7 shift", async () => {
    const user1 = await models.default.userModel.create(
      mockData.users[0]
    )
    for (const shift of mockData.shifts) {
      await models.default.shiftModel.create({
        userId:user1.id,
        startTime:shift.startTime,
        userName:user1.firstName,
        endTime:shift.endTime,
        approved:false
      })
    }

    const response = await request(server).get('/api/users/shift/' + user1.id)
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.shifts)).toBeTruthy()
    expect(response.body.shifts.length).toBe(7)
    expect(response.body.shifts[0].userId).toBe(user1.id)
    expect(response.body.shifts[0].approved).toBeFalsy()
    expect(moment(response.body.shifts[0].startTime).toDate()).toEqual(moment().startOf("week").add(17, "hour").toDate())
    expect(moment(response.body.shifts[0].endTime).toDate()).toEqual(moment().startOf('week').add(6 + 17, "hour").toDate())

    expect(response.body.totalHours).toBe(6 * 7),
    expect(response.body.totalWeeklyHours).toBe(6 * 5)
    expect(response.body.totalOverworkHours).toBe(1 * 5)
    expect(response.body.totalSaturdayHours).toBe(6 * 1)
    expect(response.body.totalSundayHours).toBe(6 * 1)
  })
})

describe("startShift function", () => {
  test("POST /api/startShift/:id endpoint", async () => {
    const user1 = await models.default.userModel.create(
      mockData.users[0]
    )
    const response = await request(server).post('/api/startShift/' + user1.id)
    expect(response.status).toBe(201)
    expect(response.body.message).toBe("successful")

    const response2 = await request(server).get('/api/users/shift/' + user1.id)
    expect(response2.status).toBe(200)
    expect(response2.body.shifts[0].userId).toBe(user1.id)
    expect(moment(response2.body.shifts[0].startTime).toDate()).toEqual(timeHelper.default.formatStartTime(moment()))

    const response3 = await request(server).get('/api/users/all')
    expect(response3.status).toBe(200)
    expect(response3.body.users[0].isWorking).toBeTruthy()
  })

  test("POST /api/startShift/:id returns immediately if user is already working", async () => {
    const user1 = await models.default.userModel.create({
      firstName:mockData.users[0].firstName,
      lastName:mockData.users[0].lastName,
      isManager:false,
      isWorking:true
    })
    const response = await request(server).post('/api/startShift/' + user1.id)
    expect(response.status).toBe(201)
    expect(response.body.message).toBe("failed")
    expect(response.body.isWorking).toBeTruthy()
  })
})

describe("endshift function", () => {
  test("POST /api/finishShift/:id endpoint", async () => {
    const user1 = await models.default.userModel.create({
      firstName:mockData.users[0].firstName,
      lastName:mockData.users[0].lastName,
      isManager:false,
      isWorking:true
    })
    const shift = await models.default.shiftModel.create({
      userId:user1.id,
      startTime: moment().startOf("day").add(17, "hour").toDate()
    })
    const response = await request(server).post('/api/finishShift/' + shift.id)
    expect(response.status).toBe(405)
    expect(response.body.message).toBe("successful")
    expect(response.body.user._id).toBe(user1.id)
    expect(response.body.user.isWorking).toBeFalsy()
    
    const latestShift = await models.default.shiftModel.findById(shift.id).exec()
    expect(moment(latestShift.endTime).toDate()).toEqual(timeHelper.default.formatEndTime(moment()))
  })

  test("POST /api/finishShift/:id returns immediately if user is not working", async () => {
    const user1 = await models.default.userModel.create({
      firstName:mockData.users[0].firstName,
      lastName:mockData.users[0].lastName,
      isManager:false,
      isWorking:false
    })
    const shift = await models.default.shiftModel.create({
      userId:user1.id,
      startTime: moment().startOf("day").add(17, "hour").toDate()
    })
    const response = await request(server).post('/api/finishShift/' + shift.id)
    expect(response.status).toBe(201)
    expect(response.body.message).toBe("failed")
    expect(response.body.isWorking).toBeFalsy()
  })
})

describe("test route doesnt exist", () => {
  test("test to get 404 error", async () => {
    const response = await request(server).get('/foo')
    expect(response.status).toBe(404)
  })
})

