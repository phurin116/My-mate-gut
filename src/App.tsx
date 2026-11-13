import { lazy, Suspense, type ReactNode } from 'react';
import { createHashRouter, createMemoryRouter, RouterProvider } from 'react-router';
import { Layout, RequireRole, RequireUser } from './components/Layout';
import { ButtonLink, EmptyState, Skeleton, ToastProvider } from './components/ui';
import { Compass } from 'lucide-react';
import { useT } from './i18n';
import Home from './pages/Home';
import Browse from './pages/Browse';
import InternshipDetail from './pages/InternshipDetail';

// Public browsing pages load with the app. Everything else is split out so
// first paint stays fast on mobile connections.
const Company = lazy(() => import('./pages/Company'));
const Companies = lazy(() => import('./pages/Companies'));
const Compare = lazy(() => import('./pages/Compare'));
const Trust = lazy(() => import('./pages/Trust'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Dashboard = lazy(() => import('./pages/student/Dashboard'));
const Profile = lazy(() => import('./pages/student/Profile'));
const Apply = lazy(() => import('./pages/student/Apply'));
const ApplicationDetail = lazy(() => import('./pages/student/ApplicationDetail'));
const Saved = lazy(() => import('./pages/student/Lists').then((m) => ({ default: m.Saved })));
const Applications = lazy(() => import('./pages/student/Lists').then((m) => ({ default: m.Applications })));
const Notifications = lazy(() => import('./pages/student/Lists').then((m) => ({ default: m.Notifications })));
const StartupDashboard = lazy(() => import('./pages/startup/StartupDashboard').then((m) => ({ default: m.StartupDashboard })));
const CompanyProfileForm = lazy(() => import('./pages/startup/StartupDashboard').then((m) => ({ default: m.CompanyProfileForm })));
const ListingForm = lazy(() => import('./pages/startup/ListingForm'));
const Applicants = lazy(() => import('./pages/startup/Applicants'));
const University = lazy(() => import('./pages/org/University'));
const Admin = lazy(() => import('./pages/org/Admin'));

function PageFallback() {
  return (
    <div className="container page" aria-busy="true">
      <div className="stack">
        <Skeleton width="40%" height={32} />
        <Skeleton width="70%" height={16} />
        <Skeleton height={180} />
      </div>
    </div>
  );
}

const page = (node: ReactNode) => <Suspense fallback={<PageFallback />}>{node}</Suspense>;
const student = (node: ReactNode) => page(<RequireRole role="student">{node}</RequireRole>);
const startup = (node: ReactNode) => page(<RequireRole role="startup">{node}</RequireRole>);

function NotFound() {
  const t = useT();
  return (
    <div className="container page">
      <EmptyState icon={<Compass size={22} />} title={t.notFound.title} body={t.notFound.body}>
        <ButtonLink to="/internships" variant="primary">
          {t.notFound.cta}
        </ButtonLink>
      </EmptyState>
    </div>
  );
}


// Embedded previews (sandboxed frames) cannot change the URL, so they route in memory.
const createRouter = import.meta.env.VITE_ROUTER === 'memory' ? createMemoryRouter : createHashRouter;

const router = createRouter([
  {
    // The toast provider sits inside the router because toasts can contain links.
    element: (
      <ToastProvider>
        <Layout />
      </ToastProvider>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/internships', element: <Browse /> },
      { path: '/internships/:id', element: <InternshipDetail /> },
      { path: '/internships/:id/apply', element: student(<Apply />) },
      { path: '/companies', element: page(<Companies />) },
      { path: '/companies/:id', element: page(<Company />) },
      { path: '/compare', element: page(<Compare />) },
      { path: '/trust', element: page(<Trust />) },
      { path: '/signin', element: page(<SignIn />) },
      { path: '/notifications', element: page(<RequireUser><Notifications /></RequireUser>) },

      { path: '/dashboard', element: student(<Dashboard />) },
      { path: '/profile', element: student(<Profile />) },
      { path: '/saved', element: student(<Saved />) },
      { path: '/applications', element: student(<Applications />) },
      { path: '/applications/:id', element: student(<ApplicationDetail />) },

      { path: '/startup', element: startup(<StartupDashboard />) },
      { path: '/startup/company', element: startup(<CompanyProfileForm />) },
      { path: '/startup/listings/new', element: startup(<ListingForm />) },
      { path: '/startup/listings/:id/edit', element: startup(<ListingForm />) },
      { path: '/startup/listings/:id/applicants', element: startup(<Applicants />) },

      { path: '/university', element: page(<RequireRole role="university"><University /></RequireRole>) },
      { path: '/admin', element: page(<RequireRole role="admin"><Admin /></RequireRole>) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
