package ro.after.api.document;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.after.api.activity.ActivityEntry;
import ro.after.api.activity.ActivityKind;
import ro.after.api.activity.ActivityRepository;
import ro.after.api.auth.User;
import ro.after.api.case_.CaseEntity;
import ro.after.api.case_.CaseService;
import ro.after.api.common.ApiException;
import ro.after.api.common.CurrentUser;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documents;
    private final DocumentStorageService storage;
    private final CaseService caseService;
    private final CurrentUser currentUser;
    private final ActivityRepository activities;

    public DocumentController(DocumentRepository documents, DocumentStorageService storage,
                              CaseService caseService, CurrentUser currentUser,
                              ActivityRepository activities) {
        this.documents = documents;
        this.storage = storage;
        this.caseService = caseService;
        this.currentUser = currentUser;
        this.activities = activities;
    }

    @GetMapping
    public List<DocumentDtos.DocumentResponse> list() {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);
        return documents.findByCaseEntityOrderByCreatedAtDesc(c).stream()
                .map(DocumentDtos.DocumentResponse::of).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public DocumentDtos.DocumentResponse upload(@RequestPart("file") MultipartFile file,
                                                @RequestParam(value = "name", required = false) String name,
                                                @RequestParam(value = "category", required = false) String category,
                                                @RequestParam(value = "description", required = false) String description) {
        User u = currentUser.require();
        CaseEntity c = caseService.getOrCreate(u);

        String stored = storage.store(file);
        String docName = (name != null && !name.isBlank()) ? name.trim() : file.getOriginalFilename();
        if (docName == null || docName.isBlank()) docName = "Document fără nume";
        String docCategory = (category != null && !category.isBlank()) ? category.trim() : "Altele";

        DocumentEntity saved = documents.save(DocumentEntity.builder()
                .caseEntity(c)
                .name(docName)
                .category(docCategory)
                .description(description)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .sizeBytes(file.getSize())
                .storedFilename(stored)
                .build());

        activities.save(ActivityEntry.builder()
                .caseEntity(c)
                .actor(u.getFullName())
                .message("a încărcat documentul „" + saved.getName() + "”")
                .kind(ActivityKind.UPLOAD)
                .build());

        return DocumentDtos.DocumentResponse.of(saved);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID id) {
        DocumentEntity d = ownedDocument(id);
        InputStreamResource resource = new InputStreamResource(storage.open(d.getStoredFilename()));

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(d.getName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentLength(d.getSizeBytes())
                .contentType(MediaType.parseMediaType(d.getContentType()))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        DocumentEntity d = ownedDocument(id);
        storage.delete(d.getStoredFilename());
        documents.delete(d);
        return ResponseEntity.noContent().build();
    }

    private DocumentEntity ownedDocument(UUID id) {
        User u = currentUser.require();
        DocumentEntity d = documents.findById(id)
                .orElseThrow(() -> new ApiException(404, "Documentul nu a fost găsit."));
        if (!d.getCaseEntity().getOwner().getId().equals(u.getId())) {
            throw new ApiException(403, "Nu ai acces la acest document.");
        }
        return d;
    }
}
