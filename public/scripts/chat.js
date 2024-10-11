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
const userName = userInfo.username;



//requiring socket io client
const socket = io()

//join the group by the group id
socket.emit("join-room", roomID);



//previous messages display to all user in group

// <div class="timestamp text-gray-400">${prevMessage.messageTime}</div>


socket.on("previous-message", (previouMessage) => {
	previouMessage.message.map((prevMessage) => {
		const newMessageWrapper = document.createElement("div");

		//adding the blue and gray background on the chat base on the id
		if (prevMessage.id === userID) {
			newMessageWrapper.innerHTML = `
             	<div class="message-top flex flex-col align-right mb-5" id=${prevMessage.id}>
			 		<span class="username text-gray-600 font-thin text-sm text-center">${prevMessage.fullName}</span>

                    <div class="flex items-end">
                        <img class="w-10 h-10 rounded-full object-cover mr-3" src=${prevMessage.profile} alt="profile-image">
                        <span
                        class="current-user-bg message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72">${prevMessage.messageType}</span>
                    </div>
					<div class="timestamp text-gray-400 text-sm">${prevMessage.messageTime}</div>

				</div>
            `;
		} else {
			newMessageWrapper.innerHTML = `
             	<div class="message-top flex flex-col mb-5" id=${prevMessage.id}>
			 		<span class="username text-gray-600 font-thin text-sm text-left">${prevMessage.fullName}</span>

                    <div class="flex items-end">
                        <img class="w-10 h-10 rounded-full object-cover mr-3" src=${prevMessage.profile} alt="profile-image">
                        <span
                        class="members-bg message text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-lg max-w-72">${prevMessage.messageType}</span>
                    </div>
					<div class="timestamp text-gray-400 text-sm">${prevMessage.messageTime}</div>

				</div>
            `;
		};


		chatMessageHolder.appendChild(newMessageWrapper);

		chatMessageHolder.scrollTo = chatMessageHolder.scrollHeight - chatMessageHolder.clientHeight
	});

});



form.addEventListener("submit", (e) => {
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



	//adding the blue and gray background on the chat base on the if new message id match logged in user id
	if (newMessage.userId === userID) {
		newMessageWrapper.innerHTML = `
          	<div class="message-top flex flex-col align-right ${newMessage.id}">
                <div class="flex items-end flex-col">
					<span class="username text-gray-600 font-thin text-sm text-center">${newMessage.userName}</span>
						
					<div class="flex items-center">
						<img class="w-10 h-10 rounded-full object-cover mr-3" src="${newMessage.userProfile}" alt="profile-image">
                        <div class="message current-user-bg text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-2xl max-w-72">${newMessage.newMessage}</div>
                    </div>
                </div>
            
            </div>
        `;
	} else {
		newMessageWrapper.innerHTML = `
          	<div class="message-top flex flex-col items-start ${newMessage.id}">
                <div class="flex items-end flex-col">
					<span class="username text-gray-600 font-thin text-sm text-center">${newMessage.userName}</span>
						
					<div class="flex items-center">
						<img class="w-10 h-10 rounded-full object-cover mr-3" src="${newMessage.userProfile}" alt="profile-image">
                        <div class="message members-bg text-sm md:text-lg bg-gray-200 text-black px-3 py-2 rounded-2xl max-w-72">${newMessage.newMessage}</div>
                    </div>
                </div>
            
            </div>
        `;
	}

	chatMessageHolder.appendChild(newMessageWrapper);

	chatMessageHolder.scrollTo = chatMessageHolder.scrollHeight - chatMessageHolder.clientHeight

	// textArea.scrollHeight + "px";
});

//resizing the text aras base on message size
function resizeTextArea(textArea) {
	textArea.style.height = "auto";
	textArea.style.height = textArea.scrollHeight + "px";
}
// messageInput.addEventListener("input", () => {
// 	resizeTextArea(messageInput);
// });

// document.addEventListener("DOMContentLoaded", () => {
// 	resizeTextArea(messageInput);
// });
