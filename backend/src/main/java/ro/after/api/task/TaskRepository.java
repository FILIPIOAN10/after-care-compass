package ro.after.api.task;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.after.api.case_.CaseEntity;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
    List<TaskEntity> findByCaseEntityOrderByPhaseAscOrderIndexAsc(CaseEntity caseEntity);
    long countByCaseEntity(CaseEntity caseEntity);
    long countByCaseEntityAndStatus(CaseEntity caseEntity, TaskStatus status);
}
