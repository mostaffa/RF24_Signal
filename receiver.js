'use strict';

const rf=require("nrf24");

const CE=24,CS=0;
const radio=new rf.nRF24(CE,CS);
radio.begin(
  true
);
var ready=radio.present();
if(!ready) {
    console.log("ERROR:Radio is not ready!");
    process.exit(1);
  }
// console.log(`rf.RF24_2MBPS =====> ${rf.RF24_250KB}`)
console.log(rf)
var config={PALevel:rf.RF24_PA_LOW,
  DataRate:rf.RF24_1MBPS,
  Channel:76,
  AutoAck:true,
  Irq: -1
};

  radio.config(config, true);
 

  var Pipes= ["0xABCDABCD71","0x544d52687C"]; // "1Node", "2Node"

  function rcv(){

    var rpipe=radio.addReadPipe(Pipes[0]);
    
    console.log("Read Pipe "+ rpipe + " opened for " + Pipes[0]);
    radio.useWritePipe(Pipes[1]);
    radio.read(function(d,items) {
      //radio.write(d[0].data)
        console.log(d[0].data.toString())
        console.log(items)
      for(var i=0;i<items;i++){
        console.log("Payload Rcv, replied:" + radio.write(d[i].data));
      }
    },function() { console.log("STOP!"); });
  
  }

rcv()
