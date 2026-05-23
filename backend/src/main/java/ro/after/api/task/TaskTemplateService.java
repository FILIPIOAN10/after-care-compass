package ro.after.api.task;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.after.api.case_.CaseEntity;

import java.util.ArrayList;
import java.util.List;

/**
 * Generează lista de sarcini specifică unei familii din România, bazată pe răspunsurile din chestionarul inițial.
 */
@Service
public class TaskTemplateService {

    private final TaskRepository tasks;

    public TaskTemplateService(TaskRepository tasks) {
        this.tasks = tasks;
    }

    @Transactional
    public void seedFor(CaseEntity c) {
        List<TaskEntity> toCreate = new ArrayList<>();
        int order = 0;

        // === IMEDIAT (zilele 1-3) ===
        toCreate.add(task(c, order++, TaskPhase.IMMEDIATE, TaskStatus.PENDING,
                "Înregistrează decesul la primărie",
                "Trebuie făcută în 3 zile lucrătoare de la deces, la Starea Civilă din primăria localității unde a avut loc decesul.",
                "Primărie · Starea Civilă"));

        toCreate.add(task(c, order++, TaskPhase.IMMEDIATE, TaskStatus.PENDING,
                "Solicită certificatul oficial de deces",
                "Se eliberează de Starea Civilă pe baza certificatului medical constatator. Vei avea nevoie de mai multe exemplare.",
                "Starea Civilă"));

        toCreate.add(task(c, order++, TaskPhase.IMMEDIATE, TaskStatus.WAITING,
                "Organizează înmormântarea sau incinerarea",
                "Alege o casă funerară, stabilește locul și data ceremoniei. Păstrează facturile — sunt necesare pentru ajutorul de înmormântare.",
                "Casă funerară"));

        toCreate.add(task(c, order++, TaskPhase.IMMEDIATE, TaskStatus.MISSING,
                "Anunță angajatorul",
                "Trimite o adresă scrisă către angajator pentru încetarea contractului individual de muncă.",
                "Prin email sau scrisoare",
                "Avem nevoie de adeverința de salariat ca să pregătim documentele."));

        // === SĂPTĂMÂNA ACEASTA ===
        toCreate.add(task(c, order++, TaskPhase.THIS_WEEK, TaskStatus.WAITING,
                "Anulează cartea de identitate și pașaportul",
                "Predă documentele la Direcția de Evidență a Persoanelor pentru anulare.",
                "Evidența Persoanelor"));

        toCreate.add(task(c, order++, TaskPhase.THIS_WEEK, TaskStatus.WAITING,
                "Anunță medicul de familie",
                "Medicul de familie va închide fișa medicală și va trimite informația către CNAS.",
                "Cabinet medical"));

        if (c.isWasRetired()) {
            toCreate.add(task(c, order++, TaskPhase.THIS_WEEK, TaskStatus.PENDING,
                    "Anunță Casa de Pensii și solicită ajutorul de înmormântare",
                    "Ajutorul de înmormântare se acordă persoanei care a suportat cheltuielile. Necesită certificat de deces, acte de identitate, facturi și cupon de pensie.",
                    "Casa Națională de Pensii"));
        } else {
            toCreate.add(task(c, order++, TaskPhase.THIS_WEEK, TaskStatus.PENDING,
                    "Solicită ajutorul de înmormântare",
                    "Pentru salariați, ajutorul se solicită angajatorului. Necesită certificat de deces și facturi.",
                    "Angajator / Casa de Pensii"));
        }

        toCreate.add(task(c, order++, TaskPhase.THIS_WEEK, TaskStatus.WAITING,
                "Anunță banca și conturile",
                "Băncile blochează conturile la primirea certificatului de deces. Sumele se eliberează după succesiune.",
                "Bancă"));

        // === PE TERMEN LUNG ===
        toCreate.add(task(c, order++, TaskPhase.LONG_TERM, TaskStatus.WAITING,
                "Deschide dosarul de succesiune",
                "Termenul recomandat este de 2 ani de la deces. Notarul va întocmi certificatul de moștenitor pe baza actelor depuse.",
                "Notar public"));

        if (c.isOwnedVehicle()) {
            toCreate.add(task(c, order++, TaskPhase.LONG_TERM, TaskStatus.WAITING,
                    "Transferă proprietatea autovehiculului",
                    "După finalizarea succesiunii, depune dosarul la DRPCIV pentru radierea sau transferul vehiculului.",
                    "DRPCIV"));
        }

        if (c.isOwnedProperty()) {
            toCreate.add(task(c, order++, TaskPhase.LONG_TERM, TaskStatus.WAITING,
                    "Înscrie proprietatea în Cartea Funciară",
                    "După eliberarea certificatului de moștenitor, depune cererea la OCPI / BCPI pentru intabularea drepturilor moștenitorilor.",
                    "ANCPI / BCPI"));
        }

        toCreate.add(task(c, order++, TaskPhase.LONG_TERM, TaskStatus.WAITING,
                "Actualizează contractele de utilități",
                "Transferă pe numele moștenitorilor contractele de electricitate, gaz, apă, internet, asociație de proprietari.",
                "Furnizori"));

        if (c.isWasCompanyAdmin()) {
            toCreate.add(task(c, order++, TaskPhase.LONG_TERM, TaskStatus.PENDING,
                    "Anunță Registrul Comerțului",
                    "Modifică structura administratorilor / asociaților la ONRC.",
                    "ONRC"));
        }

        tasks.saveAll(toCreate);
    }

    private TaskEntity task(CaseEntity c, int order, TaskPhase phase, TaskStatus status,
                            String title, String description, String place) {
        return task(c, order, phase, status, title, description, place, null);
    }

    private TaskEntity task(CaseEntity c, int order, TaskPhase phase, TaskStatus status,
                            String title, String description, String place, String note) {
        return TaskEntity.builder()
                .caseEntity(c)
                .orderIndex(order)
                .phase(phase)
                .status(status)
                .title(title)
                .description(description)
                .place(place)
                .note(note)
                .build();
    }
}
