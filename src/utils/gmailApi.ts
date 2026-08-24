/**
 * Gmail REST API client for client-side authenticated requests
 */

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: {
    size: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailRawMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: {
    partId?: string;
    mimeType: string;
    filename?: string;
    headers?: GmailMessageHeader[];
    body?: {
      size: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
}

export interface ParsedGmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  dateRaw: number;
  bodyText: string;
  bodyHtml?: string;
  isUnread: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
}

export interface GmailUserProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// Decode base64url encoded strings from Gmail API
export function decodeBase64Url(data: string): string {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return decoded;
  } catch (e) {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return data;
    }
  }
}

// Encode UTF-8 string to base64url for sending
export function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Extract body text recursively from message payload
function extractBodyFromPayload(payload?: GmailRawMessage['payload']): { text: string; html?: string } {
  if (!payload) return { text: '' };

  let text = '';
  let html = '';

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      html = decoded;
      // Strip HTML tags for plain text fallback
      text = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      text = decoded;
    }
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeBase64Url(part.body.data);
        if (!text) {
          text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      } else if (part.parts) {
        const sub = extractBodyFromPayload(part as any);
        if (sub.text && !text) text = sub.text;
        if (sub.html && !html) html = sub.html;
      }
    }
  }

  return { text, html };
}

// Parse Raw Gmail Message into user-friendly structure
export function parseGmailMessage(raw: GmailRawMessage): ParsedGmailMessage {
  const headers = raw.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  let fromName = from;
  let fromEmail = from;

  const emailMatch = from.match(/<([^>]+)>/);
  if (emailMatch) {
    fromEmail = emailMatch[1];
    fromName = from.replace(/<[^>]+>/, '').trim().replace(/^["']|["']$/g, '') || fromEmail;
  }

  const to = getHeader('To');
  const subject = getHeader('Subject') || '(Mavzu ko\'rsatilmagan)';
  const dateStr = getHeader('Date');
  const dateRaw = raw.internalDate ? parseInt(raw.internalDate, 10) : dateStr ? new Date(dateStr).getTime() : Date.now();
  
  const formattedDate = new Date(dateRaw).toLocaleDateString('uz-UZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const { text, html } = extractBodyFromPayload(raw.payload);
  const labelIds = raw.labelIds || [];
  const isUnread = labelIds.includes('UNREAD');
  const isStarred = labelIds.includes('STARRED');

  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds,
    snippet: raw.snippet || text.slice(0, 120),
    from,
    fromName,
    fromEmail,
    to,
    subject,
    date: formattedDate,
    dateRaw,
    bodyText: text || raw.snippet || '',
    bodyHtml: html,
    isUnread,
    isStarred,
    hasAttachments: Boolean(raw.payload?.parts?.some((p) => Boolean(p.filename && p.filename.length > 0))),
  };
}

/**
 * Fetch User Gmail Profile (Email address and total messages)
 */
export async function fetchGmailProfile(accessToken: string): Promise<GmailUserProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail profilini yuklashda xatolik (${res.status})`);
  }

  return res.json();
}

/**
 * List messages with optional search query and label filters
 */
export async function listGmailMessages(
  accessToken: string,
  options: {
    maxResults?: number;
    q?: string;
    labelIds?: string[];
    pageToken?: string;
  } = {}
): Promise<{ messages: ParsedGmailMessage[]; nextPageToken?: string }> {
  const { maxResults = 15, q, labelIds, pageToken } = options;
  const params = new URLSearchParams();
  params.set('maxResults', String(maxResults));

  if (q) params.set('q', q);
  if (labelIds && labelIds.length > 0) {
    labelIds.forEach((lbl) => params.append('labelIds', lbl));
  }
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Xabarlarni yuklab bo'lmadi (${res.status})`);
  }

  const data = await res.json();
  const rawList: { id: string; threadId: string }[] = data.messages || [];

  if (rawList.length === 0) {
    return { messages: [], nextPageToken: data.nextPageToken };
  }

  // Fetch full details for the retrieved messages in parallel (max 15 at once)
  const detailPromises = rawList.map(async (item) => {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!msgRes.ok) return null;
      const rawMsg: GmailRawMessage = await msgRes.json();
      return parseGmailMessage(rawMsg);
    } catch {
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  const validMessages = resolved.filter((m): m is ParsedGmailMessage => m !== null);

  return {
    messages: validMessages,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Send a new email message via Gmail API
 */
export async function sendGmailMessage(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    bodyText: string;
    inReplyTo?: string;
    threadId?: string;
  }
): Promise<{ id: string; threadId: string }> {
  const { to, subject, bodyText, inReplyTo, threadId } = params;

  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${encodeBase64Url(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];

  if (inReplyTo) {
    emailLines.push(`In-Reply-To: ${inReplyTo}`);
    emailLines.push(`References: ${inReplyTo}`);
  }

  emailLines.push('');
  emailLines.push(encodeBase64Url(bodyText));

  const rawRfc2822 = emailLines.join('\r\n');
  const encodedRaw = encodeBase64Url(rawRfc2822);

  const payload: any = { raw: encodedRaw };
  if (threadId) {
    payload.threadId = threadId;
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Xatni yuborishda xatolik (${res.status})`);
  }

  return res.json();
}

/**
 * Star / Unstar message
 */
export async function toggleStarGmailMessage(
  accessToken: string,
  messageId: string,
  currentIsStarred: boolean
): Promise<void> {
  const body = currentIsStarred
    ? { removeLabelIds: ['STARRED'] }
    : { addLabelIds: ['STARRED'] };

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Xabarni yulduzcha holatini o'zgartirib bo'lmadi");
  }
}

/**
 * Mark message as Read / Unread
 */
export async function toggleReadGmailMessage(
  accessToken: string,
  messageId: string,
  markAsRead: boolean
): Promise<void> {
  const body = markAsRead
    ? { removeLabelIds: ['UNREAD'] }
    : { addLabelIds: ['UNREAD'] };

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("O'qilganlik holatini yangilab bo'lmadi");
  }
}

/**
 * Move message to Trash
 */
export async function trashGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Xabarni savatga tashlab bo'lmadi");
  }
}
