package com.presenceiq.presence;

import com.presenceiq.metrics.DailyMetrics;
import com.presenceiq.metrics.DailyMetricsRepository;
import com.presenceiq.user.User;
import com.presenceiq.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/presenceiq")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PresenceScoreController {

    private final DailyMetricsRepository metricsRepo;
    private final UserRepository userRepo;

    public PresenceScoreController(DailyMetricsRepository metricsRepo, UserRepository userRepo) {
        this.metricsRepo = metricsRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/score")
    public ScoreResponse getScore(Authentication auth) {

        String email = auth.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        List<DailyMetrics> metrics = metricsRepo.findByUserIdAndDateBetween(user.getId(), start, end);

        // ✅ If no data → default score
        if (metrics.isEmpty()) {
            return new ScoreResponse(50, 50, 50, 50, 50, 50);
        }

        // ✅ Average last 7 days
        double avgSleep = metrics.stream().mapToDouble(DailyMetrics::getSleepHours).average().orElse(0);
        double avgStudy = metrics.stream().mapToDouble(DailyMetrics::getStudyHours).average().orElse(0);
        double avgStress = metrics.stream().mapToDouble(DailyMetrics::getStressLevel).average().orElse(0);
        double avgExercise = metrics.stream().mapToDouble(DailyMetrics::getExerciseMinutes).average().orElse(0);
        double avgScreen = metrics.stream().mapToDouble(DailyMetrics::getScreenTimeMinutes).average().orElse(0);

        int recovery = clamp((int) ((avgSleep / 8.0) * 100));
        int intellect = clamp((int) ((avgStudy / 8.0) * 100));
        int vitality = clamp((int) ((avgExercise / 60.0) * 100));
        int zen = clamp(100 - (int) ((avgStress / 10.0) * 100));
        int digitalHygiene = clamp(100 - (int) ((avgScreen / 360.0) * 100));

        // ✅ Weighted score + recovery multiplier
        double productivityBase = (intellect * 0.45) + (zen * 0.25) + (digitalHygiene * 0.30);
        double multiplier = 0.6 + (recovery / 100.0) * 0.4; // 0.6 to 1.0

        int iqCore = clamp((int) (productivityBase * multiplier));

        return new ScoreResponse(iqCore, intellect, vitality, zen, digitalHygiene, recovery);
    }

    private int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }

    // ✅ Response DTO (NO Lombok)
    public static class ScoreResponse {
        public int iqCore;
        public int intellect;
        public int vitality;
        public int zen;
        public int digitalHygiene;
        public int recovery;

        public ScoreResponse() {}

        public ScoreResponse(int iqCore, int intellect, int vitality, int zen, int digitalHygiene, int recovery) {
            this.iqCore = iqCore;
            this.intellect = intellect;
            this.vitality = vitality;
            this.zen = zen;
            this.digitalHygiene = digitalHygiene;
            this.recovery = recovery;
        }
    }
}
