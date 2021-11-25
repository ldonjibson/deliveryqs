"use strict";
const axios = require("axios");

const baseUrl = "http://localhost:1337";
 
const handleQuery = (fd, token) => {
     
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://api.deliveryqs.com/graphql",
        {
          query: `${fd}`,
        },
        token && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        //console.log("res,<<", res);
        return resolve(res.data);
      })
      .catch((error) => {
        console.log("error>>", error.response);
        let error_msg = {
          msg: "Network Error! Please try again",
          code: 500,
        };
        if (
          error &&
          error.response &&
          error.response.data &&
          error.response.data.data &&
          error.response.data.data[0] &&
          error.response.data.data[0].messages &&
          error.response.data.data[0].messages[0]
        ) {
          error_msg = {
            msg: error.response.data.data[0].messages[0].message,
            code: error.response.status,
          };
        }
        return reject(error_msg);
      });
  
  });
};

async function findUser(username, room) {
    try {
        const userExists = await strapi.services.users.find({ username, room });
        return userExists;
    } catch(err) {
        console.log("error while fetching", err);
    }
}

async function get_contacts(fd, token) {
    let cond = '';
    if(fd.type==='customer'){
        cond = `where:{customer_id:${fd.user_id}, order_status_ne:"placed"}`;
    }else if(fd.type==='shopper'){
        cond = `where:{delivery_id:{shopper_id:${fd.user_id}}, order_status_ne:"placed"}`
    }
    
    
    const query = `
        query{
         sales(${cond}) {
              id
              delivery_id{
                id
                shopper_id{
                   id
                    firstname
                    lastname
                    avatar
                }
              }
              customer_id{
                   id
                    firstname
                    lastname
                    avatar
              }
            }
        }`;

    try {
        
      let res = await handleQuery(query, token);
      let data = res.data;
      console.log(res);

      //return await strapi.services.groups.find(query);
      return data;

      //ctx.send("Hello World!");
    } catch (err) {
      console.log(err);
      return err;
    }
    
}
async function read_message(fd, token) {
    let query = `
                mutation {
                  updateMessage(input: {
                    where: {
                      recipient_id: ${fd.user_id}
                    },
                    data: {
                      status: read
                    }
                  }){
                     messages {
                      id
                      text
                      image
                      created_at
                      sender_id{
                        id
                        first_name
                        last_name
                        avatar{
                          url
                        }
                      }
                      recipient_id{
                        id
                        first_name
                        last_name
                        avatar{
                          url
                        }
                      } 
        
                    }
                  }
                
                }
            `;
            
        try{
            let res = await handleQuery(query, token);
            let data = res.data;
        
            return data;
               
           
           
        }catch(err){
            console.log("error", err);
         
            return err;
        }
}

async function delete_message(fd, token) {
 
            let exist = await axios.get(`${baseUrl}/messages?id=${fd.message_id}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
         
           if(exist.data.length > 0){
               let query = `
                mutation {
                  updateMessage(input: {
                    where: {
                      id: "${fd.message_id}"
                    },
                    data: {
                      status: deleted
                    }
                  })
                      {
                        message {
                          id
                          text
                          image
                          created_at
                          sender_id{
                            id
                            firstname
                            lastname
                            avatar
                          }
                          recipient_id{
                            id
                            firstname
                            lastname
                            avatar
                          } 
            
                        }
                      }
                
                }
            `;
            
        try{
            let res = await handleQuery(query, token);
            let data = res.data;
            console.log("data",data);
            return data;
               
           
           
        }catch(err){
            console.log("error", err);
         
            return err;
        }
    }
}

async function send_message(fd, token) {
    let recipient_id = fd.recipient_id ? `${fd.recipient_id}` : null;
    let query = `
    mutation {
          createMessage(
            input: {
              data: {
                recipient_id: "${recipient_id}",
                sender_id: "${fd.sender_id}",
                room_id:"${fd.room_id}",
                text: "${fd.text}",
                image: "${fd.image}"
              }
            }
          ) {
            message {
              id
              text
              image
              created_at
              sender_id{
                id
                firstname
                lastname
                avatar
              }
              recipient_id{
                id
                firstname
                lastname
                avatar
              } 

            }
          }
        
        }
    `;
    try {
     console.log("payload", query, token);
      let res = await handleQuery(query, token);
     console.log("Here now", res);
      let data = res.data;
      console.log(res.data);

      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
}

async function get_messages(user_id, room_id, token){
    const query = `
        query{
         rooms(where:{_or:[{friend_id:${user_id}}, {user_id: ${user_id}}]}) {
              id
              description
              user_id{
                   id
                    firstname
                    lastname
                    avatar
              }
              friend_id{
                   id
                    firstname
                    lastname
                    avatar
              }
               messages(sort:"created_at:asc"){
                  id
                  text
                  created_at
                  image
                  sender_id{
                    id
                    firstname
                    lastname
                    avatar
                  }
                  recipient_id{
                    id
                    firstname
                    lastname
                    avatar
                  }
                }
            }
        }`;

    try {
        
      let res = await handleQuery(query, token);
      let data = res.data;
      //console.log(res);

      //return await strapi.services.groups.find(query);
      return data;

      //ctx.send("Hello World!");
    } catch (err) {
      console.log(err);
      return err;
    }
    
}

async function start_chat(fd, token) {
    
     let exist = await axios.get(`${baseUrl}/rooms?friend_id=${fd.friend_id}&user_id=${fd.user_id}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
         console.log("exist", exist.data);
           if(exist.data.length === 0){
               
                let query = `
                mutation {
                      createRoom(
                        input: {
                          data: {
                            user_id: "${fd.user_id}",
                            friend_id: "${fd.friend_id}",
                            description:"user${fd.user_id}-and-user${fd.friend_id}",
                          }
                        }
                      ) {
                        room {
                          id
                          description
                        }
                      }
                    
                    }
                `;
                try {
                  console.log("payload", query, token);
                  let res = await handleQuery(query, token);
                  console.log("Here now", res);
                  let data = res.data;
                  console.log("start_chat",res.data);
                  
                  let response = chat_history(fd.user_id, token);
                  console.log("response",response);
                  
                  return response;
                } catch (err) {
                  console.log(err);
                  return err;
                }
               
           }else{
                console.log("else part", exist.data);
               let response = chat_history(fd.user_id, token);
                  console.log("response",response);
                return response;
           }
    
}

async function chat_history(user_id, token){
    
    
    const query = `
        query{
         rooms(where:{_or:[{friend_id:${user_id}}, {user_id: ${user_id}}]}) {
              id
              description
              user_id{
                   id
                    firstname
                    lastname
                    avatar
              }
              friend_id{
                   id
                    firstname
                    lastname
                    avatar
              }
               messages(sort:"created_at:desc"){
                  id
                  text
                  created_at
                  image
                  sender_id{
                    id
                    firstname
                    lastname
                    avatar
                  }
                  recipient_id{
                    id
                    firstname
                    lastname
                    avatar
                  }
                }
            }
        }`;

    try {
    
      console.log("query", query, token);
      let res = await handleQuery(query, token);
      let data = res.data;
      console.log("chat_history",data);

      //return await strapi.services.groups.find(query);
      return data;

      //ctx.send("Hello World!");
    } catch (err) {
      console.log(err);
      return err;
    }
    
}
module.exports = {
    chat_history,
    get_messages,
    send_message,
    delete_message,
    get_contacts,
    read_message,
    start_chat
}
