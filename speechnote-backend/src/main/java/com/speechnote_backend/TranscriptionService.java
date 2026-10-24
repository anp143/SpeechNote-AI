
package com.speechnote_backend;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TranscriptionService {

    private final TranscriptionRepository repository;

    public TranscriptionService(TranscriptionRepository repository) {
        this.repository = repository;
    }

    // Save a new transcription
    public Transcription create(Transcription transcription) {
        transcription.setId(null);
        return repository.save(transcription);
    }

    // Get all saved transcriptions
    @Transactional(readOnly = true)
    public List<Transcription> getAll() {
        return repository.findAll();
    }

    // Get one transcription by ID
    @Transactional(readOnly = true)
    public Transcription getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new TranscriptionNotFoundException(id));
    }

    // Update an existing transcription
    public Transcription update(
            Long id, Transcription updatedTranscription) {

        Transcription existing = getById(id);

        existing.setTitle(updatedTranscription.getTitle());
        existing.setTranscriptText(
                updatedTranscription.getTranscriptText());
        existing.setLanguage(updatedTranscription.getLanguage());

        return repository.save(existing);
    }

    // Delete a transcription
    public void delete(Long id) {
        Transcription existing = getById(id);
        repository.delete(existing);
    }
}
