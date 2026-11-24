package com.example.demo.service;



import com.example.demo.dto.UserRequest;



import com.example.demo.dto.UserResponse;
import com.example.demo.exception.EmailAlreadyUsedException;
import com.example.demo.exception.UserNotFoundException;



import com.example.demo.model.Role;



import com.example.demo.model.User;



import com.example.demo.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;


import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;



import org.mockito.InjectMocks;

import org.mockito.Mock;


import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;


import java.util.Optional;






import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;


import static org.mockito.Mockito.*;

/*
 test unitaire de userservice
 */




@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UserRequest request;

    @BeforeEach
    void setUp() {
        request = new UserRequest("Alice", "alice@mail.com", Role.USER);
    }

  


    @Test
    void create_whenEmailFree_savesAndReturnsUser() {


        when(userRepository.existsByEmail("alice@mail.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
          
            User u = inv.getArgument(0);
           
           
           
            u.setId(1L);
            return u;
        });




        UserResponse result = userService.create(request);

        assertEquals(1L, result.id());
        assertEquals("Alice", result.nom());


        assertEquals(Role.USER, result.role());
        verify(userRepository).save(any(User.class));
    }












    @Test
    void create_whenEmailTaken_throwsConflict() {
        when(userRepository.existsByEmail("alice@mail.com")).thenReturn(true);

        assertThrows(EmailAlreadyUsedException.class, () -> userService.create(request));
     
     
     
     
     
     
        verify(userRepository, never()).save(any(User.class));
    }

    










    @Test
    void findById_whenExists_returnsUser() {
      
      
        User user = new User("Alice", "alice@mail.com", Role.USER);
        user.setId(1L);
       
       
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserResponse result = userService.findById(1L);

        assertEquals("alice@mail.com", result.email());




    }











    @Test
    void findById_whenMissing_throwsNotFound() {
     
     
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.findById(99L));
  
  
  
  
    }










    @Test
    void findAll_returnsAllUsers() {
      
      
        User u1 = new User("Alice", "alice@mail.com", Role.USER);
     
     
     
        User u2 = new User("Bob", "bob@mail.com", Role.ADMIN);
      
      
        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<UserResponse> result = userService.findAll();

        assertEquals(2, result.size());
     
     
     
        assertEquals("Bob", result.get(1).nom());




    }








    @Test
    void update_whenValid_updatesFields() {




        User existing = new User("Old", "old@mail.com", Role.USER);



        existing.setId(1L);
       
       
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
      
      
      
        when(userRepository.existsByEmailAndIdNot("alice@mail.com", 1L)).thenReturn(false);
      
      
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = userService.update(1L, request);

        assertEquals("Alice", result.nom());
      
      
      
        assertEquals("alice@mail.com", result.email());



    }

















    @Test
    void update_whenMissing_throwsNotFound() {
      
      
      
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

      
        assertThrows(UserNotFoundException.class, () -> userService.update(99L, request));
  
  
  
  
    }














    @Test
    void update_whenEmailUsedByOther_throwsConflict() {
     
     
        User existing = new User("Old", "old@mail.com", Role.USER);
     
     
        existing.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
    
    
    
        when(userRepository.existsByEmailAndIdNot("alice@mail.com", 1L)).thenReturn(true);

 
        assertThrows(EmailAlreadyUsedException.class, () -> userService.update(1L, request));
  
  
  
        verify(userRepository, never()).save(any(User.class));
    }
















    @Test
    void delete_whenExists_deletes() {
    
    
        when(userRepository.existsById(1L)).thenReturn(true);

     
     
        userService.delete(1L);

        verify(userRepository).deleteById(1L);
    }










    @Test
    void delete_whenMissing_throwsNotFound() {
    
    
        when(userRepository.existsById(99L)).thenReturn(false);

     
     
        assertThrows(UserNotFoundException.class, () -> userService.delete(99L));
     
     
     
     
     
     
        verify(userRepository, never()).deleteById(anyLong());
   
   
   
   
   
   
    }










    
}