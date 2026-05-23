package ro.after.api.document;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.after.api.common.ApiException;
import ro.after.api.config.StorageProperties;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private final Path root;

    public DocumentStorageService(StorageProperties props) {
        this.root = Paths.get(props.getUploadsDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Nu pot crea directorul pentru documente: " + root, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(400, "Fișierul este gol.");
        }
        String storedName = UUID.randomUUID().toString();
        Path target = root.resolve(storedName);
        try {
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new ApiException(500, "Nu am putut salva fișierul.");
        }
        return storedName;
    }

    public InputStream open(String storedName) {
        try {
            return Files.newInputStream(root.resolve(storedName));
        } catch (IOException e) {
            throw new ApiException(404, "Fișierul nu a fost găsit.");
        }
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(root.resolve(storedName));
        } catch (IOException ignored) {}
    }
}
