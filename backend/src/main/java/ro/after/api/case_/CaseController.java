package ro.after.api.case_;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ro.after.api.auth.User;
import ro.after.api.common.CurrentUser;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;
    private final CurrentUser currentUser;

    public CaseController(CaseService caseService, CurrentUser currentUser) {
        this.caseService = caseService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    public CaseDtos.CaseResponse myCase() {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        return caseService.toResponse(c, u);
    }

    @PostMapping("/me/onboarding")
    public CaseDtos.CaseResponse submitOnboarding(@Valid @RequestBody CaseDtos.OnboardingRequest req) {
        User u = currentUser.require();
        CaseEntity c = caseService.submitOnboarding(u, req);
        return caseService.toResponse(c, u);
    }
}
