const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/multiple_auth', {useCreateIndex:true,useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false })