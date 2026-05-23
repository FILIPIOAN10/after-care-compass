package ro.after.api.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.after.api.activity.ActivityEntry;
import ro.after.api.activity.ActivityKind;
import ro.after.api.activity.ActivityRepository;
import ro.after.api.case_.CaseEntity;
import ro.after.api.case_.CaseRepository;
import ro.after.api.common.ApiException;
import ro.after.api.family.FamilyMember;
import ro.after.api.family.FamilyMemberRepository;
import ro.after.api.family.InvitationStatus;
import ro.after.api.family.MemberRole;

@Service
public class AuthService {

    private final UserRepository users;
    private final CaseRepository cases;
    private final FamilyMemberRepository familyMembers;
    private final ActivityRepository activities;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, CaseRepository cases, FamilyMemberRepository familyMembers,
                       ActivityRepository activities, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.cases = cases;
        this.familyMembers = familyMembers;
        this.activities = activities;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(409, "Există deja un cont cu acest email.");
        }
        User user = users.save(User.builder()
                .email(email)
                .fullName(req.fullName().trim())
                .passwordHash(encoder.encode(req.password()))
                .build());

        // Creează un dosar gol implicit + adaugă utilizatorul ca administrator
        CaseEntity caseEntity = cases.save(CaseEntity.builder()
                .owner(user)
                .familyName(extractFamilyName(user.getFullName()))
                .build());

        familyMembers.save(FamilyMember.builder()
                .caseEntity(caseEntity)
                .name(user.getFullName())
                .email(user.getEmail())
                .role(MemberRole.ADMIN)
                .status(InvitationStatus.ACTIVE)
                .build());

        activities.save(ActivityEntry.builder()
                .caseEntity(caseEntity)
                .actor(user.getFullName())
                .message("a creat dosarul familiei")
                .kind(ActivityKind.SECURITY)
                .build());

        return new AuthDtos.AuthResponse(jwt.generate(user.getId(), user.getEmail()),
                AuthDtos.UserSummary.of(user));
    }

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User user = users.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new ApiException(401, "Email sau parolă incorecte."));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new ApiException(401, "Email sau parolă incorecte.");
        }
        cases.findByOwner(user).ifPresent(c -> activities.save(ActivityEntry.builder()
                .caseEntity(c)
                .actor(user.getFullName())
                .message("s-a autentificat")
                .kind(ActivityKind.LOGIN)
                .build()));
        return new AuthDtos.AuthResponse(jwt.generate(user.getId(), user.getEmail()),
                AuthDtos.UserSummary.of(user));
    }

    /**
     * Mock 2FA: în dezvoltare orice cod din 6 cifre este acceptat.
     */
    public void verifyOtp(AuthDtos.VerifyOtpRequest req) {
        String code = req.code() == null ? "" : req.code().trim();
        if (!code.matches("\\d{6}")) {
            throw new ApiException(400, "Codul trebuie să conțină 6 cifre.");
        }
    }

    private String extractFamilyName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 0 ? parts[parts.length - 1] : "Familia ta";
    }
}
