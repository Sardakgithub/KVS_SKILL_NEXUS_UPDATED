import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import {
  ArrowRight,
  Compass,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  CheckCircle2,
  Star,
  Brain,
  Route,
  GraduationCap,
  ChevronRight,
  Shield,
  Layers,
  Terminal,
  Layout as LayoutIcon
} from 'lucide-react'

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI Career Guidance',
      description: 'Receive personalized career recommendations based on your interests, technical skills, and learning goals.'
    },
    {
      icon: Route,
      title: 'Career Roadmaps',
      description: "Follow structured, step-by-step learning paths designed for today's most in-demand technology roles."
    },
    {
      icon: GraduationCap,
      title: 'Learning Platform',
      description: 'Access curated courses, learning modules, skill assessments, and industry certifications in one place.'
    },
    {
      icon: Users,
      title: 'Expert Mentors',
      description: 'Book 1-on-1 mentoring sessions with industry professionals from Google, Meta, Microsoft, and AWS.'
    },
    {
      icon: FileText,
      title: 'Resume Builder & Upload',
      description: 'Upload your pre-formatted resume file or build ATS-friendly resumes tailored for recruiters.'
    },
    {
      icon: Briefcase,
      title: 'Jobs & Internships',
      description: 'Discover curated internships and full-time job opportunities that match your roadmap and skill level.'
    }
  ]

  const featuredRoadmaps = [
    {
      title: 'Software Engineering',
      duration: '8 Months',
      difficulty: 'Beginner',
      category: 'Technology',
      icon: Layers,
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Django']
    },
    {
      title: 'Artificial Intelligence',
      duration: '10 Months',
      difficulty: 'Intermediate',
      category: 'Technology',
      icon: Brain,
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch']
    },
    {
      title: 'Data Analytics',
      duration: '6 Months',
      difficulty: 'Beginner',
      category: 'Data',
      icon: Route,
      skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data Viz']
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      {/* Public Header Navigation */}
      <header className="glass-panel" style={{
        position: 'sticky', top: '16px', zIndex: 100, margin: '16px 24px',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 'var(--radius-xl)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size="medium" />
        </Link>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 20px' }}>
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '10px 20px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '10px 22px' }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '60px auto 80px', padding: '0 24px', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '999px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4338ca' }}>Public Skill & Career Ecosystem</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
          Build Your Career <br />
          <span className="gradient-text">With Confidence</span>
        </h1>

        <p style={{ maxWidth: '750px', margin: '0 auto 36px', fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Discover structured career roadmaps, learn in-demand technical skills, connect with expert mentors from top tech companies, build ATS-friendly resumes, and land internships & jobs—all from one platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}>
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
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
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

      {/* Features Grid Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Everything You Need To <span className="gradient-text">Build Your Career</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            KVS Skill Nexus provides all the tools students need to learn, practice, connect with mentors, and land their dream jobs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <div key={idx} className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <Icon size={26} color="var(--accent-cyan)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{feat.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Career Roadmaps */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Choose Your <span className="gradient-text">Career Path</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Follow structured roadmaps built by industry experts to become job-ready with confidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {featuredRoadmaps.map((rm, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="badge badge-purple">{rm.category}</span>
                  <span className="badge badge-indigo">{rm.difficulty}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{rm.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Estimated Duration: <strong style={{ color: 'var(--text-main)' }}>{rm.duration}</strong>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {rm.skills.map((sk) => (
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

      {/* Industry Expert Mentors Showcase */}
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

      {/* Call-to-Action CTA Banner */}
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
