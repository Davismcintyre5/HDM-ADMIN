export const ROUTES = {
  login: '/tvetgrid/login',
  dashboard: '/tvetgrid',
  users: '/tvetgrid/users',
  userDetail: (id) => `/tvetgrid/users/${id}`,
  courses: '/tvetgrid/courses',
  courseDetail: (id) => `/tvetgrid/courses/${id}`,
  lessons: '/tvetgrid/lessons',
  lessonDetail: (id) => `/tvetgrid/lessons/${id}`,
  notes: '/tvetgrid/notes',
  noteDetail: (id) => `/tvetgrid/notes/${id}`,
  papers: '/tvetgrid/papers',
  paperDetail: (id) => `/tvetgrid/papers/${id}`,
  meetings: '/tvetgrid/meetings',
  meetingDetail: (id) => `/tvetgrid/meetings/${id}`,
  analytics: '/tvetgrid/analytics',
  settings: '/tvetgrid/settings',
  backup: '/tvetgrid/backup',
  legal: '/tvetgrid/legal',
  legalDetail: (slug) => `/tvetgrid/legal/${slug}`,
  profile: '/tvetgrid/profile',
  forbidden: '/tvetgrid/403',
};

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const USER_ROLE_LIST = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

export const MEETING_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
};

export const MEETING_STATUS_LIST = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
];

export const NOTE_VISIBILITY = {
  PUBLIC: 'public',
  ENROLLED: 'enrolled',
  PRIVATE: 'private',
};

export const NOTE_VISIBILITY_LIST = [
  { value: 'public', label: 'Public' },
  { value: 'enrolled', label: 'Enrolled only' },
  { value: 'private', label: 'Private' },
];

export const RSVP_STATUS = {
  INVITED: 'invited',
  ATTENDED: 'attended',
  ABSENT: 'absent',
};

export const DIFFICULTY = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const ANALYTICS_TABS = [
  { key: 'attempts', label: 'Attempts' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'invites', label: 'Invites' },
];

export const COURSE_TABS = [
  { key: 'subjects', label: 'Subjects' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'notes', label: 'Notes' },
  { key: 'papers', label: 'Papers' },
];

export const DEFAULT_PAGE_SIZE = 20;

export const STATUS_VARIANT = {
  active: 'success',
  inactive: 'default',
  disabled: 'danger',
  published: 'success',
  draft: 'warning',
  unpublished: 'default',
  scheduled: 'info',
  live: 'danger',
  ended: 'default',
  invited: 'info',
  attended: 'success',
  absent: 'danger',
  success: 'success',
  failed: 'danger',
  never: 'default',
};

export function statusVariant(status) {
  return STATUS_VARIANT[status] || 'default';
}

export function statusLabel(status) {
  if (!status) return '—';
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}