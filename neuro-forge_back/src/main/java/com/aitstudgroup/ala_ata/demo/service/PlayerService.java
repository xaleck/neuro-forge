package com.aitstudgroup.ala_ata.demo.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aitstudgroup.ala_ata.demo.model.Player;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;
import com.aitstudgroup.ala_ata.demo.repository.ResourceWalletRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final ResourceWalletRepository resourceWalletRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PlayerService(
            PlayerRepository playerRepository,
            ResourceWalletRepository resourceWalletRepository,
            PasswordEncoder passwordEncoder) {
        this.playerRepository = playerRepository;
        this.resourceWalletRepository = resourceWalletRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // Регистрация нового игрока
    @Transactional
    public Mono<Player> registerPlayer(String username, String email, String password) {
        // Проверка на пустые значения
        if (username == null || username.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Имя пользователя не может быть пустым"));
        }
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return Mono.error(new IllegalArgumentException("Некорректный email"));
        }
        if (password == null || password.length() < 6) {
            return Mono.error(new IllegalArgumentException("Пароль должен содержать минимум 6 символов"));
        }
        
        // Проверяем существование и username и email
        return playerRepository.findByUsername(username)
            .flatMap(existingPlayer -> Mono.error(new IllegalArgumentException("Пользователь с таким именем уже существует")))
            .then(Mono.defer(() -> {
                // Создаем нового игрока
                Player player = new Player();
                player.setUsername(username);
                player.setEmail(email);
                player.setPasswordHash(passwordEncoder.encode(password));
                player.setEloRating(1000); // Начальный рейтинг
                player.setCreatedAt(Instant.now());
                
                // Сохраняем игрока и создаем кошелек
                return playerRepository.save(player)
                    .flatMap(savedPlayer -> 
                        resourceWalletRepository.createWalletForPlayer(savedPlayer.getId(), 500, 0)
                            .thenReturn(savedPlayer)
                    )
                    .onErrorResume(e -> {
                        // В случае ошибки создания кошелька, удаляем созданного игрока
                        return playerRepository.deleteById(player.getId())
                            .then(Mono.error(new RuntimeException("Ошибка при создании кошелька: " + e.getMessage())));
                    });
            }));
    }
    
    // Авторизация игрока
    public Mono<Player> authenticatePlayer(String username, String password) {
        return playerRepository.findByUsername(username)
            .filter(player -> passwordEncoder.matches(password, player.getPasswordHash()))
            .flatMap(player -> {
                player.setLastLoginAt(Instant.now());
                return playerRepository.save(player);
            });
    }
    
    // Получить игрока по ID
    public Mono<Player> getPlayerById(Long id) {
        return playerRepository.findById(id);
    }
    
    // Получить игрока по имени пользователя
    public Mono<Player> getPlayerByUsername(String username) {
        return playerRepository.findByUsername(username);
    }
    
    // Получить топ игроков по рейтингу
    public Flux<Player> getTopPlayersByElo(int limit) {
        return playerRepository.findAll()
            .sort((p1, p2) -> p2.getEloRating() - p1.getEloRating())
            .take(limit);
    }
    
    // Обновить рейтинг игрока
    public Mono<Void> updatePlayerElo(Long playerId, int eloChange) {
        return playerRepository.updateEloRating(playerId, eloChange);
    }
}