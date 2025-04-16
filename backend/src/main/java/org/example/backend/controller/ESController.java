package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.PostService;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/es")
@RequiredArgsConstructor
public class ESController {

    private final PostService postService;
    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<String> syncAll() {
        postService.syncAllPostsToES();
        userService.saveAllUsersToES();
        return ResponseEntity.ok("The Posts and Users have been synchronized to Elasticsearch.");
    }
}
