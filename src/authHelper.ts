/*

Actual hash password algorithm is hidden due to security reason

*/

export const hashPassword = (password:string):string => {
  return "this hashed password"
}

export const passwordIsMatched = (dbPassword:string, userPassword:string):boolean => {
  return dbPassword === userPassword
}