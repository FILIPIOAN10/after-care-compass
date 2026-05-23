package ro.after.api.common;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ro.after.api.auth.User;

@Component
public class CurrentUser {

    public User require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User u)) {
            throw new ApiException(401, "Trebuie să fii autentificat pentru această acțiune.");
        }
        return u;
    }
}
