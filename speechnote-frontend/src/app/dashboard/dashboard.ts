
import { Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  TranscriptionService,
  Transcription
} from '../services/transcription';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnDestroy {

  selectedLanguage = 'hi-IN';
  title = '';
  transcriptText = '';
  statusMessage = 'Ready to transcribe';

  isRecording = false;
  isSpeechSupported = true;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  private toastTimer?: ReturnType<typeof setTimeout>;
  private recognition: SpeechRecognitionLike | null = null;
  private transcriptBeforeRecording = '';
  private recordingError = false;
  private stopRequested = false;

  constructor(
    private readonly transcriptionService: TranscriptionService,
    private readonly zone: NgZone
  ) {}

  get wordCount(): number {
    const text = this.transcriptText.trim();
    return text ? text.split(/\s+/).length : 0;
  }

  get characterCount(): number {
    return this.transcriptText.length;
  }

  startRecording(): void {
    if (this.isRecording || this.recognition) {
      return;
    }

    if (this.selectedLanguage === 'auto') {
      this.statusMessage = 'Choose a speech language to continue.';
      this.showToast(
        'Automatic language detection is not supported. Please select a language.',
        'error'
      );
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;

    const Recognition =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      this.isSpeechSupported = false;
      this.statusMessage = 'Speech recognition is not supported.';

      this.showToast(
        'Your browser does not support speech recognition. Try Chrome or Edge.',
        'error'
      );
      return;
    }

    try {
      const recognition = new Recognition();

      recognition.lang = this.selectedLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;

      this.recognition = recognition;
      this.transcriptBeforeRecording = this.transcriptText.trim();
      this.recordingError = false;
      this.stopRequested = false;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        this.zone.run(() => {
          const finalParts: string[] = [];
          const interimParts: string[] = [];

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const recognizedText =
              result[0]?.transcript?.trim() ?? '';

            if (!recognizedText) {
              continue;
            }

            if (result.isFinal) {
              finalParts.push(recognizedText);
            } else {
              interimParts.push(recognizedText);
            }
          }

          this.transcriptText = [
            this.transcriptBeforeRecording,
            finalParts.join(' '),
            interimParts.join(' ')
          ]
            .filter(Boolean)
            .join(' ');

          if (this.isRecording) {
            this.statusMessage = interimParts.length
              ? 'Recognizing speech...'
              : 'Listening to your voice...';
          }
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        this.zone.run(() => {
          if (event.error === 'aborted' && this.stopRequested) {
            return;
          }

          this.recordingError = true;

          const messages: Record<string, string> = {
            'not-allowed': 'Microphone permission was denied.',
            'service-not-allowed': 'The speech recognition service is unavailable.',
            'no-speech': 'No speech was detected. Please try again.',
            'audio-capture': 'No microphone was found. Check your microphone.',
            network: 'A network error interrupted speech recognition.',
            'language-not-supported': 'This language is not supported by the browser.',
            aborted: 'Speech recognition was stopped.'
          };

          const message =
            messages[event.error] ??
            `Speech recognition error: ${event.error}.`;

          this.statusMessage = message;

          if (event.error !== 'aborted') {
            this.showToast(message, 'error');
          }
        });
      };

      recognition.onend = () => {
        this.zone.run(() => {
          this.isRecording = false;
          this.recognition = null;

          if (this.recordingError) {
            return;
          }

          this.statusMessage = this.transcriptText.trim()
            ? 'Recording stopped. Review your transcript.'
            : 'Recording stopped. No speech was captured.';
        });
      };

      recognition.start();

      this.isRecording = true;
      this.statusMessage = 'Listening to your voice...';

    } catch (error: unknown) {
      console.error('Could not start speech recognition:', error);

      this.isRecording = false;
      this.recognition = null;
      this.statusMessage = 'Unable to start recording.';

      this.showToast(
        'Could not start recording. Check browser permissions and try again.',
        'error'
      );
    }
  }

  stopRecording(): void {
    const recognition = this.recognition;

    if (!recognition) {
      this.isRecording = false;
      return;
    }

    this.stopRequested = true;
    this.isRecording = false;
    this.statusMessage = 'Finishing transcription...';

    try {
      recognition.stop();
    } catch (error: unknown) {
      console.warn('Could not stop recognition:', error);

      this.recognition = null;
      this.statusMessage = this.transcriptText.trim()
        ? 'Recording stopped. Review your transcript.'
        : 'Recording stopped.';
    }
  }

  clearTranscript(): void {
    if (this.recognition) {
      this.stopRecording();
    }

    this.title = '';
    this.transcriptText = '';
    this.transcriptBeforeRecording = '';
    this.statusMessage = 'Transcript cleared';
  }

  showToast(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.notificationMessage = message;
    this.notificationType = type;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.notificationMessage = '';
      this.toastTimer = undefined;
    }, 3500);
  }

  saveTranscript(): void {
    if (this.isRecording) {
      this.stopRecording();

      this.showToast(
        'Recording is finishing. Please save again when it has stopped.',
        'error'
      );
      return;
    }

    if (!this.title.trim()) {
      this.showToast('Please enter a transcript title.', 'error');
      return;
    }

    if (!this.transcriptText.trim()) {
      this.showToast('Please enter some transcript text.', 'error');
      return;
    }

    const data: Transcription = {
      title: this.title.trim(),
      transcriptText: this.transcriptText.trim(),
      language: this.selectedLanguage
    };

    this.statusMessage = 'Saving transcript...';

    this.transcriptionService.create(data).subscribe({
      next: (saved: Transcription) => {
        this.statusMessage = 'Transcript saved successfully.';

        this.showToast(
          `Transcript saved successfully! ID: ${saved.id}`,
          'success'
        );

        this.title = '';
        this.transcriptText = '';
        this.transcriptBeforeRecording = '';
      },

      error: (error: unknown) => {
        console.error('Failed to save transcript:', error);

        this.statusMessage = 'Failed to save transcript.';

        this.showToast(
          'Unable to save transcript. Please check your backend connection.',
          'error'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;

      try {
        this.recognition.abort();
      } catch {
        // Recognition may already have ended.
      }

      this.recognition = null;
    }
  }
}
