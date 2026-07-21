import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges,
  Input, Output, EventEmitter,
  signal, computed,
  ViewChild, ElementRef, AfterViewChecked, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageListComponent } from '../message-list/message-list.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat.model';
import { uuidv4 } from '../../shared/uuid';
import { appTheme } from '../../app.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatSnackBarModule,
    MessageListComponent, MessageInputComponent
  ],
  template: `
    <div class="chat-window">

      <!-- Header -->
      <header class="chat-header">
        <div class="header-left">
          <button class="hamburger-btn" (click)="menuToggle.emit()" aria-label="Open menu">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="header-brand">
            <img class="header-logo" src="ENG_logo_with_name-removebg.png" alt="Engineering" />
          </div>
          <div class="header-divider"></div>
          <div class="header-info">
            <span class="header-name">HR Assistant</span>
            <span class="header-status">
              <span class="status-dot" [class.thinking]="isLoading()"></span>
              {{ isLoading() ? 'Thinking...' : 'Online' }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button mat-icon-button class="sm action-btn"
                  matTooltip="Sync HR documents"
                  (click)="syncDocuments()">
            <mat-icon>sync</mat-icon>
          </button>
          <button mat-icon-button class="sm action-btn"
                  matTooltip="Clear conversation"
                  (click)="clearConversation()">
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>
      </header>

      <!-- Messages -->
      <div class="messages-scroll" #scrollContainer>
        <app-message-list [messages]="messages()" />
      </div>

      <!-- Input -->
      <app-message-input
        #inputComponent
        (messageSent)="onMessageSent($event)"
      />

    </div>
  `,
  styles: [`
    :host { display: contents; }
    .chat-window {
      display: flex; flex-direction: column; height: 100%;
      background: transparent; overflow: hidden; position: relative;
    }
    /* Header */
    .chat-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; height: var(--header-height);
      background: var(--c-glass);
      border-bottom: 1px solid var(--c-glass-border);
      flex-shrink: 0; gap: 12px;
      backdrop-filter: blur(24px);
      position: relative; z-index: 5;
    }
    .chat-header::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--c-primary), transparent);
      opacity: 0.3;
    }
    .header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .header-brand {
      display: flex; align-items: center; flex-shrink: 0;
      height: 44px; overflow: visible; position: relative;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      background: radial-gradient(circle at 20% 30%, rgba(0,212,255,0.10), transparent 70%);
    }
    .header-logo {
      height: 42px; width: auto; max-width: 220px;
      object-fit: contain;
      filter: drop-shadow(0 2px 10px rgba(0,212,255,0.30));
      transition: transform var(--t-base), filter var(--t-base);
    }
    .header-brand:hover .header-logo {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 16px rgba(0,212,255,0.5));
    }
    .header-divider {
      width: 1px; height: 26px;
      background: linear-gradient(180deg, transparent, var(--c-border), transparent);
      flex-shrink: 0;
    }
    .header-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .header-name {
      font-size: 14px; font-weight: 700; color: var(--c-text); letter-spacing: -0.2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .header-status {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; color: var(--c-text-secondary); letter-spacing: 0.2px;
    }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--c-online); flex-shrink: 0;
      box-shadow: 0 0 6px var(--c-online);
      transition: background var(--t-base);
    }
    .status-dot.thinking {
      background: var(--c-thinking);
      box-shadow: 0 0 8px var(--c-thinking);
      animation: dot-blink 0.9s ease-in-out infinite;
    }
    @keyframes dot-blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.2; }
    }
    .header-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .action-btn {
      color: var(--c-text-muted) !important;
      transition: color var(--t-fast) !important;
      border-radius: var(--radius-md) !important;
    }
    .action-btn:hover {
      color: var(--c-primary) !important;
      background: var(--c-primary-light) !important;
    }
    /* Messages scroll */
    .messages-scroll {
      flex: 1; overflow-y: auto; display: flex; flex-direction: column;
      scroll-behavior: smooth; min-height: 0; position: relative; z-index: 1;
    }
    .hamburger-btn {
      display: none; align-items: center; justify-content: center;
      width: 36px; height: 36px; padding: 0;
      border: none; background: transparent;
      color: var(--c-text-secondary); cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--t-fast);
      flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .hamburger-btn:hover { background: var(--c-primary-light); color: var(--c-primary); }
    @media (max-width: 768px) { .hamburger-btn { display: flex; } }
  `]
})
export class ChatWindowComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() conversationId = uuidv4();

  @Output() conversationStarted = new EventEmitter<{ id: string; title: string; preview: string }>();
  @Output() conversationCleared = new EventEmitter<void>();
  @Output() menuToggle = new EventEmitter<void>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('inputComponent') inputComponent!: MessageInputComponent;

  private readonly chatService = inject(ChatService);
  private readonly snackBar    = inject(MatSnackBar);

  private readonly _messages  = signal<ChatMessage[]>([]);
  readonly messages  = this._messages.asReadonly();

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  readonly isDark = computed(() => appTheme() === 'dark');

  private shouldScrollToBottom = false;
  private suggestionListener!: EventListener;
  private readonly messageStore = new Map<string, ChatMessage[]>();

  ngOnInit(): void {
    this.suggestionListener = (e: Event) => {
      const text = (e as CustomEvent).detail as string;
      if (text) this.onMessageSent(text);
    };
    document.addEventListener('hr-suggestion', this.suggestionListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversationId']) {
      const prev = changes['conversationId'].previousValue;
      if (prev) this.messageStore.set(prev, this._messages());
      const next = changes['conversationId'].currentValue as string;
      this._messages.set(this.messageStore.get(next) ?? []);
      this._isLoading.set(false);
      this.shouldScrollToBottom = true;
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('hr-suggestion', this.suggestionListener);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  onMessageSent(text: string): void {
    if (!text.trim() || this._isLoading()) return;

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user',      content: text, timestamp: new Date() };
    const loadMsg: ChatMessage = { id: uuidv4(), role: 'assistant', content: '',   timestamp: new Date(), loading: true };

    this._messages.update(m => [...m, userMsg, loadMsg]);
    this._isLoading.set(true);
    this.inputComponent?.setDisabled(true);
    this.shouldScrollToBottom = true;

    const title = text.length > 40 ? text.slice(0, 40) + '...' : text;
    this.conversationStarted.emit({ id: this.conversationId, title, preview: text });

    this.chatService.sendMessage({ message: text, conversationId: this.conversationId }).subscribe({
      next: (res) => {
        this._messages.update(msgs => msgs.map(m =>
          m.id === loadMsg.id
            ? { ...m, content: res.answer, citations: res.citations, confidenceScore: res.confidenceScore, loading: false }
            : m
        ));
        this._isLoading.set(false);
        this.inputComponent?.setDisabled(false);
        this.shouldScrollToBottom = true;
      },
      error: (err: Error) => {
        this._messages.update(msgs => msgs.map(m =>
          m.id === loadMsg.id
            ? { ...m, content: err.message || 'An error occurred. Please try again.', loading: false }
            : m
        ));
        this._isLoading.set(false);
        this.inputComponent?.setDisabled(false);
        this.shouldScrollToBottom = true;
        this.snackBar.open('Connection error. Please check API availability.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  clearConversation(): void {
    this._messages.set([]);
    this.conversationCleared.emit();
  }

  syncDocuments(): void {
    this.chatService.triggerSync().subscribe({
      next: () => this.snackBar.open('Document sync started.', 'OK', { duration: 3000 }),
      error: () => this.snackBar.open('Sync failed. Check SharePoint configuration.', 'Dismiss', { duration: 4000 })
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
}
