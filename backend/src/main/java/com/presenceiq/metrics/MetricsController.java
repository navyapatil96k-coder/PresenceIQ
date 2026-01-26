package com.presenceiq.metrics;

import com.presenceiq.user.User;
import com.presenceiq.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/metrics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MetricsController {

    private final DailyMetricsRepository repo;
    private final UserRepository userRepo;

    public MetricsController(DailyMetricsRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    // ✅ Log today’s metrics (creates or updates)
    @PostMapping("/today")
    public DailyMetrics logToday(@RequestBody MetricsRequest req, Authentication auth) {

        String email = auth.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        LocalDate today = LocalDate.now();

        DailyMetrics dm = repo.findByUserIdAndDate(user.getId(), today).orElse(new DailyMetrics());

        dm.setUser(user);
        dm.setDate(today);

        dm.setSleepHours(req.sleepHours);
        dm.setStudyHours(req.studyHours);
        dm.setStressLevel(req.stressLevel);
        dm.setExerciseMinutes(req.exerciseMinutes);
        dm.setScreenTimeMinutes(req.screenTimeMinutes);

        // ✅ NEW fields
        dm.setPassiveScreenMinutes(req.passiveScreenMinutes);
        dm.setActiveLearningMinutes(req.activeLearningMinutes);

        return repo.save(dm);
    }

    // ✅ Fetch last 7 days
    @GetMapping("/last7")
    public List<DailyMetrics> last7(Authentication auth) {

        String email = auth.getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return repo.findTop7ByUserIdOrderByDateDesc(user.getId());
    }

    // ✅ Request DTO (NO Lombok)
    public static class MetricsRequest {
        public int sleepHours;
        public int studyHours;
        public int stressLevel;
        public int exerciseMinutes;
        public int screenTimeMinutes;

        // ✅ NEW fields
        public int passiveScreenMinutes;
        public int activeLearningMinutes;
    }
}
