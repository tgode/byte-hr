import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { appTheme } from '../../app.component';

export interface ConversationPreview {
  id: string; title: string; preview: string; timestamp: Date; unread?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.mobile-open]="mobileOpen">
      <div class="sidebar-logo">
        <div class="logo-wrap">
          <img class="logo-img" src="logoOnly-removebg.png" alt="Engineering" />
        </div>
        <div class="logo-text-wrap">
          <span class="logo-company">Engineering</span>
          <span class="logo-badge">HR AI</span>
        </div>
        <button class="mobile-close-btn" (click)="closed.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="new-chat-wrap">
        <button class="new-chat-btn" (click)="newChat.emit()">
          <mat-icon>add</mat-icon>
          <span>New conversation</span>
        </button>
      </div>

      <div class="section-header"><span>Recent</span></div>

      <nav class="conv-list">
        @if (conversations.length === 0) {
          <div class="conv-empty">
            <mat-icon>forum</mat-icon>
            <span>No conversations yet</span>
          </div>
        }
        @for (conv of conversations; track conv.id) {
          <div class="conv-item" [class.active]="conv.id === activeId"
               (click)="conversationSelected.emit(conv.id)"
               role="button" tabindex="0"
               (keydown.enter)="conversationSelected.emit(conv.id)">
            <div class="conv-icon">
              <mat-icon>{{ conv.id === activeId ? 'chat_bubble' : 'chat_bubble_outline' }}</mat-icon>
            </div>
            <div class="conv-meta">
              <div class="conv-title-row">
                <span class="conv-title">{{ conv.title }}</span>
                <span class="conv-time">{{ conv.timestamp | date:'HH:mm' }}</span>
              </div>
              <span class="conv-preview">{{ conv.preview }}</span>
            </div>
            @if (conv.unread) {
              <span class="unread-dot"></span>
            }
          </div>
        }
      </nav>

      <div class="spacer"></div>
      <div class="sidebar-divider"></div>

      <div class="sidebar-footer">
        <button class="footer-btn" (click)="toggleTheme()">
          <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          <span>{{ isDark() ? 'Light mode' : 'Dark mode' }}</span>
        </button>
        <a routerLink="/settings" routerLinkActive="footer-btn--active" class="footer-btn">
          <mat-icon>settings</mat-icon>
          <span>Settings</span>
        </a>
        <div class="footer-user">
          <div class="user-avatar"><mat-icon>person</mat-icon></div>
          <div class="user-info">
            <span class="user-name">Employee</span>
            <span class="user-role">HR Portal</span>
          </div>
          <div class="user-status"></div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }

    .sidebar {
      width: var(--sidebar-width);
      height: 100%;
      background: var(--c-sidebar-bg);
      border-right: 1px solid var(--c-sidebar-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex-shrink: 0;
      backdrop-filter: blur(24px);
      position: relative;
      z-index: 10;
    }
    .sidebar::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--c-primary), transparent);
      opacity: 0.5;
    }

    .sidebar-logo {
      display: flex; align-items: center; gap: 12px;
      padding: 0 14px;
      height: var(--header-height);
      border-bottom: 1px solid var(--c-sidebar-border);
      flex-shrink: 0;
    }
    .logo-wrap {
      width: 52px; height: 52px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      border-radius: var(--radius-lg);
      position: relative;
      background: radial-gradient(circle at 30% 30%, rgba(0,212,255,0.18), rgba(180,79,255,0.08) 70%, transparent 100%);
    }
    .logo-wrap::before {
      content: "";
      position: absolute; inset: -3px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--c-primary), var(--c-secondary));
      opacity: 0.18;
      filter: blur(10px);
      z-index: 0;
    }
    .logo-img {
      width: 100%; height: 100%; object-fit: contain;
      position: relative; z-index: 1;
      filter: drop-shadow(0 2px 8px rgba(0,212,255,0.35));
      transition: transform var(--t-base), filter var(--t-base);
    }
    .logo-wrap:hover .logo-img {
      transform: scale(1.08) rotate(-2deg);
      filter: drop-shadow(0 4px 14px rgba(0,212,255,0.55));
    }
    .logo-text-wrap { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .logo-company {
      font-size: 14px; font-weight: 700; color: var(--c-text); letter-spacing: -0.3px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .logo-badge {
      font-size: 9px; font-weight: 700; letter-spacing: 1px;
      color: var(--c-primary);
      background: var(--c-primary-light);
      border: 1px solid rgba(0,212,255,0.2);
      padding: 2px 6px; border-radius: var(--radius-full);
      align-self: flex-start;
    }
    .mobile-close-btn {
      display: none; align-items: center; justify-content: center;
      width: 30px; height: 30px; padding: 0;
      border: none; background: transparent;
      color: var(--c-text-secondary); cursor: pointer;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .new-chat-wrap { padding: 12px 10px 6px; flex-shrink: 0; }
    .new-chat-btn {
      width: 100%; display: flex; align-items: center; gap: 8px;
      padding: 9px 16px;
      border: 1px solid var(--c-primary);
      border-radius: var(--radius-full);
      background: var(--c-primary-light);
      color: var(--c-primary);
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: all var(--t-base);
      position: relative; overflow: hidden;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .new-chat-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--c-primary), var(--c-secondary));
      opacity: 0;
      transition: opacity var(--t-base);
    }
    .new-chat-btn:hover { color: #fff; box-shadow: var(--shadow-neon); }
    .new-chat-btn:hover::before { opacity: 1; }
    .new-chat-btn > * { position: relative; z-index: 1; }

    .section-header {
      padding: 10px 16px 4px;
      font-size: 10px; font-weight: 700; color: var(--c-text-muted);
      text-transform: uppercase; letter-spacing: 1.2px;
    }

    .conv-list { flex: 1; overflow-y: auto; padding: 2px 6px; }
    .conv-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px 16px;
      color: var(--c-text-muted); font-size: 12px; text-align: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; opacity: 0.3; }
    }
    .conv-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: var(--radius-md);
      cursor: pointer; outline: none; position: relative;
      transition: background var(--t-fast);
      border: 1px solid transparent;
    }
    .conv-item:hover { background: var(--c-sidebar-hover); border-color: var(--c-border); }
    .conv-item.active {
      background: var(--c-sidebar-active);
      border-color: var(--c-glass-border);
      box-shadow: 0 0 12px rgba(0,212,255,0.08);
    }
    .conv-item.active::before {
      content: '';
      position: absolute; left: 0; top: 8px; bottom: 8px;
      width: 2px; border-radius: 0 2px 2px 0;
      background: linear-gradient(180deg, var(--c-primary), var(--c-secondary));
      box-shadow: 0 0 8px var(--c-primary);
    }
    .conv-icon {
      width: 30px; height: 30px; border-radius: var(--radius-full);
      background: var(--c-surface); color: var(--c-text-muted);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      border: 1px solid var(--c-border);
      transition: all var(--t-fast);
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .conv-item.active .conv-icon {
      background: var(--c-primary-light);
      color: var(--c-primary);
      border-color: rgba(0,212,255,0.3);
      box-shadow: 0 0 8px rgba(0,212,255,0.2);
    }
    .conv-meta { flex: 1; min-width: 0; }
    .conv-title-row { display: flex; align-items: center; gap: 4px; }
    .conv-title {
      flex: 1; font-size: 12.5px; font-weight: 500; color: var(--c-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .conv-time { font-size: 10px; color: var(--c-text-muted); white-space: nowrap; }
    .conv-preview {
      display: block; font-size: 11px; color: var(--c-text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;
    }
    .unread-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--c-primary); flex-shrink: 0;
      box-shadow: 0 0 6px var(--c-primary);
    }

    .spacer { flex: 1; min-height: 8px; }
    .sidebar-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--c-sidebar-border), transparent);
      margin: 0 10px;
    }
    .sidebar-footer { padding: 6px 6px 12px; display: flex; flex-direction: column; gap: 1px; }
    .footer-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: var(--radius-md);
      color: var(--c-text-secondary); font-size: 13px; cursor: pointer;
      transition: all var(--t-fast);
      text-decoration: none; border: none; background: transparent;
      font-family: inherit; width: 100%; text-align: left;
      mat-icon { font-size: 17px; width: 17px; height: 17px; flex-shrink: 0; }
    }
    .footer-btn:hover { background: var(--c-sidebar-hover); color: var(--c-primary); }
    .footer-btn--active { color: var(--c-primary) !important; background: var(--c-primary-light) !important; }
    .footer-user {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: var(--radius-md); margin-top: 4px;
      border: 1px solid var(--c-border);
      background: var(--c-surface);
    }
    .user-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--c-primary), var(--c-secondary));
      color: #fff;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
    }
    .user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .user-name { font-size: 12px; font-weight: 600; color: var(--c-text); }
    .user-role { font-size: 10px; color: var(--c-text-muted); }
    .user-status {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--c-online); flex-shrink: 0;
      box-shadow: 0 0 6px var(--c-online);
      animation: pulse-online 2s ease-in-out infinite;
    }
    @keyframes pulse-online {
      0%, 100% { box-shadow: 0 0 6px var(--c-online); }
      50%       { box-shadow: 0 0 12px var(--c-online), 0 0 20px rgba(0,255,163,0.3); }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed; top: 0; left: 0; height: 100%; z-index: 200;
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        box-shadow: 4px 0 40px rgba(0,212,255,0.15);
      }
      .sidebar.mobile-open { transform: translateX(0); }
      .mobile-close-btn { display: flex; }
    }
  `]
})
export class SidebarComponent {
  @Input() conversations: ConversationPreview[] = [];
  @Input() activeId = '';
  @Input() mobileOpen = false;
  @Output() newChat = new EventEmitter<void>();
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();
  readonly isDark = computed(() => appTheme() === 'dark');
  toggleTheme(): void { appTheme.set(appTheme() === 'dark' ? 'light' : 'dark'); }
}
