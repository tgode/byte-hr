import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CitationPanelComponent } from '../citation-panel/citation-panel.component';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, CitationPanelComponent],
  template: `
    <div class="msg-list">
      @if (!messages || messages.length === 0) {
        <div class="empty-state">
          <div class="empty-hero">
            <div class="orbit orbit-1"><div class="orbit-dot"></div></div>
            <div class="orbit orbit-2"><div class="orbit-dot"></div></div>
            <div class="hero-ring ring-3"></div>
            <div class="hero-ring ring-2"></div>
            <div class="hero-ring ring-1"></div>
            <div class="hero-icon">
              <mat-icon>support_agent</mat-icon>
            </div>
          </div>
          <h2 class="empty-title">How can I help you today?</h2>
          <p class="empty-sub">Ask me anything about HR policies, leave, benefits,<br>or other workplace topics.</p>
          <div class="chips-grid">
            @for (s of suggestions; track s.label) {
              <button class="chip" (click)="onSuggestion(s.text)">
                <span class="chip-icon">{{ s.emoji }}</span>
                <span class="chip-label">{{ s.label }}</span>
                <mat-icon class="chip-arrow">arrow_forward</mat-icon>
              </button>
            }
          </div>
        </div>
      }

      @for (msg of messages; track msg.id) {
        <div class="msg-wrap" [class.user-wrap]="msg.role === 'user'">
          @if (msg.role === 'assistant') {
            <div class="avatar bot-av">
              <mat-icon>support_agent</mat-icon>
            </div>
          }
          <div class="bubble-col" [class.user-col]="msg.role === 'user'">
            <span class="role-label">{{ msg.role === 'user' ? 'You' : 'ByteHR AI' }}</span>
            <div class="bubble" [class.user-bubble]="msg.role === 'user'" [class.bot-bubble]="msg.role === 'assistant'">
              @if (msg.loading) {
                <div class="typing-dots"><span></span><span></span><span></span></div>
              } @else {
                <div class="msg-body" [innerHTML]="format(msg.content)"></div>
                @if (msg.role === 'assistant' && msg.citations?.length) {
                  <div class="citation-wrap">
                    <app-citation-panel [citations]="msg.citations!" />
                  </div>
                }
                @if (msg.role === 'assistant' && msg.confidenceScore && msg.confidenceScore > 0) {
                  <div class="conf-badge"
                       [class.conf-high]="msg.confidenceScore >= 0.75"
                       [class.conf-mid]="msg.confidenceScore >= 0.5 && msg.confidenceScore < 0.75"
                       [class.conf-low]="msg.confidenceScore < 0.5">
                    <mat-icon inline>shield</mat-icon>
                    {{ (msg.confidenceScore * 100).toFixed(0) }}% match
                  </div>
                }
              }
            </div>
            <time class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</time>
          </div>
          @if (msg.role === 'user') {
            <div class="avatar user-av"><mat-icon>person</mat-icon></div>
          }
        </div>
      }
      <div style="height:20px"></div>
    </div>
  `,
  styles: [`
    .msg-list {
      display: flex; flex-direction: column;
      padding: 20px 24px 0; flex: 1;
    }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 24px 40px;
      flex: 1; text-align: center; min-height: 420px;
    }
    .empty-hero {
      position: relative; width: 100px; height: 100px; margin-bottom: 32px;
    }
    .hero-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 1px solid var(--c-primary);
      animation: ring-expand 3s ease-out infinite;
    }
    .ring-1 { animation-delay: 0s;   opacity: 0.5; }
    .ring-2 { animation-delay: 1s;   opacity: 0.3; }
    .ring-3 { animation-delay: 2s;   opacity: 0.15; }
    @keyframes ring-expand {
      0%   { transform: scale(1);    opacity: 0.5; }
      100% { transform: scale(2.2);  opacity: 0; }
    }
    .orbit {
      position: absolute; inset: -10px; border-radius: 50%;
      animation: orbit-spin linear infinite;
    }
    .orbit-1 { animation-duration: 6s; }
    .orbit-2 { animation-duration: 10s; animation-direction: reverse; }
    .orbit-dot {
      position: absolute; top: 50%; left: 0;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--c-primary);
      box-shadow: 0 0 8px var(--c-primary);
      transform: translateY(-50%);
    }
    .orbit-2 .orbit-dot { background: var(--c-secondary); box-shadow: 0 0 8px var(--c-secondary); }
    @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .hero-icon {
      position: absolute; inset: 18px; border-radius: 50%;
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(180,79,255,0.15));
      border: 1px solid var(--c-glass-border);
      color: var(--c-primary);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 30px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05);
      backdrop-filter: blur(10px);
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }

    .empty-title {
      margin: 0 0 10px; font-size: 22px; font-weight: 700;
      color: var(--c-text); letter-spacing: -0.5px;
      background: linear-gradient(135deg, var(--c-text) 40%, var(--c-primary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .empty-sub {
      margin: 0 0 36px; font-size: 14px; color: var(--c-text-secondary); line-height: 1.7;
    }
    .chips-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      width: 100%; max-width: 460px;
    }
    .chip {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      background: var(--c-surface); border: 1px solid var(--c-border);
      border-radius: var(--radius-lg); color: var(--c-text);
      font-size: 13px; font-family: inherit; cursor: pointer; text-align: left;
      transition: all var(--t-base); position: relative; overflow: hidden;
    }
    .chip::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--c-primary-light), rgba(180,79,255,0.05));
      opacity: 0; transition: opacity var(--t-base);
    }
    .chip:hover { border-color: var(--c-primary); box-shadow: 0 0 16px rgba(0,212,255,0.12); }
    .chip:hover::before { opacity: 1; }
    .chip > * { position: relative; z-index: 1; }
    .chip-icon { font-size: 20px; flex-shrink: 0; }
    .chip-label { flex: 1; font-weight: 500; }
    .chip-arrow {
      font-size: 14px !important; width: 14px !important; height: 14px !important;
      color: var(--c-primary); opacity: 0;
      transition: opacity var(--t-fast), transform var(--t-fast); flex-shrink: 0;
    }
    .chip:hover .chip-arrow { opacity: 1; transform: translateX(3px); }

    /* Messages */
    .msg-wrap {
      display: flex; align-items: flex-end; gap: 10px; margin-bottom: 16px;
      animation: msg-in 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .user-wrap { flex-direction: row-reverse; }
    @keyframes msg-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Avatars */
    .avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .bot-av {
      background: linear-gradient(135deg, var(--c-primary), var(--c-secondary));
      color: #fff;
      box-shadow: 0 0 16px rgba(0,212,255,0.3);
    }
    .user-av {
      background: var(--c-surface); color: var(--c-text-secondary);
      border: 1px solid var(--c-border);
    }

    /* Bubble column */
    .bubble-col { display: flex; flex-direction: column; gap: 4px; max-width: min(68%, 600px); }
    .user-col { align-items: flex-end; }
    .role-label {
      font-size: 11px; font-weight: 600; color: var(--c-text-muted);
      padding: 0 6px; letter-spacing: 0.3px; text-transform: uppercase;
    }

    /* Bubbles */
    .bubble { padding: 12px 16px; font-size: 14px; line-height: 1.65; word-break: break-word; }
    .user-bubble {
      background: linear-gradient(135deg, #00D4FF 0%, #B44FFF 100%);
      color: #fff;
      border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl);
      box-shadow: 0 4px 20px rgba(0,212,255,0.25);
    }
    [data-theme="light"] .user-bubble {
      background: linear-gradient(135deg, #5B5BD6 0%, #9333EA 100%);
      box-shadow: 0 4px 20px rgba(91,91,214,0.25);
    }
    .bot-bubble {
      background: var(--c-bubble-bot-bg);
      color: var(--c-bubble-bot-text);
      border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);
      border: 1px solid var(--c-bubble-bot-border);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-sm);
    }

    /* Typing */
    .typing-dots { display: flex; align-items: center; gap: 5px; padding: 4px 2px; min-width: 44px; }
    .typing-dots span {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--c-primary);
      box-shadow: 0 0 6px var(--c-primary);
      animation: bounce 1.4s ease-in-out infinite;
      display: block;
    }
    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; background: var(--c-secondary); box-shadow: 0 0 6px var(--c-secondary); }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
      30%            { transform: translateY(-6px); opacity: 1; }
    }

    .msg-body { white-space: pre-wrap; }
    .msg-body ::ng-deep strong { font-weight: 700; }
    .msg-body ::ng-deep em { font-style: italic; }
    .msg-body ::ng-deep code {
      background: rgba(0,212,255,0.1); padding: 1px 6px;
      border-radius: 4px; font-size: 12.5px;
      font-family: "Cascadia Code","Consolas",monospace;
      border: 1px solid rgba(0,212,255,0.2); color: var(--c-primary);
    }
    .user-bubble .msg-body ::ng-deep code { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.3); color: #fff; }

    .citation-wrap { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--c-border-light); }

    .conf-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 600;
      padding: 3px 10px; border-radius: var(--radius-full); margin-top: 10px;
      border: 1px solid;
    }
    .conf-high { background: rgba(0,255,163,0.1); color: #00FFA3; border-color: rgba(0,255,163,0.25); }
    .conf-mid  { background: rgba(255,215,0,0.1); color: #FFD700; border-color: rgba(255,215,0,0.25); }
    .conf-low  { background: rgba(255,77,106,0.1); color: #FF4D6A; border-color: rgba(255,77,106,0.25); }
    [data-theme="light"] .conf-high { background: #DCFCE7; color: #16A34A; border-color: #86EFAC; }
    [data-theme="light"] .conf-mid  { background: #FEF9C3; color: #A16207; border-color: #FDE047; }
    [data-theme="light"] .conf-low  { background: #FEE2E2; color: #DC2626; border-color: #FCA5A5; }

    .msg-time { font-size: 10px; color: var(--c-text-muted); padding: 0 6px; }
  `]
})
export class MessageListComponent {
  @Input() messages: ChatMessage[] = [];
  readonly suggestions = [
    { emoji: '🏖', label: 'Vacation days',  text: 'How many vacation days do I have?' },
    { emoji: '🏥', label: 'Sick leave',     text: 'What is the sick leave policy?' },
    { emoji: '🎁', label: 'Benefits',       text: 'What employee benefits are available?' },
    { emoji: '📋', label: 'Working hours',  text: 'What are the working hours policy?' }
  ];
  format(content: string): string {
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }
  onSuggestion(text: string): void {
    document.dispatchEvent(new CustomEvent('hr-suggestion', { detail: text }));
  }
}
