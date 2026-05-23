package ro.after.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "after.storage")
public class StorageProperties {
    private String uploadsDir = "./uploads";

    public String getUploadsDir() { return uploadsDir; }
    public void setUploadsDir(String uploadsDir) { this.uploadsDir = uploadsDir; }
}
