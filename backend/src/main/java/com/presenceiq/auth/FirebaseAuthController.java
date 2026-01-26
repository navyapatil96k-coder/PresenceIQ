package com.presenceiq.auth;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.presenceiq.user.User;
import com.presenceiq.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class FirebaseAuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public FirebaseAuthController(UserRepository userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/firebase")
    public Map<String, Object> firebaseLogin(@RequestBody Map<String, String> body) throws Exception {

        String idToken = body.get("idToken");

        if (idToken == null || idToken.isBlank()) {
            return Map.of("error", "idToken missing");
        }

        FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);

        String email = decoded.getEmail();
        String name = decoded.getName();

        if (email == null) {
            return Map.of("error", "Firebase token has no email");
        }

        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name == null ? "Google User" : name);

            // password not used, but required by schema
            user.setPasswordHash(encoder.encode("firebase-user"));
            userRepo.save(user);
        }

        String jwt = jwtUtil.generateToken(email);

        return Map.of(
                "token", jwt,
                "userId", user.getId(),
                "name", user.getName()
        );
    }
}
