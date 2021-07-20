const request = require('supertest')
const sha512 = require('js-sha512').sha512
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
  firstName: "Yoshihiko",
  lastName: "Hara",
  isWorking: false,
  isManager: true,
  password: sha512("12345678")
}

beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://development:jGOnjNvjpMhxWcnI@domo.djl3v.mongodb.net/test-for-wagaya-shift-app?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    );
})

afterAll(async () => {
  await models.default.shiftModel.deleteMany({}).exec()
  await models.default.userModel.deleteMany({}).exec()
  await mongoose.connection.close()
})

// describe("hash value check", () => {
//   test("test with empty string", () => {
//     expect(hash("")).toBe(sha512(""))
//   })

//   test("check user password match", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     expect(sha512("12345678")).toBe(manager.password)
//   })

//   test("check user password match with isMatched function (true value)", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     expect(isMatched(manager.password, "12345678")).toBeTruthy()
//   })
//   test("check user password match with isMatched function (false value)", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     expect(isMatched(manager.password, "00000000")).toBeFalsy()
//   })
// })

// describe("auth test with server", () => {
//   test("sign in check on successful result", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     const response = await request(server).post('/api/auth').send({'id':manager.id, 'password':"12345678"})
//     expect(response.status).toBe(201)
//     expect(response.body.message).toBe("auth success")
//     expect(response.body.auth).toBeTruthy()
//   })

//   test("sign in check on failed result", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     const response = await request(server).post('/api/auth').send({'id':manager.id, 'password':"00000000"})
//     expect(response.status).toBe(401)
//   })

//   test("successful login", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     const agent = request.agent(server)
//     await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
//     await agent.get('/api/auth').expect(200).then(res => {
//       expect(res.body.message).toBe("logged in")
//       expect(res.body.auth).toBeTruthy()
//     })
//   })

//   test("login failed", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     const agent = request.agent(server)
//     await agent.get('/api/auth').expect(200).then(res => {
//       expect(res.body.message).toBe("not logged in")
//       expect(res.body.auth).toBeFalsy()
//     })
//   })

//   test("logout function", async () => {
//     const manager = await models.default.userModel.create(mockData)
//     const agent = request.agent(server)
//     await agent.post('/api/auth').send({'id':manager.id, 'password':"12345678"}).expect(201)
//     await agent.get('/api/auth').expect(200).then(res => {
//       expect(res.body.message).toBe("logged in")
//       expect(res.body.auth).toBeTruthy()
//     })
//     await agent.get('/api/auth/logout').expect(200).then(res => {
//       expect(res.body.message).toBe("logged out")
//       expect(res.body.auth).toBeFalsy()
//     })
//     await agent.get('/api/auth').expect(200).then(res => {
//       expect(res.body.message).toBe("not logged in")
//       expect(res.body.auth).toBeFalsy()
//     })
//   })
// })