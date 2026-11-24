package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;




@Entity
@Table(name = "users")
public class User {




    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @NotBlank
    @Column(nullable = false)
    private String nom;



    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;



    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;




    public User() {
    }




    public User(String nom, String email, Role role) {
        this.nom = nom;
        this.email = email;
        this.role = role;
    }





    public Long getId() { return id; }



    public void setId(Long id) { this.id = id; }




    public String getNom() { return nom; }

    public void setNom(String nom) { this.nom = nom; }



    public String getEmail() { return email; }


    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }


    
    public void setRole(Role role) { this.role = role; }
}