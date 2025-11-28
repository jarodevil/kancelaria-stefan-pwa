interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface ChatArchive {
  version: string;
  exportDate: string;
  messages: Message[];
  messageCount: number;
}

const CHAT_STORAGE_KEY = "stefan_chat_history";
const ARCHIVE_THRESHOLD_DAYS = 30;

/**
 * Checks if chat history is older than 30 days and needs archiving
 */
export function needsArchiving(): boolean {
  const messages = loadChatHistory();
  if (messages.length === 0) return false;

  const oldestTimestamp = messages[0].timestamp;
  if (!oldestTimestamp) return false;

  const daysSinceOldest = (Date.now() - oldestTimestamp) / (1000 * 60 * 60 * 24);
  return daysSinceOldest >= ARCHIVE_THRESHOLD_DAYS;
}

/**
 * Loads chat history from localStorage
 */
export function loadChatHistory(): Message[] {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!saved) return [];

    const messages = JSON.parse(saved);
    
    // Add timestamps if missing (for backward compatibility)
    return messages.map((msg: Message) => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }));
  } catch (e) {
    console.error("Failed to load chat history", e);
    return [];
  }
}

/**
 * Saves a message to chat history with timestamp
 */
export function saveMessage(message: Message): void {
  const messages = loadChatHistory();
  messages.push({
    ...message,
    timestamp: Date.now(),
  });
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

/**
 * Exports chat history as JSON file for download
 */
export function exportChatArchive(): void {
  const messages = loadChatHistory();
  
  const archive: ChatArchive = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    messages,
    messageCount: messages.length,
  };

  const blob = new Blob([JSON.stringify(archive, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stefan-chat-archive-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Archives old messages (>30 days) and keeps only recent ones
 */
export function archiveOldMessages(): { archived: number; kept: number } {
  const messages = loadChatHistory();
  const cutoffDate = Date.now() - ARCHIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  const oldMessages = messages.filter(msg => (msg.timestamp || 0) < cutoffDate);
  const recentMessages = messages.filter(msg => (msg.timestamp || Date.now()) >= cutoffDate);

  if (oldMessages.length > 0) {
    // Export old messages
    const archive: ChatArchive = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      messages: oldMessages,
      messageCount: oldMessages.length,
    };

    const blob = new Blob([JSON.stringify(archive, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stefan-auto-archive-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Keep only recent messages
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(recentMessages));
  }

  return {
    archived: oldMessages.length,
    kept: recentMessages.length,
  };
}

/**
 * Imports chat archive from JSON file
 */
export function importChatArchive(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const archive: ChatArchive = JSON.parse(content);
        
        if (!archive.messages || !Array.isArray(archive.messages)) {
          throw new Error("Invalid archive format");
        }

        const currentMessages = loadChatHistory();
        const mergedMessages = [...currentMessages, ...archive.messages];
        
        // Sort by timestamp
        mergedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(mergedMessages));
        resolve(archive.messages.length);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Clears all chat history
 */
export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_STORAGE_KEY);
}
