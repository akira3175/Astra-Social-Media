package org.example.backend.util;

import org.example.backend.elasticsearch.document.UserDocument;
import org.example.backend.entity.User;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility class for handling image URL manipulations
 */
public class ImageUtils {

    /**
     * Adds the domain to image paths for a User entity
     *
     * @param user User entity whose image paths need domain
     * @param request HttpServletRequest to extract domain information
     * @return User with complete image URLs
     */
    public static User addDomainToImage(User user, HttpServletRequest request) {
        String baseUrl = getBaseUrl(request);
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ?
                baseUrl + user.getAvatar() : null);
        user.setBackground((user.getBackground() != null && !user.getBackground().isEmpty()) ?
                baseUrl + user.getBackground() : null);
        return user;
    }

    /**
     * Adds the domain to image paths for a UserDocument entity
     *
     * @param user UserDocument entity whose image paths need domain
     * @param request HttpServletRequest to extract domain information
     * @return UserDocument with complete image URLs
     */
    public static UserDocument addDomainToImage(UserDocument user, HttpServletRequest request) {
        String baseUrl = getBaseUrl(request);
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ?
                baseUrl + user.getAvatar() : null);
        user.setBackground((user.getBackground() != null && !user.getBackground().isEmpty()) ?
                baseUrl + user.getBackground() : null);
        return user;
    }

    /**
     * Creates the base URL from the HttpServletRequest
     *
     * @param request HttpServletRequest to extract domain information
     * @return Base URL string (scheme://server:port)
     */
    public static String getBaseUrl(HttpServletRequest request) {
        return request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
    }

    public static String addDomainToImage(String imageUrl, HttpServletRequest request) {
        String baseUrl = getBaseUrl(request);
        return baseUrl + imageUrl;
    }
}