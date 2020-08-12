var express = require('express');
const nrf24=require("nrf24"); // Load de module
var router = express.Router();
// Init the radio
var rf24= new nrf24.nRF24(15,24);
rf24.begin()
rf24.config({
  PALevel: nrf24.RF24_PA_LOW,
  DataRate: nrf24.RF24_1MBPS,
  Channel: 112//Radio Channel (1-127)
});
rf24.addReadPipe("0x65646f4e31",true)
rf24.read( function(data,n) {
  // when data arrive on any registered pipe this function is called
  // data -> JS array of objects with the follwing props:
  //     [{pipe: pipe id, data: nodejs with the data },{ ... }, ...]
  // n -> number elements of data array    
  console.log(`reading ...`)
  console.log(data)
},function(isStopped,by_user,error_count) {
  // This will be if the listening process is stopped.
  console.log(isStopped)
  console.log(by_user)
  console.log(error_count)

});




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('connect', { title: 'Express' });
});

module.exports = router;
