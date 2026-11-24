package com.example.demo.dto;

import com.example.demo.model.Role;
import com.example.demo.model.User;

public record UserResponse(
        Long id,
        String nom,
        String email,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getEmail(),
                user.getRole()
        );
    }
}