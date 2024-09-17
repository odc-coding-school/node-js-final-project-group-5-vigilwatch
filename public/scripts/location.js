const selectTag = document.querySelector('.address');



const url = `http://localhost:5000/location`;

let result;



fetch(url)
.then(res=>res.json())
.then(data=>{
    data.map(location=>{
        let option = document.createElement('option');
        option.innerHTML +=`
        <option class="option" value="${location.location}">${location.location}</option>
        ` 

        selectTag.appendChild(option)
        
        
    })
    
    const option = document.querySelector('.option');
    console.log(option);

    selectTag.addEventListener("change", (e)=>{
        const targetOption = e.target.options[e.target.selectedIndex];

        console.log(targetOption.value);
        
        
        selectTag.value =targetOption.value;
         
    })
}
)




