package com.presenceiq.presence;

import com.presenceiq.ai.OllamaAiService;
import com.presenceiq.metrics.DailyMetrics;
import com.presenceiq.metrics.DailyMetricsRepository;
import com.presenceiq.user.User;
import com.presenceiq.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/presenceiq")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AiSuggestionController {

    private final OllamaAiService aiService;
    private final DailyMetricsRepository metricsRepo;
    private final UserRepository userRepo;

    public AiSuggestionController(OllamaAiService aiService,
                                  DailyMetricsRepository metricsRepo,
                                  UserRepository userRepo) {
        this.aiService = aiService;
        this.metricsRepo = metricsRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/ai-suggestion")
    public Map<String, Object> aiSuggestion(Authentication auth) {

        String email = auth.getName();
        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null) {
            return Map.of(
                    "severity", "RED",
                    "title", "Auth issue",
                    "message", "User not found in DB",
                    "actions", List.of("Re-login with Google")
            );
        }

        LocalDate today = LocalDate.now();
        DailyMetrics m = metricsRepo.findByUserIdAndDate(user.getId(), today).orElse(null);

        if (m == null) {
            return Map.of(
                    "severity", "—",
                    "title", "No data yet",
                    "message", "Log today’s metrics first ✅",
                    "actions", List.of("Fill today’s metrics form", "Save metrics")
            );
        }

        String prompt = """
You are a productivity + wellness coach AI for PresenceIQ.
Give a short micro-intervention based on today's numbers.

Today's metrics:
Sleep=%d hours
Study=%d hours
Exercise=%d minutes
Stress=%d/10
Screen=%d minutes

Output ONLY 3 lines, no JSON:
1) Severity: GREEN / YELLOW / RED
2) Title: <short>
3) Suggestion: <1-2 lines>
Then write 3 actions starting with "- "
""".formatted(
                m.getSleepHours(),
                m.getStudyHours(),
                m.getExerciseMinutes(),
                m.getStressLevel(),
                m.getScreenTimeMinutes()
        );

        String aiText = aiService.ask(prompt);

        if (aiText == null || aiText.trim().isEmpty()) {
            return Map.of(
                    "severity", "YELLOW",
                    "title", "AI not responding",
                    "message", "Ollama returned empty response",
                    "actions", List.of("Try Refresh AI", "Restart Ollama")
            );
        }

        // ✅ Always return message (no parsing)
        return Map.of(
                "severity", "GREEN",
                "title", "AI Suggestion",
                "message", aiText,
                "actions", List.of("Refresh AI", "Log metrics again", "Start Focus Vault")
        );
    }
}
