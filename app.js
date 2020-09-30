const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const connect = require('./routes/connect');
const rf=require("nrf24");
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3005);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/connect', connect)
const server = app.listen(app.get('port'), function() {
	debug('Express server listening on port ' + server.address().port);
});
const io = require('socket.io').listen(server);
///////////////////
  
///////////////////
io.on('connection', socket=>{


  socket.on('signal', data=>{
    // prepare Radio
    const radio=new rf.nRF24(24,0);
  radio.begin();
  if(!radio.present()) {
    socket.emit("error","ERROR:Radio is not ready!");
  }
  var config={PALevel:rf.RF24_PA_LOW,
    DataRate:rf.RF24_1MBPS,
    Channel:76,
    AutoAck:true,
    Irq: -1
  };
  radio.config(config, false);
  var Pipes= ["0xABCDABCD71","0x544d52687C"];
    var rpipe=radio.addReadPipe(Pipes[0]);
    radio.useWritePipe(Pipes[1]);
    radio.read(function(d,items) {
      //radio.write(d[0].data)
        // console.log(d[0].data.toString())
        socket.emit('incomming', d[0].data.toString())
        // console.log(items)
      // for(var i=0;i<items;i++){
      //   console.log("Payload Rcv, replied:" + radio.write(d[i].data));
      // }
    },function() { console.log("STOP!"); });
  });
});
io.on('disconnect', () => {
  console.log("============>")
});
//////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
