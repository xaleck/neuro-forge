package com.aitstudgroup.ala_ata.demo.dto;

public class LoginRequest {
    private String username;
    private String password;
    
    // Геттеры и сеттеры
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}