import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  topic: string;
  messages: ChatMessage[];
}

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="messaging-shell">

      <!-- Left Panel: Conversation List -->
      <aside class="conv-panel" [class.mobile-hidden]="selectedConv() !== null">
        <div class="conv-header">
          <h2 class="conv-title">Messages</h2>
          <button class="icon-btn-round" title="New conversation">
            <i class="bi bi-pencil-square"></i>
          </button>
        </div>

        <div class="conv-search">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search conversations…"
            [(ngModel)]="searchQuery"
            class="conv-search-input"
          />
        </div>

        <div class="conv-list">
          @for (conv of filteredConvs(); track conv.id) {
            <button
              class="conv-item"
              [class.active]="selectedConv()?.id === conv.id"
              (click)="selectConv(conv)"
            >
              <div class="conv-avatar-wrap">
                <div class="conv-avatar" [style.background]="conv.avatarColor">
                  {{ conv.initials }}
                </div>
                @if (conv.isOnline) {
                  <div class="online-dot"></div>
                }
              </div>
              <div class="conv-info">
                <div class="conv-row">
                  <span class="conv-name">{{ conv.name }}</span>
                  <span class="conv-time">{{ conv.timestamp }}</span>
                </div>
                <div class="conv-row">
                  <span class="conv-preview">{{ conv.lastMessage }}</span>
                  @if (conv.unread > 0) {
                    <span class="unread-badge">{{ conv.unread }}</span>
                  }
                </div>
                <span class="conv-topic">re: {{ conv.topic }}</span>
              </div>
            </button>
          }
        </div>
      </aside>

      <!-- Right Panel: Chat -->
      <main class="chat-panel" [class.mobile-visible]="selectedConv() !== null">

        @if (selectedConv(); as conv) {
          <!-- Chat Header -->
          <div class="chat-header">
            <button class="back-btn" (click)="goBack()">
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="chat-header-avatar" [style.background]="conv.avatarColor">
              {{ conv.initials }}
              @if (conv.isOnline) {
                <div class="chat-online-dot"></div>
              }
            </div>
            <div class="chat-header-info">
              <div class="chat-user-name">{{ conv.name }}</div>
              <div class="chat-status">
                <span class="status-dot" [class.online]="conv.isOnline"></span>
                {{ conv.isOnline ? 'Online now' : 'Last seen recently' }}
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="icon-btn-round" title="View listing">
                <i class="bi bi-box-arrow-up-right"></i>
              </button>
              <button class="icon-btn-round" title="More options">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
            </div>
          </div>

          <!-- Topic banner -->
          <div class="chat-topic-banner">
            <i class="bi bi-tag"></i>
            Conversation about: <strong>{{ conv.topic }}</strong>
          </div>

          <!-- Messages -->
          <div class="messages-area" #messagesArea>
            @for (msg of conv.messages; track msg.id) {
              <div class="msg-wrapper" [class.own]="msg.isOwn">
                @if (!msg.isOwn) {
                  <div class="msg-avatar" [style.background]="conv.avatarColor">
                    {{ conv.initials }}
                  </div>
                }
                <div class="msg-bubble" [class.own]="msg.isOwn">
                  <div class="msg-content">{{ msg.content }}</div>
                  <div class="msg-time">{{ msg.timestamp }}</div>
                </div>
              </div>
            }
          </div>

          <!-- Input Area -->
          <div class="chat-input-area">
            <button class="attach-btn" title="Attach file">
              <i class="bi bi-paperclip"></i>
            </button>
            <div class="chat-input-wrap">
              <input
                type="text"
                placeholder="Type your message…"
                [(ngModel)]="messageText"
                (keyup.enter)="sendMessage()"
                class="chat-input"
              />
            </div>
            <button class="send-btn" (click)="sendMessage()" [disabled]="!messageText.trim()">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>

        } @else {
          <!-- Empty State -->
          <div class="chat-empty">
            <div class="chat-empty-icon">
              <i class="bi bi-chat-quote"></i>
            </div>
            <h3 class="chat-empty-title">Select a conversation</h3>
            <p class="chat-empty-sub">Choose a conversation from the list to start messaging.</p>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .messaging-shell {
      display: flex;
      height: calc(100vh - 73px);
      background: var(--hy-bg);
      overflow: hidden;
    }

    // ---- Conversation Panel ----
    .conv-panel {
      width: 320px;
      flex-shrink: 0;
      background: var(--hy-surface);
      border-right: 1px solid var(--hy-border-light);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      @media (max-width: 768px) {
        width: 100%;
        &.mobile-hidden { display: none; }
      }
    }

    .conv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--hy-border-light);
    }

    .conv-title {
      font-family: var(--hy-font-display);
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--hy-midnight);
      margin: 0;
      letter-spacing: -0.03em;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .icon-btn-round {
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 1px solid var(--hy-border-light);
      background: transparent;
      color: var(--hy-text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: var(--hy-transition);

      &:hover {
        background: var(--hy-bg-alt);
        color: var(--hy-pomegranate);
        border-color: var(--hy-pomegranate);
      }
    }

    .conv-search {
      position: relative;
      padding: 12px 16px;
      border-bottom: 1px solid var(--hy-border-light);
    }

    .search-icon {
      position: absolute;
      left: 28px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--hy-text-muted);
      font-size: 14px;
      pointer-events: none;
    }

    .conv-search-input {
      width: 100%;
      padding: 9px 14px 9px 36px;
      background: var(--hy-bg-alt);
      border: 1px solid transparent;
      border-radius: var(--hy-radius-full);
      font-family: var(--hy-font-body);
      font-size: 0.85rem;
      color: var(--hy-text);
      outline: none;
      transition: var(--hy-transition);

      &:focus {
        border-color: var(--hy-pomegranate);
        background: var(--hy-surface);
      }

      &::placeholder { color: var(--hy-text-muted); }
    }

    .conv-list {
      flex: 1;
      overflow-y: auto;
    }

    .conv-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      width: 100%;
      border: none;
      background: transparent;
      cursor: pointer;
      border-left: 3px solid transparent;
      text-align: left;
      transition: var(--hy-transition);
      border-bottom: 1px solid var(--hy-border-light);

      &:hover { background: var(--hy-bg-alt); }

      &.active {
        background: rgba(181, 38, 30, 0.05);
        border-left-color: var(--hy-pomegranate);
      }
    }

    .conv-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .conv-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hy-font-display);
      font-weight: 700;
      font-size: 1rem;
      color: #fff;
    }

    .online-dot {
      position: absolute;
      bottom: 1px; right: 1px;
      width: 11px; height: 11px;
      border-radius: 50%;
      background: #4ade80;
      border: 2px solid var(--hy-surface);
    }

    .conv-info { flex: 1; min-width: 0; }

    .conv-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }

    .conv-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--hy-midnight);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .conv-time {
      font-size: 0.72rem;
      color: var(--hy-text-muted);
      flex-shrink: 0;
    }

    .conv-preview {
      font-size: 0.8rem;
      color: var(--hy-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .unread-badge {
      min-width: 20px; height: 20px;
      background: var(--hy-pomegranate);
      color: #fff;
      border-radius: var(--hy-radius-full);
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      flex-shrink: 0;
    }

    .conv-topic {
      font-size: 0.72rem;
      color: var(--hy-text-muted);
      font-style: italic;
      display: block;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // ---- Chat Panel ----
    .chat-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--hy-bg);
      overflow: hidden;
      min-width: 0;

      @media (max-width: 768px) {
        display: none;
        &.mobile-visible { display: flex; width: 100%; }
      }
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: var(--hy-surface);
      border-bottom: 1px solid var(--hy-border-light);
      flex-shrink: 0;
    }

    .back-btn {
      display: none;
      width: 32px; height: 32px;
      border: none; background: transparent;
      cursor: pointer; color: var(--hy-text-secondary);
      font-size: 16px; align-items: center;
      justify-content: center; border-radius: 50%;
      transition: var(--hy-transition);

      &:hover { background: var(--hy-bg-alt); color: var(--hy-text); }

      @media (max-width: 768px) { display: flex; }
    }

    .chat-header-avatar {
      position: relative;
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hy-font-display);
      font-weight: 700;
      color: #fff;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .chat-online-dot {
      position: absolute;
      bottom: 0; right: 0;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #4ade80;
      border: 2px solid var(--hy-surface);
    }

    .chat-header-info { flex: 1; min-width: 0; }

    .chat-user-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--hy-midnight);
      margin-bottom: 2px;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .chat-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      color: var(--hy-text-muted);
    }

    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--hy-border-strong);

      &.online { background: #4ade80; }
    }

    .chat-header-actions {
      display: flex;
      gap: 6px;
    }

    // Topic banner
    .chat-topic-banner {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 20px;
      background: rgba(181, 38, 30, 0.06);
      border-bottom: 1px solid rgba(181, 38, 30, 0.1);
      font-size: 0.8rem;
      color: var(--hy-pomegranate);
      flex-shrink: 0;

      i { font-size: 12px; }
      strong { font-weight: 700; }
    }

    // Messages
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .msg-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;

      &.own { flex-direction: row-reverse; }
    }

    .msg-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hy-font-display);
      font-size: 0.65rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .msg-bubble {
      max-width: 58%;
      display: flex;
      flex-direction: column;
      gap: 4px;

      @media (max-width: 640px) { max-width: 78%; }
    }

    .msg-content {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.5;
      word-break: break-word;
      background: var(--hy-surface);
      color: var(--hy-text);
      border: 1px solid var(--hy-border-light);
      border-bottom-left-radius: 4px;

      .msg-bubble.own & {
        background: var(--hy-pomegranate);
        color: #fff;
        border-color: var(--hy-pomegranate);
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 4px;
      }
    }

    .msg-time {
      font-size: 0.69rem;
      color: var(--hy-text-muted);
      padding: 0 4px;

      .msg-bubble.own & { text-align: right; }
    }

    // Input
    .chat-input-area {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      background: var(--hy-surface);
      border-top: 1px solid var(--hy-border-light);
      flex-shrink: 0;
    }

    .attach-btn {
      width: 38px; height: 38px;
      border: none; background: transparent;
      color: var(--hy-text-muted);
      cursor: pointer; font-size: 18px;
      display: flex; align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: var(--hy-transition);
      flex-shrink: 0;

      &:hover {
        background: var(--hy-bg-alt);
        color: var(--hy-pomegranate);
      }
    }

    .chat-input-wrap {
      flex: 1;
      background: var(--hy-bg-alt);
      border-radius: var(--hy-radius-full);
      border: 1.5px solid var(--hy-border-light);
      transition: border-color 0.2s;

      &:focus-within {
        border-color: var(--hy-pomegranate);
      }
    }

    .chat-input {
      width: 100%;
      padding: 10px 18px;
      border: none;
      background: transparent;
      font-family: var(--hy-font-body);
      font-size: 0.9rem;
      color: var(--hy-text);
      outline: none;

      &::placeholder { color: var(--hy-text-muted); }
    }

    .send-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--hy-pomegranate);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      transition: var(--hy-transition);
      flex-shrink: 0;

      &:hover { background: var(--hy-pomegranate-light); transform: scale(1.05); }
      &:disabled { opacity: 0.4; cursor: default; transform: none; }
    }

    // Empty
    .chat-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-align: center;
      padding: 40px;
    }

    .chat-empty-icon {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: var(--hy-bg-alt);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: var(--hy-text-muted);
      margin-bottom: 8px;
    }

    .chat-empty-title {
      font-family: var(--hy-font-display);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--hy-midnight);
      margin: 0;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .chat-empty-sub {
      font-size: 0.9rem;
      color: var(--hy-text-secondary);
      margin: 0;
      max-width: 280px;
    }
  `],
})
export class MessagingComponent {
  @ViewChild('messagesArea') messagesAreaRef!: ElementRef;

  searchQuery = '';
  messageText = '';
  selectedConv = signal<Conversation | null>(null);

  conversations = signal<Conversation[]>([
    {
      id: '1',
      name: 'Levon Tataryan',
      initials: 'LT',
      avatarColor: 'linear-gradient(135deg, #5B21B6, #8B5CF6)',
      lastMessage: 'Is the iPhone still available?',
      timestamp: '2m',
      unread: 2,
      isOnline: true,
      topic: 'iPhone 13 Pro',
      messages: [
        { id: '1', sender: 'Levon', content: "Hi, I'm interested in your iPhone listing", timestamp: '10:30 AM', isOwn: false },
        { id: '2', sender: 'You', content: "Hi Levon! Yes, it's in excellent condition", timestamp: '10:32 AM', isOwn: true },
        { id: '3', sender: 'Levon', content: "Can you provide more photos? I'd love to see the screen condition", timestamp: '10:35 AM', isOwn: false },
        { id: '4', sender: 'You', content: 'Sure! I can send them tomorrow', timestamp: '10:36 AM', isOwn: true },
        { id: '5', sender: 'Levon', content: 'Is the iPhone still available?', timestamp: '10:45 AM', isOwn: false },
      ],
    },
    {
      id: '2',
      name: 'Anahit Harutyunyan',
      initials: 'AH',
      avatarColor: 'linear-gradient(135deg, #B5261E, #D4822A)',
      lastMessage: 'Thank you! Very helpful tips',
      timestamp: '1h',
      unread: 0,
      isOnline: false,
      topic: 'Language Tutoring',
      messages: [
        { id: '1', sender: 'Anahit', content: 'Hi! Interested in the tutoring service', timestamp: '9:15 AM', isOwn: false },
        { id: '2', sender: 'You', content: 'Great! What level are you?', timestamp: '9:20 AM', isOwn: true },
        { id: '3', sender: 'Anahit', content: 'Intermediate. Looking to improve my conversational Armenian', timestamp: '9:22 AM', isOwn: false },
        { id: '4', sender: 'You', content: "Perfect! I have some great exercises for that. Let's schedule a session.", timestamp: '9:25 AM', isOwn: true },
        { id: '5', sender: 'Anahit', content: 'Thank you! Very helpful tips', timestamp: '9:30 AM', isOwn: false },
      ],
    },
    {
      id: '3',
      name: 'Karen Martirosyan',
      initials: 'KM',
      avatarColor: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
      lastMessage: 'When can you deliver?',
      timestamp: '3h',
      unread: 1,
      isOnline: true,
      topic: 'Vintage Armenian Carpet',
      messages: [
        { id: '1', sender: 'Karen', content: 'Hi! Love your carpet listing — is it still available?', timestamp: '7:00 AM', isOwn: false },
        { id: '2', sender: 'You', content: "Thank you! Yes, it's still available.", timestamp: '7:10 AM', isOwn: true },
        { id: '3', sender: 'Karen', content: 'Is it genuine Armenian hand-woven?', timestamp: '7:15 AM', isOwn: false },
        { id: '4', sender: 'You', content: 'Yes, from the 1980s. Very well-preserved and authentic.', timestamp: '7:18 AM', isOwn: true },
        { id: '5', sender: 'Karen', content: 'When can you deliver?', timestamp: '7:30 AM', isOwn: false },
      ],
    },
  ]);

  filteredConvs = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.conversations();
    return this.conversations().filter(
      c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  });

  selectConv(conv: Conversation): void {
    this.selectedConv.set(conv);
    this.conversations.update(list =>
      list.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    );
    setTimeout(() => this.scrollToBottom(), 50);
  }

  goBack(): void {
    this.selectedConv.set(null);
  }

  sendMessage(): void {
    const text = this.messageText.trim();
    const conv = this.selectedConv();
    if (!text || !conv) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    this.conversations.update(list =>
      list.map(c =>
        c.id === conv.id
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text }
          : c
      )
    );
    this.selectedConv.update(c => c ? { ...c, messages: [...c.messages, newMsg], lastMessage: text } : c);
    this.messageText = '';
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesAreaRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
