package ro.after.api.family;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ro.after.api.activity.ActivityEntry;
import ro.after.api.activity.ActivityKind;
import ro.after.api.activity.ActivityRepository;
import ro.after.api.auth.User;
import ro.after.api.case_.CaseEntity;
import ro.after.api.case_.CaseService;
import ro.after.api.common.ApiException;
import ro.after.api.common.CurrentUser;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyMemberRepository members;
    private final CaseService caseService;
    private final CurrentUser currentUser;
    private final ActivityRepository activities;

    public FamilyController(FamilyMemberRepository members, CaseService caseService,
                            CurrentUser currentUser, ActivityRepository activities) {
        this.members = members;
        this.caseService = caseService;
        this.currentUser = currentUser;
        this.activities = activities;
    }

    @GetMapping("/members")
    public List<FamilyDtos.MemberResponse> list() {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        return members.findByCaseEntityOrderByCreatedAtAsc(c).stream()
                .map(FamilyDtos.MemberResponse::of).toList();
    }

    @PostMapping("/members")
    @Transactional
    public FamilyDtos.MemberResponse invite(@Valid @RequestBody FamilyDtos.InviteRequest req) {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        FamilyMember m = members.save(FamilyMember.builder()
                .caseEntity(c)
                .name(req.name().trim())
                .email(req.email().trim().toLowerCase())
                .role(req.role())
                .status(InvitationStatus.PENDING)
                .build());
        activities.save(ActivityEntry.builder()
                .caseEntity(c)
                .actor(u.getFullName())
                .message("a invitat „" + m.getName() + "” (" + labelFor(m.getRole()) + ")")
                .kind(ActivityKind.INVITE)
                .build());
        return FamilyDtos.MemberResponse.of(m);
    }

    @DeleteMapping("/members/{id}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable UUID id) {
        User u = currentUser.require();
        FamilyMember m = members.findById(id)
                .orElseThrow(() -> new ApiException(404, "Persoana nu a fost găsită."));
        if (!m.getCaseEntity().getOwner().getId().equals(u.getId())) {
            throw new ApiException(403, "Nu ai acces la această invitație.");
        }
        if (m.getRole() == MemberRole.ADMIN) {
            throw new ApiException(400, "Administratorul dosarului nu poate fi eliminat.");
        }
        members.delete(m);
        activities.save(ActivityEntry.builder()
                .caseEntity(m.getCaseEntity())
                .actor(u.getFullName())
                .message("a eliminat accesul lui „" + m.getName() + "”")
                .kind(ActivityKind.SECURITY)
                .build());
        return ResponseEntity.noContent().build();
    }

    private String labelFor(MemberRole role) {
        return switch (role) {
            case ADMIN -> "Administrator";
            case FAMILY -> "Familie";
            case LAWYER -> "Avocat";
            case CAREGIVER -> "Îngrijitor";
        };
    }
}
