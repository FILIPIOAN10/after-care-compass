package ro.after.api.activity;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import ro.after.api.auth.User;
import ro.after.api.case_.CaseEntity;
import ro.after.api.case_.CaseService;
import ro.after.api.common.CurrentUser;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityRepository activities;
    private final CaseService caseService;
    private final CurrentUser currentUser;

    public ActivityController(ActivityRepository activities, CaseService caseService, CurrentUser currentUser) {
        this.activities = activities;
        this.caseService = caseService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<ActivityResponse> list(@RequestParam(defaultValue = "30") int limit) {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        int capped = Math.max(1, Math.min(limit, 100));
        return activities.findByCaseEntityOrderByCreatedAtDesc(c, PageRequest.of(0, capped))
                .stream().map(ActivityResponse::of).toList();
    }

    public record ActivityResponse(UUID id, String actor, String message, ActivityKind kind, Instant createdAt) {
        static ActivityResponse of(ActivityEntry a) {
            return new ActivityResponse(a.getId(), a.getActor(), a.getMessage(), a.getKind(), a.getCreatedAt());
        }
    }
}
