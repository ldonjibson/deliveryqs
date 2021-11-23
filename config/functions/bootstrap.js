'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/concepts/configurations.html#bootstrap
 */

const {
    start_chat,
    send_message,
    get_messages,
    chat_history,
   delete_message,
   get_contacts,
   read_message,
} = require('./utils/database');

module.exports = () => {
    var io = require('socket.io')(strapi.server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
    });
    
    io.on('connection', async function(socket) {
      
    //let token = socket.handshake.query.token;
    
    io.emit('messages', JSON.stringify({message:"Connection established" }));

      console.log(`a user connected`);
      // send message on user connection
       socket.on('chat_history', async(fd , callback) => {
            console.log("connected and here", fd);
            try {
                const friends = await chat_history(fd.user_id, fd.token);

                if(friends.length < 0) {
                    callback(`Please select a user to chat!`);
                } else {
                    io.emit(`chat_history_${user_id}`, {
                        friends
                    }); 
              
                }
                //console.log("friends", friends, user_id);
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });
        
        
         socket.on('start_chat', async(fd, callback) => {
            console.log("connected and here", fd);
            try {
                const friends = await start_chat(fd,fd.token);

                if(friends.length < 0) {
                    callback(`Please select a user to chat!`);
                } else {
                    io.emit(`chat_history_${fd.user_id}`, {
                        friends
                    }); 
              
                }
                console.log("friends", friends, fd.user_id);
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });

          
        socket.on('contacts', async(fd, callback) => {
            console.log("connected and here", fd);
            try {
                const contacts = await get_contacts(fd, fd.token);
                
                socket.emit('contacts', {
                       contacts
                }); 

                console.log("contacts", contacts);
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        }); 
        
        socket.on('read_message', async(fd, callback) => {
            console.log("connected and here", fd);
            try {
                const message = await read_message(fd, fd.token);

                console.log("read_messages", fd);
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });
        
        
        
        socket.on('delete_message', async(fd, callback) => {
            console.log("connected and here", fd);
            try {
                var message = await delete_message(fd, fd.token);
                message['type'] = 'delete_message';
                if(message){
                    io.emit(`room${fd.room_id}`, {
                       message
                    }); 
                    console.log("delete_message", fd, message);
                }
                //
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });
        
        socket.on('send_message', async(fd, callback) => {
            console.log("connected and here", fd);
            try {
                var message = await send_message(fd, fd.token);
                message['type'] = 'send_message';
                if(message) {
                    io.emit(`room${fd.room_id}`, {
                        message,
                    });
                }
                //console.log("sent_message", fd, message);
               
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });

        
        socket.on('get_messages', async({ user_id, room_id }, callback) => {
            console.log("connected and here");
            try {
               
                socket.join(`room${room_id}`);
                
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });

      // listen for user diconnect
      socket.on('disconnect', () =>{
        console.log('a user disconnected')
      });
    });
    
    /*
    io.on('connection', function(socket) {
        
        console.log("connected and listnening");
        
        socket.on('connect', async({ username, room }, callback) => {
            console.log("connected and here");
            try {
                const userExists = await findUser(username, room);

                if(userExists.length > 0) {
                    callback(`User ${username} already exists in room no${room}. Please select a different name or room`);
                } else {
                    const user = await createUser({
                        username: username,
                        room: room,
                        status: "ONLINE",
                        socketId: socket.id
                    });

                    if(user) {
                        socket.join(user.room);
                        socket.emit('welcome', {
                            user: 'bot',
                            text: `${user.username}, Welcome to room ${user.room}.`,
                            userData: user
                        }); 
                        socket.broadcast.to(user.room).emit('message', {
                            user: 'bot',
                            text: `${user.username} has joined`,
                        });

                    } else {
                        callback(`user could not be created. Try again!`)
                    }
                }
                callback();
            } catch(err) {
                console.log("Err occured, Try again!", err);
            }
        });
        
        socket.on('sendMessage', async(data, callback) => {
            try {
                const user = await userExists(data.userId);
                if(user) {
                    io.to(user.room).emit('message', {
                        user: user.username,
                        text: data.message,
                    });
                    io.to(user.room).emit('roomInfo', {
                        room: user.room,
                        users: await getUsersInRoom(user.room)
                    });
                } else {
                    callback(`User doesn't exist in the database. Rejoin the chat`)
                }
                callback();
            } catch(err) {
                console.log("err inside catch block", err);
            }
        });
        socket.on('disconnect', async(data) => {
            try {
                console.log("DISCONNECTED!!!!!!!!!!!!");
                const user = await deleteUser( socket.id);
                console.log("deleted user is", user)
                if(user.length > 0) {
                    io.to(user[0].room).emit('message', {
                        user: user[0].username,
                        text: `User ${user[0].username} has left the chat.`,
                    });  
                    io.to(user.room).emit('roomInfo', {
                        room: user.room,
                        users: await getUsersInRoom(user[0].room)
                    });
                }
            } catch(err) {
                console.log("error while disconnecting", err);
            }
        });
    });
    */
};
