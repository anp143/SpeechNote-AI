
package com.speechnote_backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transcriptions")
@CrossOrigin(origins = "http://localhost:4200")
public class TranscriptionController {

    private final TranscriptionService service;

    public TranscriptionController(TranscriptionService service) {
        this.service = service;
    }

    // Create a transcription
    @PostMapping
    public ResponseEntity<Transcription> create(
            @Valid @RequestBody Transcription transcription) {

        Transcription saved = service.create(transcription);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Get all transcriptions
    @GetMapping
    public ResponseEntity<List<Transcription>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // Get a transcription by ID
    @GetMapping("/{id}")
    public ResponseEntity<Transcription> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getById(id));
    }

    // Update a transcription
    @PutMapping("/{id}")
    public ResponseEntity<Transcription> update(
            @PathVariable Long id,
            @Valid @RequestBody Transcription transcription) {

        return ResponseEntity.ok(service.update(id, transcription));
    }

    // Delete a transcription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}
