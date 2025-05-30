package com.aitstudgroup.ala_ata.demo.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.aitstudgroup.ala_ata.demo.service.AIModelService;
import com.aitstudgroup.ala_ata.demo.service.ResourceService;

@Component
public class PassiveIncomeTask {
    private static final Logger logger = LoggerFactory.getLogger(PassiveIncomeTask.class);
    
    private final AIModelService aiModelService;
    private final ResourceService resourceService;
    
    @Autowired
    public PassiveIncomeTask(AIModelService aiModelService, ResourceService resourceService) {
        this.aiModelService = aiModelService;
        this.resourceService = resourceService;
    }
    
    @Scheduled(fixedRate = 60000) // Каждую минуту
    public void processPassiveIncome() {
        logger.info("Начисление пассивного дохода...");
        
        aiModelService.findAllDeployedModels()
            .flatMap(model -> {
                int income = model.getCreditsPerMinute();
                if (income <= 0) {
                    return aiModelService
                        .recalculateModelIncome(model.getId())
                        .flatMap(newIncome -> 
                            resourceService.addCredits(model.getPlayerId(), newIncome)
                        );
                }
                
                return resourceService.addCredits(model.getPlayerId(), income);
            })
            .subscribe(
                wallet -> logger.debug("Кредиты начислены: {}", wallet.getCloudCredits()),
                error -> logger.error("Ошибка при начислении пассивного дохода: {}", error.getMessage())
            );
    }
}