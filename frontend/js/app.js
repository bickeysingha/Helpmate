const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

card.addEventListener("click",()=>{

alert(card.innerText+" Service Selected");

});

});