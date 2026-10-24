
package com.speechnote_backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TranscriptionRepository
        extends JpaRepository<Transcription, Long> {
}
