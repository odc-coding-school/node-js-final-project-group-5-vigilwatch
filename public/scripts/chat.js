//Selecting the Elements
const ChatRooom = document.querySelector(".chat-room");
const chatMessageHolder = document.querySelector(".chat-message-holder");
const groupMember = document.querySelector(".group-members");
const chatMessagesWrapper = document.querySelector(".chat-message");
let messageInput = document.getElementById("input-field");
let form = document.getElementById("form");

//Url fetching group or room members
const membersUrl = "http://localhost:5000/members";

// fetching the user group members after beign login
async function groupMembers() {
	try {
		const response = await fetch(membersUrl);
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
				
        `;
	});

	displayMembers = displayMembers.join("");
	groupMember.innerHTML = displayMembers;
}

//calling the display group members function
displayGroupMembers();

//Storaging room id and user id in local storage
const userInfo = JSON.parse(localStorage.getItem("token"));
const userRoomInfo = JSON.parse(localStorage.getItem("room"));

let roomID = userInfo.room_id;
const userID = userInfo.id;
console.log(roomID);
console.log(userID);

//requiring socket io client
const socket = io();

//join the group buy the group id
socket.emit("join-room", roomID);

//previous messages display to all user in group
socket.on("previous-message", (previouMessage) => {
	previouMessage.message.map((prevMessage) => {
		const newMessageWrapper = document.createElement("div");

		//adding the blue and gray background on the chat base on the id
		if (prevMessage.id === userID) {
			newMessageWrapper.innerHTML = `
             <div class="message-top flex flex-col align-right" id=${prevMessage.id}>
                        <div class="flex items-end">
                            <img class="w-10 h-10 rounded-full object-cover mr-3" src=${prevMessage.profile} alt="profile-image">
                            <span
                                class="current-user-bg message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72">${prevMessage.messageType}</span>
                        </div>
                        <div class="timestamp text-gray-400">${prevMessage.messageTime}</div>
                    </div>
            `;
		} else {
			newMessageWrapper.innerHTML = `
            <div class="message-top flex flex-col" id=${prevMessage.id}>
                       <div class="flex items-end">
                           <img class="w-10 h-10 rounded-full object-cover mr-3" src=${prevMessage.profile} alt="profile-image">
                        <span
                            class="message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72 members-bg">${prevMessage.messageType}</span>
                       </div>
                       <div class="timestamp text-gray-400">${prevMessage.messageTime}</div>
                   </div>
           `;
		}
		chatMessageHolder.appendChild(newMessageWrapper);
		console.log(prevMessage);

		chatMessagesWrapper.scrollTo =
			chatMessagesWrapper.scrollHeight - chatMessagesWrapper.clientHeight;
	});

	window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener("submit", (e) => {
	let textMessage = messageInput.value;

	e.preventDefault();

	//sending the message
	if (messageInput.value) {
		socket.emit("send-message", {
			userID,
			roomID,
			message: messageInput.value,
		});
		messageInput.value = "";
	}
	messageInput.focus();
});

socket.on("new-message", function (newMessage) {
	const newMessageWrapper = document.createElement("div");

	console.log(newMessage);

	// //adding the blue and gray background on the chat base on the if new message id match logged in user id
	if (newMessage.userId === userID) {
		newMessageWrapper.innerHTML = `
         <div class=" align-right message-top flex flex-col" id=${newMessage.userId}>
                    <div class="flex items-end">
                        <img class="w-10 h-10 rounded-full object-cover mr-3" src=${newMessage.userprofile} alt="profile-image">
                        <span class="current-user message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72 current-user-bg">${newMessage.newMessage}</span>
                    </di
                </div>
        `;
	} else {
		newMessageWrapper.innerHTML = `
        <div class="message-top flex flex-col" id=${newMessage.userId}>
                   <div class="flex items-end">
                       <img class="w-10 h-10 rounded-full object-cover mr-3" src=${newMessage.userprofile} alt="profile-image">
                       <span
                        class="members message text-sm md:text-lg bg-gray-200 text-black px-7 py-2 rounded-lg max-w-72 members-bg">${newMessage.newMessage}</span>
                </di
            </div>
       `;
	}

	chatMessageHolder.appendChild(newMessageWrapper);

	// textArea.scrollHeight + "px";
});

//resizing the text aras base on message size
function resizeTextArea(textArea) {
	textArea.style.height = "auto";
	textArea.style.height = textArea.scrollHeight + "px";
}
messageInput.addEventListener("input", () => {
	resizeTextArea(messageInput);
});

document.addEventListener("DOMContentLoaded", () => {
	resizeTextArea(messageInput);
});
