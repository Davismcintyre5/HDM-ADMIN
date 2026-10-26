import { Route } from 'react-router-dom';

import Dashboard from '../../pages/tvetgrid/Dashboard';
import Users from '../../pages/tvetgrid/Users';
import UserDetail from '../../pages/tvetgrid/UserDetail';
import Courses from '../../pages/tvetgrid/Courses';
import CourseDetail from '../../pages/tvetgrid/CourseDetail';
import Lessons from '../../pages/tvetgrid/Lessons';
import LessonDetail from '../../pages/tvetgrid/LessonDetail';
import Notes from '../../pages/tvetgrid/Notes';
import NoteDetail from '../../pages/tvetgrid/NoteDetail';
import Papers from '../../pages/tvetgrid/Papers';
import PaperDetail from '../../pages/tvetgrid/PaperDetail';
import Meetings from '../../pages/tvetgrid/Meetings';
import MeetingDetail from '../../pages/tvetgrid/MeetingDetail';
import Analytics from '../../pages/tvetgrid/Analytics';
import Settings from '../../pages/tvetgrid/Settings';
import Backup from '../../pages/tvetgrid/Backup';
import Legal from '../../pages/tvetgrid/Legal';
import LegalDetail from '../../pages/tvetgrid/LegalDetail';
import Profile from '../../pages/tvetgrid/Profile';
import Forbidden from '../../pages/tvetgrid/Forbidden';
import NotFound from '../../pages/tvetgrid/NotFound';

const routes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />

    <Route path="courses" element={<Courses />} />
    <Route path="courses/:id" element={<CourseDetail />} />

    <Route path="lessons" element={<Lessons />} />
    <Route path="lessons/:id" element={<LessonDetail />} />

    <Route path="notes" element={<Notes />} />
    <Route path="notes/:id" element={<NoteDetail />} />

    <Route path="papers" element={<Papers />} />
    <Route path="papers/:id" element={<PaperDetail />} />

    <Route path="meetings" element={<Meetings />} />
    <Route path="meetings/:id" element={<MeetingDetail />} />

    <Route path="analytics" element={<Analytics />} />
    <Route path="settings" element={<Settings />} />
    <Route path="backup" element={<Backup />} />

    <Route path="legal" element={<Legal />} />
    <Route path="legal/:slug" element={<LegalDetail />} />

    <Route path="profile" element={<Profile />} />
    <Route path="403" element={<Forbidden />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default routes;