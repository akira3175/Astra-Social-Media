package org.example.backend.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GeminiService {
    
    private final String apiKey;
    private final RestTemplate restTemplate;
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    @Autowired
    public GeminiService(Dotenv dotenv) {
        this.apiKey = dotenv.get("GEMINI_API_KEY");
        this.restTemplate = new RestTemplate();
    }
    
    public String generateContent(String prompt) {
        // Build URL with API key
        String url = UriComponentsBuilder.fromHttpUrl(GEMINI_API_URL)
                .queryParam("key", apiKey)
                .toUriString();
        
        // Prepare request body
        String requestBody = String.format("""
            {
                "contents": [{
                    "parts":[{"text": "%s"}]
                }]
            }
            """, prompt);
        
        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Create request entity
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        
        // Make API call
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );
        
        return response.getBody();
    }
} 