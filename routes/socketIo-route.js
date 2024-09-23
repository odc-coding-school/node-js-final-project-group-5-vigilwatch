const {Server} = require("socket.io")



const setUpSocketIO = (server)=>{
    const io = new Server(server)


	return io;

}




module.exports = setUpSocketIO;