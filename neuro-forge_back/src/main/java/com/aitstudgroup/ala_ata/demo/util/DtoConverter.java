package com.aitstudgroup.ala_ata.demo.util;

import java.util.List;
import java.util.stream.Collectors;

import com.aitstudgroup.ala_ata.demo.dto.*;
import com.aitstudgroup.ala_ata.demo.model.*;

public class DtoConverter {
    
    // Player конвертеры
    public static PlayerResponse toPlayerResponse(Player player) {
        return new PlayerResponse(player, null);
    }
    
    public static List<PlayerResponse> toPlayerResponseList(List<Player> players) {
        return players.stream()
                .map(DtoConverter::toPlayerResponse)
                .collect(Collectors.toList());
    }
    
    // AIModel конвертеры
    public static ModelResponse toModelResponse(AIModel model) {
        return new ModelResponse(model);
    }
    
    public static List<ModelResponse> toModelResponseList(List<AIModel> models) {
        return models.stream()
                .map(DtoConverter::toModelResponse)
                .collect(Collectors.toList());
    }
    
    // ResourceWallet конвертеры
    public static WalletResponse toWalletResponse(ResourceWallet wallet) {
        return new WalletResponse(wallet);
    }
    
    // Upgrade конвертеры
    public static UpgradeResponse toUpgradeResponse(Upgrade upgrade) {
        return new UpgradeResponse(upgrade);
    }
    
    public static List<UpgradeResponse> toUpgradeResponseList(List<Upgrade> upgrades) {
        return upgrades.stream()
                .map(DtoConverter::toUpgradeResponse)
                .collect(Collectors.toList());
    }
}