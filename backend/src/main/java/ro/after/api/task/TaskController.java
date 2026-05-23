package ro.after.api.task;

import jakarta.validation.Valid;
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
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository tasks;
    private final CaseService caseService;
    private final CurrentUser currentUser;
    private final ActivityRepository activities;

    public TaskController(TaskRepository tasks, CaseService caseService,
                          CurrentUser currentUser, ActivityRepository activities) {
        this.tasks = tasks;
        this.caseService = caseService;
        this.currentUser = currentUser;
        this.activities = activities;
    }

    @GetMapping
    public List<TaskDtos.TaskResponse> list() {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        return tasks.findByCaseEntityOrderByPhaseAscOrderIndexAsc(c).stream()
                .map(TaskDtos.TaskResponse::of)
                .toList();
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public TaskDtos.TaskResponse updateStatus(@PathVariable UUID id,
                                              @Valid @RequestBody TaskDtos.UpdateStatusRequest req) {
        TaskEntity t = ownedTask(id);
        TaskStatus previous = t.getStatus();
        t.setStatus(req.status());
        TaskEntity saved = tasks.save(t);
        User u = currentUser.require();
        activities.save(ActivityEntry.builder()
                .caseEntity(t.getCaseEntity())
                .actor(u.getFullName())
                .message("a marcat „" + t.getTitle() + "” ca " + labelFor(req.status())
                        + (previous != null ? " (anterior: " + labelFor(previous) + ")" : ""))
                .kind(ActivityKind.TASK_UPDATE)
                .build());
        return TaskDtos.TaskResponse.of(saved);
    }

    @PatchMapping("/{id}/note")
    @Transactional
    public TaskDtos.TaskResponse updateNote(@PathVariable UUID id,
                                            @Valid @RequestBody TaskDtos.UpdateNoteRequest req) {
        TaskEntity t = ownedTask(id);
        t.setNote(req.note());
        TaskEntity saved = tasks.save(t);
        User u = currentUser.require();
        activities.save(ActivityEntry.builder()
                .caseEntity(t.getCaseEntity())
                .actor(u.getFullName())
                .message("a lăsat o notă la „" + t.getTitle() + "”")
                .kind(ActivityKind.NOTE)
                .build());
        return TaskDtos.TaskResponse.of(saved);
    }

    private TaskEntity ownedTask(UUID id) {
        User u = currentUser.require();
        TaskEntity t = tasks.findById(id).orElseThrow(() -> new ApiException(404, "Sarcina nu a fost găsită."));
        if (!t.getCaseEntity().getOwner().getId().equals(u.getId())) {
            throw new ApiException(403, "Nu ai acces la această sarcină.");
        }
        return t;
    }

    private String labelFor(TaskStatus s) {
        return switch (s) {
            case DONE -> "finalizat";
            case PENDING -> "în lucru";
            case WAITING -> "în așteptare";
            case MISSING -> "lipsește un document";
        };
    }
}
