package org.example.backend.security;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import org.apache.http.HttpHeaders;
import org.apache.http.message.BasicHeader;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient() {
        // Lấy từ biến môi trường đã được Dotenv set vào System properties
        String host = System.getProperty("ELASTIC_HOST");
        String portStr = System.getProperty("ELASTIC_PORT");
        String apiKey = System.getProperty("ELASTIC_API_KEY");

        // Debug (tạm thời)
        System.out.println("ES Host: " + host);
        System.out.println("ES Port: " + portStr);
        System.out.println("ES ApiKey: " + (apiKey != null ? "OK" : "null"));

        // Kiểm tra lỗi thiếu cấu hình
        if (host == null || portStr == null || apiKey == null) {
            throw new RuntimeException("Missing Elasticsearch configuration from environment variables");
        }

        int port;
        try {
            port = Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid port format: " + portStr);
        }

        String authHeader = "ApiKey " + apiKey;

        RestClientBuilder builder = RestClient.builder(
                new org.apache.http.HttpHost(host, port, "https"))
                .setDefaultHeaders(new org.apache.http.Header[] {
                        new BasicHeader(HttpHeaders.AUTHORIZATION, authHeader)
                });

        RestClient restClient = builder.build();

        RestClientTransport transport = new RestClientTransport(
                restClient, new JacksonJsonpMapper());

        return new ElasticsearchClient(transport);
    }
}
