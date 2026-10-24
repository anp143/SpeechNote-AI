
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Transcription,
  TranscriptionService
} from '../services/transcription';

@Component({
  selector: 'app-transcription-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transcription-history.html',
  styleUrl: './transcription-history.scss'
})
export class TranscriptionHistory implements OnInit, OnDestroy {

  successMessage = '';
  private toastTimeout: ReturnType<typeof setTimeout> | undefined;

  transcriptions: Transcription[] = [];

  isLoading = false;
  isSaving = false;
  isDeleting = false;

  errorMessage = '';
  searchTerm = '';

  selectedTranscript: Transcription | null = null;
  editingTranscript: Transcription | null = null;

  editTitle = '';
  editText = '';
  editLanguage = '';

  showDeleteModal = false;
  transcriptToDelete: Transcription | null = null;

  constructor(
    private readonly transcriptionService: TranscriptionService
  ) {}

  ngOnInit(): void {
    this.loadTranscriptions();
  }

  get filteredTranscriptions(): Transcription[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.transcriptions;
    }

    return this.transcriptions.filter((record) =>
      (record.title ?? '').toLowerCase().includes(query) ||
      (record.transcriptText ?? '').toLowerCase().includes(query) ||
      (record.language ?? '').toLowerCase().includes(query)
    );
  }

  // READ: Load all saved transcripts.
  loadTranscriptions(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.transcriptionService.getAll().subscribe({
      next: (records: Transcription[]) => {
        this.transcriptions = [...records].sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );

        this.isLoading = false;
      },

      error: (error: unknown) => {
        console.error('Failed to load transcription history:', error);

        this.errorMessage =
          'Unable to load transcripts. Please try again.';

        this.isLoading = false;
      }
    });
  }

  getWordCount(text: string): number {
    const trimmedText = text?.trim();
    return trimmedText ? trimmedText.split(/\s+/).length : 0;
  }

  trackById(index: number, record: Transcription): number {
    return record.id ?? index;
  }

  // VIEW: Open a saved transcript.
  openTranscript(record: Transcription): void {
    this.selectedTranscript = record;
  }

  closeTranscript(): void {
    this.selectedTranscript = null;
  }

  // UPDATE: Open the edit form.
  startEditing(record: Transcription): void {
    this.editingTranscript = record;

    this.editTitle = record.title ?? '';
    this.editText = record.transcriptText ?? '';
    this.editLanguage = record.language ?? '';

    this.selectedTranscript = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    if (this.isSaving) {
      return;
    }

    this.editingTranscript = null;
    this.editTitle = '';
    this.editText = '';
    this.editLanguage = '';
    this.errorMessage = '';
  }

  // UPDATE: Save the edited transcript.
  saveChanges(): void {
    const record = this.editingTranscript;

    if (!record?.id || this.isSaving) {
      return;
    }

    if (
      !this.editTitle.trim() ||
      !this.editText.trim() ||
      !this.editLanguage
    ) {
      this.errorMessage =
        'Title, transcript text, and language are required.';
      return;
    }

    const updatedRecord: Transcription = {
      ...record,
      title: this.editTitle.trim(),
      transcriptText: this.editText.trim(),
      language: this.editLanguage
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.transcriptionService
      .update(record.id, updatedRecord)
      .subscribe({
        next: (updated: Transcription) => {
          this.transcriptions = this.transcriptions.map((item) =>
            item.id === record.id ? updated : item
          );

          this.isSaving = false;
          this.editingTranscript = null;
          this.editTitle = '';
          this.editText = '';
          this.editLanguage = '';

          this.showSuccessToast(
            'Transcript updated successfully!'
          );
        },

        error: (error: unknown) => {
          console.error('Failed to update transcript:', error);

          this.isSaving = false;
          this.errorMessage =
            'Unable to update transcript. Please try again.';
        }
      });
  }

  // DELETE: Open confirmation modal.
  openDeleteModal(record: Transcription): void {
    if (this.isDeleting || this.isSaving) {
      return;
    }

    this.transcriptToDelete = record;
    this.showDeleteModal = true;
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    if (this.isDeleting) {
      return;
    }

    this.showDeleteModal = false;
    this.transcriptToDelete = null;
  }

  // DELETE: Remove the selected transcript.
  confirmDelete(): void {
    const record = this.transcriptToDelete;

    if (!record?.id || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.transcriptionService.delete(record.id).subscribe({
      next: () => {
        this.transcriptions = this.transcriptions.filter(
          (item) => item.id !== record.id
        );

        this.showDeleteModal = false;
        this.transcriptToDelete = null;
        this.isDeleting = false;

        this.showSuccessToast(
          'Transcript deleted successfully!'
        );
      },

      error: (error: unknown) => {
        console.error('Failed to delete transcript:', error);

        this.isDeleting = false;
        this.errorMessage =
          'Unable to delete this transcript. Please try again.';
      }
    });
  }

  // Display a success notification.
  showSuccessToast(message: string): void {
    this.successMessage = message;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.successMessage = '';
      this.toastTimeout = undefined;
    }, 3000);
  }

  // CLEANUP: Clear pending toast timer.
  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = undefined;
    }
  }
}
