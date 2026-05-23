package ro.after.api.task;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class TaskDtos {

    public record TaskResponse(
            UUID id,
            String title,
            String description,
            String place,
            TaskPhase phase,
            TaskStatus status,
            Integer orderIndex,
            String note,
            Instant updatedAt
    ) {
        public static TaskResponse of(TaskEntity t) {
            return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.getPlace(),
                    t.getPhase(), t.getStatus(), t.getOrderIndex(), t.getNote(), t.getUpdatedAt());
        }
    }

    public record UpdateStatusRequest(@NotNull TaskStatus status) {}

    public record UpdateNoteRequest(String note) {}
}
