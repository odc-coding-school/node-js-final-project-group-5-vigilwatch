
//Fetch user Data on HomePage 
document.addEventListener("DOMContentLoaded", ()=>{

    // if(!token) {
    //     location.href = "/login"
    // }

//fetching login user info
    fetch('http://localhost:5000/api/loginuser')
    .then(res=>{
        if(res.ok) {
            return res.json()
        }
        throw new Error("Failed to fetch user data")
    })
    .then(data=>{
        localStorage.setItem("token", JSON.stringify(data)); 
    })


//fetching login user room info
    fetch('http://localhost:5000/api/room')
    .then(res=>{
        if(res.ok) {
            return res.json()
        }
        throw new Error("Failed to fetch user room data")
    })
    .then(data=>{
        localStorage.setItem("room", JSON.stringify(data));
    })
})


