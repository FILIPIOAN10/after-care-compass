package ro.after.api.auth;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.after.api.common.CurrentUser;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    public AuthController(AuthService authService, CurrentUser currentUser) {
        this.authService = authService;
        this.currentUser = currentUser;
    }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<Void> verifyOtp(@Valid @RequestBody AuthDtos.VerifyOtpRequest req) {
        authService.verifyOtp(req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public AuthDtos.UserSummary me() {
        return AuthDtos.UserSummary.of(currentUser.require());
    }
}
