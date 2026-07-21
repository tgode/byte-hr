import { Component, Output, EventEmitter, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="input-area">
      <div class="composer" [class.composer--focused]="isFocused()" [class.composer--disabled]="disabled()">
        <textarea
          #textArea
          class="composer-textarea"
          [(ngModel)]="messageText"
          (ngModelChange)="onTextChange()"
          (keydown.enter)="onEnter($event)"
          (focus)="isFocused.set(true)"
          (blur)="isFocused.set(false)"
          [disabled]="disabled()"
          placeholder="Ask an HR question..."
          rows="1"
          maxlength="2000"
          aria-label="Type your message"
        ></textarea>
        <div class="composer-actions">
          @if (charCount() > 1600) {
            <span class="char-count" [class.char-warn]="charCount() > 1900">{{ 2000 - charCount() }}</span>
          }
          <button class="send-btn" [class.send-btn--active]="canSend()"
                  [disabled]="!canSend()" (click)="sendMessage()"
                  matTooltip="Send (Enter)" aria-label="Send message">
            <mat-icon>arrow_upward</mat-icon>
          </button>
        </div>
      </div>
      <p class="input-hint">
        <mat-icon inline>lock</mat-icon>
        Answers are based exclusively on your company HR documents
      </p>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .input-area {
      padding: 12px 24px 14px;
      background: transparent;
      flex-shrink: 0;
      position: relative;
    }
    .input-area::before {
      content: '';
      position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
      background: linear-gradient(90deg, transparent, var(--c-border), transparent);
    }

    .composer {
      display: flex; align-items: flex-end; gap: 0;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: var(--radius-xl);
      transition: all var(--t-base);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }
    .composer--focused {
      border-color: var(--c-primary);
      box-shadow: var(--shadow-glow);
      background: rgba(255,255,255,0.06);
    }
    .composer--disabled { opacity: 0.5; pointer-events: none; }

    .composer-textarea {
      flex: 1; border: none; background: transparent;
      padding: 13px 8px 13px 20px;
      font-family: inherit; font-size: 14px; line-height: 1.55;
      resize: none; outline: none; color: var(--c-text);
      max-height: 140px; overflow-y: auto;
    }
    .composer-textarea::placeholder { color: var(--c-text-muted); }

    .composer-actions {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px 8px 4px; flex-shrink: 0;
    }
    .char-count { font-size: 11px; color: var(--c-text-muted); min-width: 28px; text-align: right; }
    .char-warn  { color: var(--c-error) !important; font-weight: 600; }

    .send-btn {
      width: 38px; height: 38px; border-radius: 50%;
      border: 1px solid var(--c-border);
      background: var(--c-surface);
      color: var(--c-text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: default; flex-shrink: 0;
      transition: all var(--t-base);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .send-btn--active {
      background: linear-gradient(135deg, var(--c-primary), var(--c-secondary));
      border-color: transparent;
      color: #fff; cursor: pointer;
      box-shadow: 0 0 16px rgba(0,212,255,0.35);
    }
    .send-btn--active:hover { transform: scale(1.08); box-shadow: var(--shadow-neon); }
    .send-btn--active:active { transform: scale(0.94); }
    .send-btn:disabled { opacity: 1; }

    .input-hint {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      margin: 8px 0 0; font-size: 11px; color: var(--c-text-muted);
      mat-icon { font-size: 11px !important; opacity: 0.6; }
    }
  `]
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;
  messageText = '';
  readonly disabled  = signal(false);
  readonly isFocused = signal(false);
  readonly charCount = computed(() => this.messageText.length);
  readonly canSend   = computed(() => this.messageText.trim().length > 0 && !this.disabled());
  setDisabled(value: boolean): void { this.disabled.set(value); }
  onTextChange(): void {
    const el = this.textArea?.nativeElement;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; }
  }
  onEnter(event: Event): void {
    if (!(event as KeyboardEvent).shiftKey) { event.preventDefault(); this.sendMessage(); }
  }
  sendMessage(): void {
    const text = this.messageText.trim();
    if (!text || this.disabled()) return;
    this.messageSent.emit(text);
    this.messageText = '';
    if (this.textArea?.nativeElement) this.textArea.nativeElement.style.height = 'auto';
  }
}
