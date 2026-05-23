package ro.after.api.document;

import java.time.Instant;
import java.util.UUID;

public class DocumentDtos {

    public record DocumentResponse(
            UUID id,
            String name,
            String category,
            String description,
            String contentType,
            long sizeBytes,
            Instant createdAt
    ) {
        public static DocumentResponse of(DocumentEntity d) {
            return new DocumentResponse(d.getId(), d.getName(), d.getCategory(),
                    d.getDescription(), d.getContentType(), d.getSizeBytes(), d.getCreatedAt());
        }
    }
}
