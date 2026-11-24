const API_URL = "/api/users";




function buildRequestBody(values) {


  return {



    nom: values.nom.trim(),
    email: values.email.trim(),
    role: values.role,




  };
}








function formatError(status, body) {




  if (body && body.errors) {


    return Object.values(body.errors).join(" / ");
  }




  if (body && body.message) {



    return body.message;


  }






  return "Erreur " + status;
}












function renderUsers(users, tbody, handlers) {



  tbody.replaceChildren();



  users.forEach((user) => {



    const tr = document.createElement("tr");
  
    [user.id, user.nom, user.email, user.role].forEach((value) => {
    
    
        const td = document.createElement("td");


      td.textContent = value;


      tr.appendChild(td);



    });






    const actions = document.createElement("td");


    const editBtn = document.createElement("button");



    editBtn.textContent = "Modifier";


    editBtn.addEventListener("click", () => handlers.onEdit(user));
  
  
    const deleteBtn = document.createElement("button");
   
   
    deleteBtn.textContent = "Supprimer";
   
   
    deleteBtn.className = "danger";


    deleteBtn.addEventListener("click", () => handlers.onDelete(user.id));
   
   
    actions.append(editBtn, deleteBtn);
   
   
    tr.appendChild(actions);


    tbody.appendChild(tr);




  });
}








async function parseBody(response) {



  try {


    return await response.json();


  } catch {



    return null;



  }


}













async function fetchUsers() {



  const response = await fetch(API_URL);


  if (!response.ok) {


    throw new Error(formatError(response.status, await parseBody(response)));
  }


  return response.json();



}












async function sendUser(id, values) {



  const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {



    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRequestBody(values)),


  });



  if (!response.ok) {



    throw new Error(formatError(response.status, await parseBody(response)));


}



  return response.json();



}












async function removeUser(id) {





  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });


  if (!response.ok) {
 
 
    throw new Error(formatError(response.status, await parseBody(response)));
 


}


}











if (typeof module !== "undefined") {



  module.exports = {



    buildRequestBody, formatError, renderUsers,
    fetchUsers, sendUser, removeUser,


  };








  
}