import { db } from "../firebase/firebase.js";

import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const params=new URLSearchParams(window.location.search);

const workerId=params.get("id");

async function loadWorker(){

const snap=await getDoc(doc(db,"users",workerId));

if(!snap.exists()){

document.body.innerHTML="<h1>Worker Not Found</h1>";

return;

}

const data=snap.data();

document.getElementById("name").innerHTML=data.name;

document.getElementById("category").innerHTML="Category : "+data.category;

document.getElementById("experience").innerHTML=
"Experience : "+data.experience+" Years";

document.getElementById("rate").innerHTML=
"Rate : ₹"+data.hourlyRate+"/Hr";

document.getElementById("city").innerHTML=
"City : "+data.city;

document.getElementById("rating").innerHTML=
"Rating : ⭐ "+data.rating;

document.getElementById("description").innerHTML=
"About : "+data.description;

document.getElementById("availability").innerHTML=
data.availability
?
"🟢 Available"
:
"🔴 Not Available";

}

loadWorker();

document.getElementById("hireBtn").addEventListener("click",()=>{

window.location.href=
`booking.html?workerId=${workerId}`;

});