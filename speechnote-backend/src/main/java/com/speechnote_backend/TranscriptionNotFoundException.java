package com.speechnote_backend;

public class TranscriptionNotFoundException
        extends RuntimeException {

    public TranscriptionNotFoundException(Long id) {
        super("Transcription not found with ID: " + id);
    }
}