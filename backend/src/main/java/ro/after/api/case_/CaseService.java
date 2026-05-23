package ro.after.api.case_;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.after.api.activity.ActivityEntry;
import ro.after.api.activity.ActivityKind;
import ro.after.api.activity.ActivityRepository;
import ro.after.api.auth.User;
import ro.after.api.common.ApiException;
import ro.after.api.task.TaskRepository;
import ro.after.api.task.TaskStatus;
import ro.after.api.task.TaskTemplateService;

@Service
public class CaseService {

    private final CaseRepository cases;
    private final TaskRepository tasks;
    private final TaskTemplateService taskTemplates;
    private final ActivityRepository activities;

    public CaseService(CaseRepository cases, TaskRepository tasks,
                       TaskTemplateService taskTemplates, ActivityRepository activities) {
        this.cases = cases;
        this.tasks = tasks;
        this.taskTemplates = taskTemplates;
        this.activities = activities;
    }

    public CaseEntity getOrCreate(User owner) {
        return cases.findByOwner(owner)
                .orElseGet(() -> cases.save(CaseEntity.builder()
                        .owner(owner)
                        .familyName(lastNameOf(owner.getFullName()))
                        .build()));
    }

    public CaseDtos.CaseResponse toResponse(CaseEntity c, User owner) {
        long total = tasks.countByCaseEntity(c);
        long done = tasks.countByCaseEntityAndStatus(c, TaskStatus.DONE);
        return CaseDtos.CaseResponse.of(c, owner.getFullName(), total, done);
    }

    @Transactional
    public CaseEntity submitOnboarding(User owner, CaseDtos.OnboardingRequest req) {
        if (req.placeOfDeath() == null) {
            throw new ApiException(400, "Te rugăm să alegi unde a avut loc decesul.");
        }
        CaseEntity c = getOrCreate(owner);
        c.setPlaceOfDeath(req.placeOfDeath());
        c.setDeceasedName(req.deceasedName());
        c.setDeceasedCnp(req.deceasedCnp());
        c.setDeathDate(req.deathDate());
        c.setDeathPlace(req.deathPlace());
        c.setMaritalStatus(req.maritalStatus());
        c.setWasRetired(req.wasRetired());
        c.setOwnedProperty(req.ownedProperty());
        c.setOwnedVehicle(req.ownedVehicle());
        c.setWasCompanyAdmin(req.wasCompanyAdmin());
        c.setHasSurvivingFamily(req.hasSurvivingFamily());

        boolean firstTime = tasks.countByCaseEntity(c) == 0;
        cases.save(c);

        if (firstTime) {
            taskTemplates.seedFor(c);
            activities.save(ActivityEntry.builder()
                    .caseEntity(c)
                    .actor(owner.getFullName())
                    .message("a completat chestionarul inițial")
                    .kind(ActivityKind.NOTE)
                    .build());
        } else {
            activities.save(ActivityEntry.builder()
                    .caseEntity(c)
                    .actor(owner.getFullName())
                    .message("a actualizat detaliile dosarului")
                    .kind(ActivityKind.NOTE)
                    .build());
        }
        return c;
    }

    private String lastNameOf(String fullName) {
        if (fullName == null) return "ta";
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 0 ? parts[parts.length - 1] : "ta";
    }
}
