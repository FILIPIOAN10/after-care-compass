package ro.after.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "after.security.jwt")
public class JwtProperties {
    private String secret;
    private long expirationMinutes = 1440;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public long getExpirationMinutes() { return expirationMinutes; }
    public void setExpirationMinutes(long expirationMinutes) { this.expirationMinutes = expirationMinutes; }
}
