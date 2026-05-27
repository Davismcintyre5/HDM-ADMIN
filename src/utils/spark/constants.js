export const REPORT_STATUSES = ['submitted', 'under_review', 'resolved', 'dismissed'];
export const REPORT_TARGETS = ['message', 'status', 'profile', 'group'];
export const REPORT_REASONS = ['spam', 'harassment', 'nudity', 'violence', 'hate_speech', 'other'];
export const TICKET_STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const TICKET_CATEGORIES = ['general', 'technical', 'billing', 'account', 'privacy', 'other'];
export const WARN_TYPES = ['spam', 'harassment', 'inappropriate_content', 'terms_violation', 'other'];
export const WARN_SEVERITIES = ['low', 'medium', 'high'];
export const BACKUP_TYPES = ['full', 'incremental', 'chats_only', 'media_only'];
export const COMPRESSION_TYPES = ['gzip', 'zlib', 'none'];
export const LEGAL_TYPES = ['terms', 'privacy', 'cookies', 'ads_preferences'];
export const AI_FEATURES = [
  'chatWithAi', 'smartReply', 'autoComplete', 'emojiSuggest', 'stickerSuggest',
  'messageIntelligence', 'toneDetection', 'messageSummary', 'voiceTranscription',
  'sentimentAnalysis', 'spamDetection', 'hateSpeechFilter', 'nsfwBlocker',
  'childSafety', 'impersonationDetection', 'selfHarmDetection', 'linkSafetyCheck',
  'groupSummary', 'groupAutoModeration', 'semanticSearch', 'privacyAdvisor',
  'dataLeakDetection', 'broadcastAssist',
];