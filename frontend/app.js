const form = document.getElementById("user-form");



const idInput = document.getElementById("user-id");


const nomInput = document.getElementById("nom");

const emailInput = document.getElementById("email");


const roleInput = document.getElementById("role");






const cancelBtn = document.getElementById("cancel-btn");
const tbody = document.getElementById("users-body");
const messageBox = document.getElementById("message");











function showMessage(text, isError) {



  messageBox.textContent = text;
  messageBox.className = "message " + (isError ? "error" : "success");
  messageBox.hidden = false;



}





function hideMessage() {


  messageBox.hidden = true;



}













function resetForm() {


  form.reset();


  idInput.value = "";


  cancelBtn.hidden = true;





}














function editUser(user) {


  idInput.value = user.id;


  nomInput.value = user.nom;


  emailInput.value = user.email;


  roleInput.value = user.role;


  cancelBtn.hidden = false;





  hideMessage();





}














async function loadUsers() {



  try {


    const users = await fetchUsers();


    renderUsers(users, tbody, { onEdit: editUser, onDelete: deleteUser });
  } catch (e) {



    showMessage(e.message, true);




  }
}











async function deleteUser(id) {







  if (!confirm("Supprimer cet utilisateur ?")) return;
  try {





    await removeUser(id);


    showMessage("Utilisateur supprimé", false);

    await loadUsers();




  } catch (e) {



    showMessage(e.message, true);






  }





}

















form.addEventListener("submit", async (event) => {



  event.preventDefault();



  try {



    await sendUser(idInput.value, {



      nom: nomInput.value,
      email: emailInput.value,
      role: roleInput.value,
    });




    showMessage(idInput.value ? "Utilisateur modifié" : "Utilisateur créé", false);
    resetForm();
    await loadUsers();



  } catch (e) {
    showMessage(e.message, true);
  }


});




cancelBtn.addEventListener("click", () => {



  resetForm();
  hideMessage();


});



loadUsers();



