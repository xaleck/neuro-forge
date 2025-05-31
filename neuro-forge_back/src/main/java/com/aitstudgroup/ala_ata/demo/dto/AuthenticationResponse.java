package com.aitstudgroup.ala_ata.demo.dto;

public class AuthenticationResponse {
    private final String token;
    private final PlayerResponse user;

    public AuthenticationResponse(String token, PlayerResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public PlayerResponse getUser() {
        return user;
    }
} 