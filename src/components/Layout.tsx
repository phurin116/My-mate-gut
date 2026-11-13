import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import {
  Bell,
  Bookmark,
  Compass,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from 'lucide-react';
import type { Role } from '../domain/types';
import { resetDemo, signOut } from '../data/actions';
import { homePathFor, useSession } from '../data/selectors';
import { useT } from '../i18n';
import { CompareBar } from './listing';
import { Button, ButtonLink, ConfirmDialog, useToast } from './ui';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

function useNavItems(): NavItem[] {
  const t = useT();
  const { user } = useSession();
  const browse = { to: '/internships', label: t.nav.internships };
  const companies = { to: '/companies', label: t.nav.companies };
  switch (user?.role) {
    case 'startup':
      return [
        { to: '/startup', label: t.nav.listings, end: true },
        { to: '/startup/company', label: t.nav.companyProfile },
        browse,
        companies,
      ];
    case 'university':
      return [{ to: '/university', label: t.nav.report }, browse, companies];
    case 'admin':
      return [{ to: '/admin', label: t.nav.verificationQueue }, browse, companies];
    default:
      // Students and visitors see the same structure. Personal pages ask visitors to sign in.
      return [
        { to: '/', label: t.nav.home, end: true },
        browse,
        companies,
        { to: '/saved', label: t.nav.saved },
        { to: '/applications', label: t.nav.applications },
        { to: '/dashboard', label: t.nav.dashboard },
      ];
  }
}

function Logo() {
  const t = useT();
  return (
    <Link to="/" className="logo" aria-label={`${t.brand}. ${t.nav.home}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--brand)" />
        <path
          d="M8 22V10l8 7 8-7v12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{t.brand}</span>
    </Link>
  );
}

function AccountMenu() {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const initial = user.name.trim()[0]?.toUpperCase() ?? '?';
  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.nav.account}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar" aria-hidden="true">
          {initial}
        </span>
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <div className="menu-head">
            <p className="small muted">{t.nav.signedInAs}</p>
            <p className="truncate" style={{ fontWeight: 600 }}>
              {user.name}
            </p>
            <p className="small muted">{t.roles[user.role]}</p>
          </div>
          {user.role === 'student' && (
            <Link to="/profile" role="menuitem" className="menu-item" onClick={() => setOpen(false)}>
              <UserIcon size={16} aria-hidden="true" />
              {t.nav.profile}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              setOpen(false);
              signOut();
              navigate('/');
              toast(t.pub.signIn.signedOut);
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            {t.actions.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

function DemoBanner() {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="demo-banner">
      <div className="container demo-banner-inner">
        <FlaskConical size={14} aria-hidden="true" />
        <p>
          <span className="demo-long">{t.demo.banner}</span>
          <span className="demo-short">{t.demo.bannerShort}</span>
        </p>
        <button type="button" onClick={() => setConfirm(true)}>
          {t.demo.reset}
        </button>
      </div>
      {confirm && (
        <ConfirmDialog
          title={t.demo.resetTitle}
          body={t.demo.resetBody}
          confirmLabel={t.demo.reset}
          danger
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            resetDemo();
            navigate('/');
            toast(t.demo.resetDone);
          }}
        />
      )}
    </div>
  );
}

function Header() {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, unread } = useSession();
  const items = useNavItems();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname, location.search]);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="main-nav" aria-label={t.nav.main}>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="main-nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/notifications" className="icon-btn" aria-label={`${t.nav.notifications}. ${t.nav.unread(unread)}`}>
                <Bell size={20} aria-hidden="true" />
                {unread > 0 && <span className="dot" aria-hidden="true" />}
              </Link>
              <span className="desktop-only">
                <AccountMenu />
              </span>
            </>
          ) : (
            <>
              <Link to="/signin?tab=create&as=startup" className="employer-link desktop-only">
                {t.nav.forEmployers}
              </Link>
              <ButtonLink to="/signin" variant="primary" size="sm">
                {t.actions.signIn}
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            className="icon-btn mobile-only"
            aria-label={t.nav.menu}
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label={t.nav.menu} onClick={(e) => e.stopPropagation()}>
            <div className="spread" style={{ padding: '10px 12px 10px 20px' }}>
              <span className="eyebrow">{t.nav.menu}</span>
              <button type="button" className="icon-btn" aria-label={t.actions.close} onClick={() => setDrawer(false)} autoFocus>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            {user && (
              <div className="drawer-user">
                <span className="avatar" aria-hidden="true">
                  {user.name.trim()[0]?.toUpperCase()}
                </span>
                <div className="grow">
                  <p className="truncate" style={{ fontWeight: 600 }}>
                    {user.name}
                  </p>
                  <p className="small muted">{t.roles[user.role]}</p>
                </div>
              </div>
            )}
            <nav aria-label={t.nav.main} className="drawer-nav">
              {items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="drawer-link">
                  {item.label}
                </NavLink>
              ))}
              {user?.role === 'student' && (
                <>
                  <NavLink to="/profile" className="drawer-link">
                    {t.nav.profile}
                  </NavLink>
                  <NavLink to="/notifications" className="drawer-link">
                    {t.nav.notifications}
                  </NavLink>
                </>
              )}
              <NavLink to="/compare" className="drawer-link">
                {t.pub.compare.title}
              </NavLink>
              {!user && (
                <NavLink to="/signin?tab=create&as=startup" className="drawer-link">
                  {t.nav.forEmployers}
                </NavLink>
              )}
            </nav>
            <div style={{ padding: 20, marginTop: 'auto' }}>
              {user ? (
                <Button
                  block
                  icon={<LogOut size={16} aria-hidden="true" />}
                  onClick={() => {
                    signOut();
                    navigate('/');
                    toast(t.pub.signIn.signedOut);
                  }}
                >
                  {t.actions.signOut}
                </Button>
              ) : (
                <ButtonLink to="/signin" variant="primary" block>
                  {t.actions.signIn}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/** Bottom tab bar: the primary navigation for students on phones. */
function StudentTabBar() {
  const t = useT();
  const tabs = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/internships', label: t.nav.explore, icon: Compass },
    { to: '/saved', label: t.nav.saved, icon: Bookmark },
    { to: '/applications', label: t.nav.applicationsShort, icon: FileText },
    { to: '/profile', label: t.nav.profile, icon: UserIcon },
  ];
  return (
    <nav className="tabbar" aria-label={t.nav.main}>
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="tabbar-link">
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Footer() {
  const t = useT();
  const f = t.footer;
  const { user } = useSession();
  // Signed-in visitors get links into their own workspace instead of sign-up pages.
  const profileLink = user?.role === 'student' ? '/profile' : '/signin?tab=create';
  const postLink = user?.role === 'startup' ? '/startup/listings/new' : '/signin?tab=create&as=startup';
  const universityLink = user?.role === 'university' ? '/university' : '/signin';
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="small muted" style={{ marginTop: 12, maxWidth: '36ch' }}>
            {f.about}
          </p>
        </div>
        <div>
          <h2 className="eyebrow">{f.students}</h2>
          <ul>
            <li>
              <Link to="/internships">{f.browse}</Link>
            </li>
            <li>
              <Link to="/internships?exp=none">{f.noExperience}</Link>
            </li>
            <li>
              <Link to="/companies">{f.companies}</Link>
            </li>
            <li>
              <Link to={profileLink}>{f.createProfile}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">{f.startups}</h2>
          <ul>
            <li>
              <Link to={postLink}>{f.post}</Link>
            </li>
            <li>
              <Link to="/trust">{f.getVerified}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">{f.platform}</h2>
          <ul>
            <li>
              <Link to="/trust">{f.trust}</Link>
            </li>
            <li>
              <Link to={universityLink}>{f.universities}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-base">
        <p className="small muted">
          © {new Date().getFullYear()} {t.brand}. {f.rights}
        </p>
      </div>
    </footer>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode; title: string; body: string; reload: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container page" role="alert">
        <div className="empty">
          <h3>{this.props.title}</h3>
          <p>{this.props.body}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            {this.props.reload}
          </Button>
        </div>
      </div>
    );
  }
}

export function Layout() {
  const t = useT();
  const location = useLocation();
  const { user } = useSession();
  const isStudent = user?.role === 'student';
  return (
    <div className={`app${isStudent ? ' has-tabbar' : ''}`}>
      <a href="#main" className="skip-link" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}>
        {t.nav.skip}
      </a>
      <DemoBanner />
      <Header />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary key={location.pathname} {...t.errorBoundary}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CompareBar />
      {isStudent && <StudentTabBar />}
      <ScrollRestoration />
    </div>
  );
}

/** Route guard. Sends signed-out visitors to sign in, and other roles to their own home. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const location = useLocation();
  const { user } = useSession();
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname + location.search, required: true }} />;
  if (user.role !== role) return <Navigate to={homePathFor(user)} replace />;
  return <>{children}</>;
}

export function RequireUser({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useSession();
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname + location.search, required: true }} />;
  return <>{children}</>;
}
