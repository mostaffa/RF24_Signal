'use strict';

const rf=require("nrf24");
const readline = require('readline');

const CE=22,CS=0;
//const CE=25,CS1=1;
//const IRQ=-1;
const IRQ=27;
console.log("Cofiguration pins CE->",CE," CS->",CS," IRQ->",IRQ);
var radio=new rf.nRF24(CE,CS);

radio.begin(true);

var ready=radio.present();
if(!ready) {
  console.log("ERROR:Radio is not ready!");
  process.exit(1);
}

var config={PALevel:rf.RF24_PA_LOW,
            DataRate:rf.RF24_2MBPS,
            Channel:1,
            AutoAck:true,
            Irq: IRQ
          };


radio.config(config,true);

var Pipes= ["0xF0F0F0F0E1","0xF0F0F0F0D2"]; // "1Node", "2Node"
// var Pipes= ["1Node","2Node"]; 
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

function snd(do_sync) {

  radio.useWritePipe(Pipes[1]);
  radio.addReadPipe(Pipes[0]);
  console.log("Open Write Pipe "+ Pipes[1]+ " reading from " + Pipes[0]);

  var tmstp;
  var roundtrip;
  var sender=function(){
    var data=Buffer.alloc(4);
    tmstp=Math.round(+new Date()/1000);
    data.writeUInt32LE(tmstp);
    process.stdout.write("\nSending....");
    roundtrip=process.hrtime();
    if(do_sync) {
       if(radio.write(data)) process.stdout.write("[Sync] Sended " + tmstp);
       else process.stdout.write("[Sync] Failed to send " + tmstp +" ");
    } else {
      radio.write(data,function(success){
        if(success) process.stdout.write("[Async] Sended " + tmstp);
        else process.stdout.write("[Async] Failed to send " + tmstp +" ");
      });
    }
  };
  radio.read(function(d,n) {
    if(n==1){
      let t=process.hrtime(roundtrip);
      process.stdout.write(" | response received |")
      let ret=d[0].data.readUInt32LE(0);
      if( ret == tmstp) process.stdout.write(" reponse matchs ");
      else process.stdout.write(" response does not match "+ ret + " != " + tmstp);
      console.log("| roundtrip took", (t[1] /1000).toFixed(0)," us");
    }
  },function(){ console.log("STOPPED!"); });

  setInterval(sender,1000); // send every 1 sec.

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("RF24 GettingStarted");
console.log("This script assumes that this radio is radionumber=1 in ardunino.");
console.log("Other radio must be configured with radionumber=0")
rl.question("[s]ender or [R]eceiver?",(resp)=>{
  var mode=resp.charAt(0);
  if(mode.toUpperCase()=="S") {
    rl.question("Send [s]ync or [A]sync?",(resp2)=>{
       var asy=resp2.charAt(0);
       console.log("Starting snd... press CTRL+C to stop");
       if(asy.toUpperCase()=="S") snd(true);
       else snd(false);
       rl.close(); 
    }); 
  }else {
    console.log("Starting rcv.... press CTRL+C to stop");
    rcv();
    rl.close();
  }
});

///////////////////////////////////////////
  
// var nrf24=require("nrf24");
// var readline = require('linebyline');

// var rf24= new nrf24.nRF24(22, 0);
// console.log("begin->",rf24.begin(true));


// var config={PALevel:nrf24.RF24_PA_LOW,
//     DataRate:nrf24.RF24_1MBPS,
//     Channel:76,
//     AutoAck:true,
//     Irq: -1
//   };
//   rf24.config(config);
//   rf24.useWritePipe("0x65646f4e31");
// var rl = readline(process.stdin);

// rl.on('line', function(line){
//         success = rf24.write(Buffer.from(line));
//         console.log("Sent " + ( success ? "OK" : "KO" ));
// });