// const timeHelper = require('../dist/timeHelper')
// const moment = require('moment')

// let startTime = moment().startOf("hour"), endTime = moment().startOf('hour')
// let monday = moment("2021-02-01"), tuesday = moment("2021-02-02"), saturday = moment("2021-02-06"), sunday = moment("2021-02-07")
// const mockShifts = [
//   {
//     userId: 1,
//     startTime: monday.clone().add(17,"hour").toDate(),
//     endTime: monday.clone().add(23, 'hour').toDate(),
//     dayOfWeek: 1,
//     totalHours: 5,
//     approved:true
//   },
//   {
//     userId: 1,
//     startTime: tuesday.clone().add(17,"hour").add(30, "minute").toDate(),
//     endTime: tuesday.clone().add(22, 'hour').toDate(),
//     dayOfWeek: 2,
//     totalHours: 4.5,
//     approved:true
//   },
//   {
//     userId: 1,
//     startTime: tuesday.clone().add(17,"hour").add(30, "minute").toDate(),
//     dayOfWeek: 2,
//     totalHours: 4.5,
//     approved:true
//   },
//   {
//     userId: 1,
//     startTime: saturday.clone().add(17,"hour").toDate(),
//     endTime: saturday.clone().add(23, 'hour').toDate(),
//     dayOfWeek: 6,
//     totalHours: 4.5,
//     approved:true
//   },
//   {
//     userId: 1,
//     startTime: sunday.clone().add(17,"hour").add(30, "minute").toDate(),
//     endTime: sunday.clone().add(22, 'hour').toDate(),
//     dayOfWeek: 7,
//     totalHours: 4.5,
//     approved:true
//   },
// ]

// describe("check get duration functions", () => {
//   test("get Duration for 5 hours work", () => {
//     expect(timeHelper.default.getDuration(startTime, endTime.add(5, 'hour'))).toBe(5)
//   })

//   test("get quarter time duration", () => {
//     endTime = moment().startOf('hour').add(15,'minute')
//     expect(timeHelper.default.getDuration(startTime, endTime)).toBe(0.25)
//   })

//   test("get Duration negative number if working time was negative", () => {
//     endTime = moment().startOf('hour').subtract(1, "hour")
//     expect(timeHelper.default.getDuration(startTime, endTime)).toBe(-1)
//   })
// })

// describe("over worked time calculator function", () => {
//   test("get over worked time in integer", () => {
//     endTime = moment().startOf("dates").add(23, 'hours')
//     expect(timeHelper.default.getOverworked(startTime, endTime)).toBe(1)
//   })

//   test("get over worked time in quarter hour", () => {
//     endTime = moment().startOf("dates").add(22, 'hours').add(15, 'minute')
//     expect(timeHelper.default.getOverworked(startTime, endTime)).toBe(0.25)
//   })

//   test("get 0 overworked time if its exactly 10 oclock pm", () => {
//     endTime = moment().startOf('day').add(22, 'hour')
//     expect(timeHelper.default.getOverworked(startTime, endTime)).toBe(0)
//   })

//   test("get 0 over worked time if finished before 10 pm ", () => {
//     endTime = moment().startOf('day').add(12, 'hour')
//     expect(timeHelper.default.getOverworked(startTime, endTime)).toBe(0)
//   })

//   test("get 1 overworked time if its after 10 oclock of the day before", () => {
//     endTime = moment().startOf('day').add(48, 'hour')
//     expect(timeHelper.default.getOverworked(startTime, endTime)).toBe(48 - 22)
//   })
// })

// describe("format start time function", () => {
//   test("12:01:00 turns forward to 12:15", () => {
//     startTime = moment().startOf('hour').add(1, 'second')
//     expect(timeHelper.default.formatStartTime(startTime)).toStrictEqual(
//       moment().startOf('hour').add(15, 'minute').toDate()
//     )
//   })
//   test("12:16:00 forwarded to 12:30", () => {
//     startTime = moment().startOf('hour').add(15, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatStartTime(startTime)).toStrictEqual(
//       moment().startOf('hour').add(30, 'minute').toDate()
//     )
//   })
//   test("12:31:00 forwarded to 12:45", () => {
//     startTime = moment().startOf('hour').add(30, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatStartTime(startTime)).toStrictEqual(
//       moment().startOf('hour').add(45, 'minute').toDate()
//     )
//   })
//   test("12:46:00 forwarded to 01:00", () => {
//     startTime = moment().startOf('hour').add(45, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatStartTime(startTime)).toStrictEqual(
//       moment().startOf('hour').add(1, 'hour').toDate()
//     )
//   })
// })

// describe("format finish time function", () => {
//   test("12:01:00 turns back to 12:00", () => {
//     endTime = moment().startOf('hour').add(1, 'minute')
//     expect(timeHelper.default.formatEndTime(endTime)).toStrictEqual(
//       moment().startOf('hour').toDate()
//     )
//   })
//   test("12:16:00 turns back to 12:15", () => {
//     endTime = moment().startOf('hour').add(15, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatEndTime(endTime)).toStrictEqual(
//       moment().startOf('hour').add(15, 'minute').toDate()
//     )
//   })
//   test("12:31:00 turns back to 12:30", () => {
//     endTime = moment().startOf('hour').add(30, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatEndTime(endTime)).toStrictEqual(
//       moment().startOf('hour').add(30, 'minute').toDate()
//     )
//   })
//   test("12:46:00 turns back to 12:45", () => {
//     endTime = moment().startOf('hour').add(45, 'minute').add(1, 'minute')
//     expect(timeHelper.default.formatEndTime(endTime)).toStrictEqual(
//       moment().startOf('hour').add(45, 'minute').toDate()
//     )
//   })
// })

// describe('get weekday function test', () => {
//   test("get sunday as 0", () => {
//     expect(timeHelper.default.getDayOfWeek(moment("2021-1-31"))).toBe(0)
//   })
// })

// describe('get week hours in total', () => {
//   test("get week hours in total", () => {
//     expect(timeHelper.default.getWeeklyHours(mockShifts)).toBe(10.5)
//   })
// })

// describe('get total overworked hours in weekdays', () => {
//   test("get total overworked time in weekdays", () => {
//     expect(timeHelper.default.getTotalOverworkHours(mockShifts)).toBe(1)
//   })
// })

// describe('get total hours in saturday', () => {
//   test("get saturday hours in total", () => {
//     expect(timeHelper.default.getSaturdayHours(mockShifts)).toBe(6)
//   })
// })

// describe('get total hours in sunday', () => {
//   test("get sunday hours in total", () => {
//     expect(timeHelper.default.getSundayHours(mockShifts)).toBe(4.5)
//   })
// })

// describe('get total hours in a whole week', () => {
//   test("get total hours in a whole week", () => {
//     expect(timeHelper.default.sumAllHours(mockShifts)).toBe(21)
//   })
// })