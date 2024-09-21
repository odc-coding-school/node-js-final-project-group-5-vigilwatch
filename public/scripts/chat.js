

//Selecting the Elements
const ChatRooom = document.querySelector('.chat-room');
const chatMessageHolder = document.querySelector('.chat-message-holder');
const groupMember = document.querySelector('.group-members');
let messageInput = document.querySelector('.input-field');


//Url fetching group or room members
const membersUrl = "http://localhost:5000/members";


// fetching the user group members after beign login
async function groupMembers() {

    try {
        const response = await fetch(membersUrl)
        if (!response.ok) {
            throw new Error("network response was not ok");
        } else {
            const data = await response.json();
            return data;
        }

    } catch (error) {
        console.error("Error fetching members", error);

    }

}


//displaying group members
async function displayGroupMembers() {
    let data = await groupMembers();

    //displaying the data to the front end
    let displayMembers = data.map(function (data) {
        ChatRooom.innerHTML = `${data.address} Group Chat`;

        return `
            <div class="member-wrapper flex items-center hover:bg-gray-300 cursor-pointer mt-5" data-id=${data.id}>
				<img class="profile w-10 h-10 rounded-full object-cover mr-3" src="${data.profilePic}" alt="profile-image">
				<span class="member font-semibold">${data.full_name}</span>
			</div>
				
        `
    });

    displayMembers = displayMembers.join("");
    groupMember.innerHTML = displayMembers;
}


//calling the display group members function
displayGroupMembers()



//Storaging room id and user id in local storage
const userInfo = JSON.parse(localStorage.getItem("token"));
const userRoomInfo = JSON.parse(localStorage.getItem("room"));

let roomID = userInfo.room_id;
const userID = userInfo.id
console.log(roomID);
console.log(userID);


//requiring socket io client
const socket = io();

//join the group buy the group id
socket.emit("join-room", roomID);

//checking if the user join the group
socket.on("join-room", (roomID) => {
    console.log(`user as joined the group with id${roomID}`);
})

//previous messages display to all user in group
socket.on("previous-message", async (previouMessage, userProfile) => {

    console.log(previouMessage,userProfile);

})




//sending the message
function sendMessage() {
    let message = messageInput.value;

    if (message) {
        socket.emit("send-message", userID, roomID, message);
        messageInput.value = "";

        console.log(userID, roomID, message);
        
    }

    messageInput.focus();


    socket.on("new-message", (newMessage) => {
        const newMessageWrapper = document.createElement("section");

        newMessageWrapper.innerHTML = `
         <div class="message-top flex flex-col" id=${newMessage.userID}>
                    <div class="flex items-end">
                        <img class="w-10 h-10 rounded-full object-cover mr-3" src=${newMessage.userProfile[0].profilePic} alt="profile-image">
                        <span
                            class="message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72">${newMessage.sendmessage}?</span>
                    </div>
                    <div class="timestamp text-gray-400">1 hour ago</div>
                </div>
        `


        chatMessageHolder.appendChild(newMessageWrapper)

        console.log(newMessage);

        chatMessageHolder.scrollTo= chatMessageHolder.scrollHeight;

    })



}






