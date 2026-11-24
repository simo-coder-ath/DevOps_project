// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequire } from "module";


const require = createRequire(import.meta.url);




const {

  buildRequestBody, formatError, renderUsers, fetchUsers, sendUser, removeUser,
} = require("./logic.js");






describe("buildRequestBody", () => {




  it("trim nom et email", () => {



    const body = buildRequestBody({ nom: "  Alice ", email: " a@b.com ", role: "USER" });
    expect(body).toEqual({ nom: "Alice", email: "a@b.com", role: "USER" });
  });



});










describe("formatError", () => {
  



  it("joint les erreurs de champs", () => {
    const msg = formatError(400, { errors: { nom: "Nom obligatoire", email: "Email invalide" } });
    expect(msg).toBe("Nom obligatoire / Email invalide");
  });








  it("utilise message", () => {



    expect(formatError(409, { message: "Email deja utilise" })).toBe("Email deja utilise");
 


});







  it("retourne Erreur <status> sans corps", () => {



    expect(formatError(500, null)).toBe("Erreur 500");



  });




});























describe("renderUsers", () => {

    
  it("cree une ligne par utilisateur et echappe le HTML", () => {
   
   
   
    const tbody = document.createElement("tbody");


    const users = [
      { id: 1, nom: "<b>Alice</b>", email: "a@b.com", role: "USER" },
      { id: 2, nom: "Bob", email: "b@b.com", role: "ADMIN" },
    ];



    renderUsers(users, tbody, { onEdit:vi.fn(), onDelete: vi.fn() });

    expect(tbody.querySelectorAll("tr")).toHaveLength(2);
   
   
    expect(tbody.querySelector("td:nth-child(2)").textContent).toBe("<b>Alice</b>");
   
   
    expect(tbody.querySelector("b")).toBeNull();
  });





  






  it("branche les handlers Modifier et Supprimer", () => {



    const tbody = document.createElement("tbody");



    const user = { id: 7, nom: "Bob", email: "b@b.com", role: "USER" };
   
   
    const handlers = { onEdit: vi.fn(), onDelete: vi.fn() };



    renderUsers([user], tbody, handlers);



    const [editBtn, deleteBtn] = tbody.querySelectorAll("button");
    editBtn.click();
    deleteBtn.click();



    expect(handlers.onEdit).toHaveBeenCalledWith(user);



    expect(handlers.onDelete).toHaveBeenCalledWith(7);
  });



});











describe("acces reseau (fetch simule)", () => {


  beforeEach(() => {
    globalThis.fetch = vi.fn();


  });





  it("fetchUsers renvoie la liste", async () => {



    fetch.mockResolvedValue({ ok: true, json: async () => [{ id: 1 }] });



    expect(await fetchUsers()).toEqual([{ id: 1 }]);



    expect(fetch).toHaveBeenCalledWith("/api/users");




  });










  it("fetchUsers leve une erreur formatee", async () => {




    fetch.mockResolvedValue({



      ok: false,
      status: 500,
      json: async () => { throw new Error(); },



    });





    await expect(fetchUsers()).rejects.toThrow("Erreur 500");






  });










  
  it("sendUser choisit POST ou PUT", async () => {


    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });



    const values = { nom: "A", email: "a@b.com", role: "USER" };






    await sendUser("", values);



    expect(fetch.mock.calls[0][0]).toBe("/api/users");




    expect(fetch.mock.calls[0][1].method).toBe("POST");

    await sendUser("3", values);



    expect(fetch.mock.calls[1][0]).toBe("/api/users/3");



    expect(fetch.mock.calls[1][1].method).toBe("PUT");




  });
















  it("sendUser propage l'erreur 409", async () => {



    fetch.mockResolvedValue({
      ok: false,
      status: 409,


      json: async () => ({ message: "Email deja utilise" }),


    });




    await expect(sendUser("", { nom: "A", email: "a@b.com", role: "USER" }))
      .rejects.toThrow("Email deja utilise");





  });












  it("removeUser envoie DELETE", async () => {
    fetch.mockResolvedValue({ ok: true });
    await removeUser(5);
    expect(fetch).toHaveBeenCalledWith("/api/users/5", { method: "DELETE" });
  });
});