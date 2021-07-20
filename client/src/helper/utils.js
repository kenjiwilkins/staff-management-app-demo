export function URL(){
  return process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://staff-shift-demo.herokuapp.com" 
}
