
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transcription {
  id?: number;
  title: string;
  transcriptText: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {

  private readonly apiUrl =
    'http://localhost:8081/api/transcriptions';

  constructor(private http: HttpClient) {}

  // Get all transcripts
  getAll(): Observable<Transcription[]> {
    return this.http.get<Transcription[]>(this.apiUrl);
  }

  // Get a transcript by ID
  getById(id: number): Observable<Transcription> {
    return this.http.get<Transcription>(
      `${this.apiUrl}/${id}`
    );
  }

  // Save a new transcript
  create(data: Transcription): Observable<Transcription> {
    return this.http.post<Transcription>(
      this.apiUrl,
      data
    );
  }

  // Update an existing transcript
  update(
    id: number,
    data: Transcription
  ): Observable<Transcription> {
    return this.http.put<Transcription>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // Delete a transcript
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
