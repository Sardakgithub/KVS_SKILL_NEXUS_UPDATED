import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { api } from '../api/client'
import {
  ArrowRight,
  Brain,
  Route,
  GraduationCap,
  Users,
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
  Target,
  Rocket,
  Code
} from 'lucide-react'

export function Home() {
  const { user } = useAuth()

  // State for live catalog data if available from backend
  const [careerPaths, setCareerPaths] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [jobsList, setJobsList] = useState([])

  useEffect(() => {
    // Attempt to fetch public live data from backend APIs
    const fetchPublicData = async () => {
      try {
        const resCareers = await api.get('/careers/paths/')
        if (resCareers?.data?.results) {
          setCareerPaths(resCareers.data.results.slice(0, 3))
        } else if (Array.isArray(resCareers?.data)) {
          setCareerPaths(resCareers.data.slice(0, 3))
        }
      } catch (err) {
        // Fallback to static items if endpoint is empty
      }

      try {
        const resCourses = await api.get('/courses/')
        if (resCourses?.data?.results) {
          setCoursesList(resCourses.data.results.slice(0, 4))
        } else if (Array.isArray(resCourses?.data)) {
          setCoursesList(resCourses.data.slice(0, 4))
        }
      } catch (err) {
        // Fallback to static items
      }

      try {
        const resJobs = await api.get('/jobs/')
        if (resJobs?.data?.results) {
          setJobsList(resJobs.data.results.slice(0, 3))
        } else if (Array.isArray(resJobs?.data)) {
          setJobsList(resJobs.data.slice(0, 3))
        }
      } catch (err) {
        // Fallback to static items
      }
    }

    fetchPublicData()
  }, [])

  const scrollToSection = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Fallback static roadmaps if API has empty database
  const defaultRoadmaps = [
    {
      id: 1,
      title: 'Full-Stack Software Engineering',
      duration: '8 Months',
      difficulty: 'Beginner',
      category: 'Software Engineering',
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Django', 'PostgreSQL']
    },
    {
      id: 2,
      title: 'Artificial Intelligence & Machine Learning',
      duration: '10 Months',
      difficulty: 'Intermediate',
      category: 'AI & Data Science',
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow']
    },
    {
      id: 3,
      title: 'Data Science & Analytics',
      duration: '6 Months',
      difficulty: 'Beginner',
      category: 'Data',
      skills: ['SQL', 'Python', 'Pandas', 'Power BI', 'Data Visualization']
    }
  ]

  // Fallback static courses
  const defaultCourses = [
    {
      id: 1,
      title: 'Modern Full-Stack Development with React & Django',
      category: 'Web Development',
      level: 'Beginner to Advanced',
      duration: '12 Weeks',
      icon: Code
    },
    {
      id: 2,
      title: 'Applied AI & Neural Networks with Python',
      category: 'Artificial Intelligence',
      level: 'Intermediate',
      duration: '10 Weeks',
      icon: Brain
    },
    {
      id: 3,
      title: 'System Design & Scalable Cloud Architecture',
      category: 'Software Architecture',
      level: 'Advanced',
      duration: '8 Weeks',
      icon: Layers
    },
    {
      id: 4,
      title: 'Data Structures, Algorithms & Technical Interview Prep',
      category: 'Computer Science',
      level: 'All Levels',
      duration: '6 Weeks',
      icon: Rocket
    }
  ]

  // Fallback static jobs
  const defaultJobs = [
    {
      id: 1,
      title: 'Frontend Engineer Intern',
      company: 'TechNexus Solutions',
      type: 'Internship (Remote)',
      location: 'Remote',
      stipend: '$1,500 / month'
    },
    {
      id: 2,
      title: 'Junior AI/ML Software Developer',
      company: 'DataMind Systems',
      type: 'Full-Time',
      location: 'New York, NY / Remote',
      stipend: '$85,000 / year'
    },
    {
      id: 3,
      title: 'Backend Python / Django Developer',
      company: 'CloudPulse Labs',
      type: 'Full-Time',
      location: 'Austin, TX / Hybrid',
      stipend: '$90,000 / year'
    }
  ]

  const topMentors = [
    {
      name: 'Alex Rivera',
      role: 'Principal AI Engineer',
      company: 'Google',
      rating: 4.95,
      reviews: 48,
      skills: ['Python', 'TensorFlow', 'System Design']
    },
    {
      name: 'Priya Sharma',
      role: 'Lead Data Scientist',
      company: 'Meta',
      rating: 4.90,
      reviews: 35,
      skills: ['PyTorch', 'NLP', 'Data Science']
    },
    {
      name: 'Marcus Chen',
      role: 'Full Stack Architect',
      company: 'Microsoft',
      rating: 4.88,
      reviews: 60,
      skills: ['React', 'Node.js', 'Django', 'Azure']
    }
  ]

  const displayRoadmaps = careerPaths.length > 0 ? careerPaths : defaultRoadmaps
  const displayCourses = coursesList.length > 0 ? coursesList : defaultCourses
  const displayJobs = jobsList.length > 0 ? jobsList : defaultJobs

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      {/* ── Public Header Navigation ── */}
      <header className="glass-panel header-row" style={{
        position: 'sticky', top: '16px', zIndex: 100, margin: '16px 24px',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 'var(--radius-xl)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo size="medium" />
        </Link>

        {/* Public Header Nav Items (About, Careers, Courses, Jobs) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, 'about')}
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            About Us
          </a>
          <a
            href="#careers"
            onClick={(e) => scrollToSection(e, 'careers')}
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Careers
          </a>
          <a
            href="#courses"
            onClick={(e) => scrollToSection(e, 'courses')}
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Courses
          </a>
          <a
            href="#jobs"
            onClick={(e) => scrollToSection(e, 'jobs')}
            style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Jobs
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="btn-row" style={{ alignItems: 'center', gap: '12px' }}>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{ maxWidth: '1200px', margin: '60px auto 80px', padding: '0 24px', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '999px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)', marginBottom: '24px' }}>
          <Sparkles size={16} color="#6366f1" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4338ca' }}>Public Skill & Career Ecosystem</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
          Build Your Career <br />
          <span className="gradient-text">With Confidence</span>
        </h1>

        <p style={{ maxWidth: '750px', margin: '0 auto 36px', fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Discover structured career roadmaps, learn in-demand technical skills, connect with expert mentors from top tech companies, build ATS-friendly resumes, and land internships & jobs—all from one platform.
        </p>

        <div className="btn-row btn-row-mobile-stack" style={{ justifyContent: 'center', marginBottom: '60px', gap: '16px' }}>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              Launch Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                Create Free Student Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Platform Stats Grid */}
        <div className="glass-panel" style={{
          padding: '28px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)', borderRadius: 'var(--radius-xl)'
        }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284c7' }}>7+</div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, marginTop: '4px' }}>Career Roadmaps</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#db2777' }}>50+</div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, marginTop: '4px' }}>Expert Mentors</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#7c3aed' }}>100+</div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, marginTop: '4px' }}>Interactive Courses</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669' }}>1,000+</div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, marginTop: '4px' }}>Active Students</div>
          </div>
        </div>
      </section>

      {/* ── ABOUT US SECTION ── */}
      <section id="about" style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '80px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '16px' }}>
            <Target size={16} color="var(--accent-indigo)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>About KVS Skill Nexus</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '14px' }}>
            Empowering Next-Gen <span className="gradient-text">Tech Talent</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            KVS Skill Nexus bridges the gap between academic education and industry standards. We equip students with structured learning paths, real-world projects, expert mentorship, and direct access to top tech employers.
          </p>
        </div>

        {/* 4 Pillars of KVS Skill Nexus */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Route size={24} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Structured Roadmaps</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Follow step-by-step career roadmaps curated by top industry architects, guiding you from fundamental concepts to production mastery.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <GraduationCap size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Interactive Skill Courses</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Learn by doing. Access interactive courses, complete skill assessments, earn certificates, and build real projects for your portfolio.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <FileText size={24} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>ATS Resume Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Generate ATS-optimized resumes tailored for tech recruiters or upload existing resume files for automated skill analysis.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Briefcase size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Direct Job Openings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Discover verified tech internships and entry-level positions matched directly to your skill profile and roadmap progress.
            </p>
          </div>
        </div>
      </section>

      {/* ── CAREERS SECTION ── */}
      <section id="careers" style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '80px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', marginBottom: '16px' }}>
            <Route size={16} color="#0ea5e9" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ea5e9' }}>Career Paths & Roadmaps</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>
            Choose Your <span className="gradient-text">Career Path</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Follow structured roadmaps built by senior engineers to become job-ready with clear, step-by-step guidance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {displayRoadmaps.map((rm, idx) => (
            <div key={rm.id || idx} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="badge badge-purple">{rm.category || 'Technology'}</span>
                  <span className="badge badge-indigo">{rm.difficulty_level || rm.difficulty || 'Beginner'}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{rm.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Estimated Duration: <strong style={{ color: 'var(--text-main)' }}>{rm.estimated_months ? `${rm.estimated_months} Months` : rm.duration}</strong>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {(rm.required_skills?.map(s => s.name) || rm.skills || ['JavaScript', 'React', 'Node.js']).map((sk) => (
                    <span key={sk} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <Link to={user ? '/careers' : '/register'} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Explore Path <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES SECTION ── */}
      <section id="courses" style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '80px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '16px' }}>
            <GraduationCap size={16} color="#a855f7" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a855f7' }}>Learning Catalog</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>
            Interactive <span className="gradient-text">Courses & Modules</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Master core technologies with hands-on coding exercises, quizzes, and project-based modules.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
          {displayCourses.map((c, idx) => {
            const IconComp = c.icon || Code
            return (
              <div key={c.id || idx} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <IconComp size={22} color="var(--accent-cyan)" />
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem', marginBottom: '10px', display: 'inline-block' }}>
                    {c.category?.name || c.category || 'Technology'}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4 }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
                    Level: {c.difficulty_level || c.level || 'All Levels'} • {c.duration_hours ? `${c.duration_hours} Hours` : c.duration}
                  </p>
                </div>

                <Link to={user ? '/courses' : '/register'} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  View Course Details <ChevronRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── JOBS SECTION ── */}
      <section id="jobs" style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '80px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '16px' }}>
            <Briefcase size={16} color="#10b981" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>Careers & Internships</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>
            Discover Top <span className="gradient-text">Job Opportunities</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Apply directly to vetted tech companies hiring interns and junior software engineers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {displayJobs.map((j, idx) => (
            <div key={j.id || idx} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-indigo">{j.job_type || j.type || 'Full-Time'}</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{j.salary_range || j.stipend || 'Competitive'}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>{j.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '8px' }}>
                  {j.company?.name || j.company || 'Tech Company'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
                  Location: {j.location || 'Remote'}
                </p>
              </div>

              <Link to={user ? '/jobs' : '/register'} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Apply / View Details <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENTORS SHOWCASE SECTION ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Learn From <span className="gradient-text">Industry Experts</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Connect with experienced professionals who guide your career, review your projects, and prepare you for interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {topMentors.map((m, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'var(--primary-gradient)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '1.6rem', fontWeight: 'bold', color: '#fff'
              }}>
                {m.name[0]}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.role}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>{m.company}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '14px 0' }}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({m.reviews} reviews)</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
                {m.skills.map((s) => (
                  <span key={s} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Call-to-Action CTA Banner ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="glass-panel" style={{
          padding: '48px 32px', textAlign: 'center', borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.4)'
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            Join thousands of students building their career roadmaps, receiving expert mentorship, and landing top job roles.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 KVS Skill Nexus — AI-Powered Career Ecosystem. All rights reserved.</p>
      </footer>
    </div>
  )
}
