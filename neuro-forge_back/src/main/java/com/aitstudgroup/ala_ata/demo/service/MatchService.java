package com.aitstudgroup.ala_ata.demo.service;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aitstudgroup.ala_ata.demo.model.Match;
import com.aitstudgroup.ala_ata.demo.repository.AIModelRepository;
import com.aitstudgroup.ala_ata.demo.repository.MatchRepository;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MatchService {
    private static final Logger logger = LoggerFactory.getLogger(MatchService.class);
    
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final AIModelRepository aiModelRepository;
    private final PlayerService playerService;
    
    @Autowired
    public MatchService(
            MatchRepository matchRepository,
            PlayerRepository playerRepository,
            AIModelRepository aiModelRepository,
            PlayerService playerService) {
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
        this.aiModelRepository = aiModelRepository;
        this.playerService = playerService;
    }
    
    // Создать новый матч
    @Transactional
    public Mono<Match> createMatch(Long player1Id, Long player2Id, Long player1ModelId, Long player2ModelId, String matchType) {
        logger.debug("Создание матча: игрок {} vs игрок {}, тип {}", player1Id, player2Id, matchType);
        
        if (player1Id.equals(player2Id)) {
            return Mono.error(new IllegalArgumentException("Игрок не может соревноваться сам с собой"));
        }
        
        if (matchType == null || matchType.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Тип матча должен быть указан"));
        }
        
        // Проверяем существование игроков и моделей (если указаны)
        return Mono.zip(
                playerRepository.findById(player1Id)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Игрок 1 не найден"))),
                playerRepository.findById(player2Id)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Игрок 2 не найден"))),
                player1ModelId != null ? 
                    aiModelRepository.findById(player1ModelId)
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель игрока 1 не найдена"))) 
                    : Mono.just(null),
                player2ModelId != null ? 
                    aiModelRepository.findById(player2ModelId)
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель игрока 2 не найдена"))) 
                    : Mono.just(null)
            )
            .flatMap(tuple -> {
                Match match = new Match();
                match.setPlayer1Id(player1Id);
                match.setPlayer2Id(player2Id);
                match.setPlayer1ModelId(player1ModelId);
                match.setPlayer2ModelId(player2ModelId);
                match.setMatchType(matchType);
                match.setStartedAt(Instant.now());
                
                return matchRepository.save(match);
            });
    }
    
    // Получить матч по ID
    public Mono<Match> getMatchById(Long matchId) {
        return matchRepository.findById(matchId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Матч с ID " + matchId + " не найден")));
    }
    
    // Получить активные матчи игрока
    public Flux<Match> getActiveMatchesByPlayerId(Long playerId) {
        return matchRepository.findActiveMatchesByPlayerId(playerId);
    }
    
    // Получить историю матчей игрока
    public Flux<Match> getPlayerMatchHistory(Long playerId, int limit) {
        return matchRepository.findMatchesByPlayerId(playerId, limit);
    }
    
    // Завершить матч и обновить ELO рейтинг
    @Transactional
    public Mono<Match> finishMatch(Long matchId, Long winnerId, Integer player1Score, Integer player2Score, String matchData) {
        logger.debug("Завершение матча {}, победитель: {}", matchId, winnerId);
        
        Instant endTime = Instant.now();
        
        if (player1Score == null || player2Score == null) {
            return Mono.error(new IllegalArgumentException("Счет должен быть указан для обоих игроков"));
        }
        
        return matchRepository.findById(matchId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Матч с ID " + matchId + " не найден")))
            .flatMap(match -> {
                // Проверяем, что матч еще не завершен
                if (match.getEndedAt() != null) {
                    return Mono.error(new IllegalArgumentException("Матч уже завершен"));
                }
                
                // Проверяем, что winnerId соответствует одному из игроков или null (ничья)
                if (winnerId != null && 
                    !match.getPlayer1Id().equals(winnerId) && 
                    !match.getPlayer2Id().equals(winnerId)) {
                    return Mono.error(new IllegalArgumentException("Победитель должен быть одним из участников матча"));
                }
                
                // Обновляем данные матча
                return matchRepository.finishMatch(matchId, winnerId, player1Score, player2Score, endTime)
                    .then(matchData != null ? matchRepository.updateMatchData(matchId, matchData) : Mono.just(0))
                    .then(matchRepository.findById(matchId));
            })
            .flatMap(updatedMatch -> {
                // Обновляем ELO рейтинг игроков (только если есть победитель)
                if (updatedMatch.getWinnerId() != null) {
                    Long winnerPlayerId = updatedMatch.getWinnerId(); // Переименовано для избежания затенения
                    Long loserId = winnerPlayerId.equals(updatedMatch.getPlayer1Id()) 
                        ? updatedMatch.getPlayer2Id() : updatedMatch.getPlayer1Id();
                    
                    // Базовое изменение рейтинга
                    int eloChange = calculateEloChange(
                        updatedMatch.getPlayer1Score(), 
                        updatedMatch.getPlayer2Score()
                    );
                    
                    logger.debug("Изменение рейтинга: +{} для победителя, -{} для проигравшего", eloChange, eloChange);
                    
                    return playerService.updatePlayerElo(winnerPlayerId, eloChange)
                        .then(playerService.updatePlayerElo(loserId, -eloChange))
                        .thenReturn(updatedMatch);
                }
                
                // В случае ничьи рейтинг не меняется
                return Mono.just(updatedMatch);
            });
    }
    
    // Рассчитать изменение ELO на основе разницы в счете
    private int calculateEloChange(int player1Score, int player2Score) {
        // Базовое изменение
        int baseChange = 25;
        
        // Рассчитываем множитель на основе разницы в счете
        int scoreDifference = Math.abs(player1Score - player2Score);
        double multiplier = 1.0;
        
        if (scoreDifference > 10) {
            multiplier = 1.5; // Большой отрыв - больше очков
        } else if (scoreDifference < 3) {
            multiplier = 0.8; // Небольшая разница - меньше очков
        }
        
        return (int)(baseChange * multiplier);
    }
    
    // Получить статистику игрока (победы/всего)
    public Mono<Double> getPlayerWinRate(Long playerId) {
        return Mono.zip(
                matchRepository.countWinsByPlayerId(playerId),
                matchRepository.countMatchesByPlayerId(playerId)
            )
            .map(tuple -> {
                long wins = tuple.getT1();
                long total = tuple.getT2();
                
                return total > 0 ? (double) wins / total : 0.0;
            });
    }
    
    // Отменить матч
    @Transactional
    public Mono<Void> cancelMatch(Long matchId, Long requesterId) {
        logger.debug("Попытка отмены матча {} игроком {}", matchId, requesterId);
        
        return matchRepository.findById(matchId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Матч с ID " + matchId + " не найден")))
            .flatMap(match -> {
                // Проверяем, что матч активен
                if (match.getEndedAt() != null) {
                    return Mono.error(new IllegalArgumentException("Нельзя отменить завершенный матч"));
                }
                
                // Проверяем, что запрос отмены поступил от одного из участников
                if (!match.getPlayer1Id().equals(requesterId) && !match.getPlayer2Id().equals(requesterId)) {
                    return Mono.error(new IllegalArgumentException("Только участник матча может его отменить"));
                }
                
                // Удаляем матч
                return matchRepository.deleteById(matchId);
            });
    }
    
    // Получить матчи определенного типа
    public Flux<Match> getMatchesByType(String matchType, int limit) {
        return matchRepository.findByMatchTypeOrderByStartedAtDesc(matchType)
            .take(limit);
    }
}