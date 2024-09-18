const chatBtn = document.querySelector('.chat-app-btn');
const chatContainer = document.querySelector('.chat-container');
const ChatRooom = document.querySelector('.chat-room');
const profile = document.querySelector('.profile');
const member = document.querySelector('.member');
const groupMember = document.querySelector('.group-members');


//Url fetching group or room members
const membersUrl = "http://localhost:5000/members";



chatBtn.addEventListener('click', async () => {
    !chatContainer.classList.contains('hidden') ? chatContainer.classList.add('hidden') : chatContainer.classList.remove('hidden')

    let datas = await groupMembers();

    let displayMembers=datas.map(function (data) {
        ChatRooom.innerHTML = `${data.address} Group Chat`;
        
        return `
            <div class="member-wrapper flex items-center hover:bg-gray-300 cursor-pointer mt-5">
				<img class="profile w-10 h-10 rounded-full object-cover mr-3" src="${data.profilePic}" alt="profile-image">
				<span class="member font-semibold">${data.full_name}</span>
			</div>
				
        `
    })
    displayMembers= displayMembers.join("");
    groupMember.innerHTML = displayMembers

});


//fetching the user group members after beign login
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






