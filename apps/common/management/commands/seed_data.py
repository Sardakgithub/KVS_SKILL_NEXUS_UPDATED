"""
Django management command to populate the database with rich, realistic data
for KVS Skill Nexus: Users, Mentors, Students, Skills, Career Paths, Courses,
Assessments, Jobs, Internships, Certificates, and Notifications.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime

from apps.accounts.models import User, Roles
from apps.students.models import StudentProfile, LearningHistory, StudentSetting
from apps.mentors.models import MentorProfile, MentorAvailability, Booking, Review
from apps.careers.models import (
    CareerCategory, Skill, CareerPath, CareerRoadmapStage, StageMilestone,
    StudentCareerProgress, FavoriteCareer
)
from apps.courses.models import CourseCategory, Course, LearningResource, Enrollment
from apps.assessments.models import Assessment, Question, Option
from apps.jobs.models import Company, Job, Internship, Application
from apps.certificates.models import Certificate
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = "Populates database with realistic initial data for testing and production demonstration."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding process..."))

        # ----------------------------------------------------------------------
        # 1. USERS & PROFILES
        # ----------------------------------------------------------------------
        # Admin User
        admin_user, _ = User.objects.get_or_create(
            email="admin@kvs.com",
            defaults={
                "first_name": "Admin",
                "last_name": "User",
                "role": Roles.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_email_verified": True,
            }
        )
        admin_user.set_password("Admin@123")
        admin_user.save()

        # Student User
        demo_student, _ = User.objects.get_or_create(
            email="student@kvs.com",
            defaults={
                "first_name": "Sarah",
                "last_name": "Connor",
                "role": Roles.STUDENT,
                "is_email_verified": True,
                "bio": "Aspiring AI Engineer and Cloud Software Architect.",
            }
        )
        demo_student.set_password("Student@123")
        demo_student.save()

        student_profile, _ = StudentProfile.objects.get_or_create(
            user=demo_student,
            defaults={
                "headline": "Full Stack Software Engineer | Python, React & Machine Learning Specialist",
                "phone": "+1 (555) 234-5678",
                "location": "San Francisco, CA (Open to Remote)",
                "bio": "Passionate Software Engineer with hands-on experience in full-stack application development, REST APIs with Django, React glassmorphic interfaces, and cloud deployments.",
                "education_level": "undergraduate",
                "major_or_stream": "Computer Science & Engineering",
                "institution": "Stanford University",
                "graduation_year": 2026,
                "academic_score": "3.85 / 4.0 GPA (88.5%)",
                "job_hunt_status": "actively_looking",
                "notice_period": "Immediate",
                "expected_salary": "$110,000 / year (or 15 LPA)",
                "preferred_locations": ["San Francisco, CA", "New York, NY", "Remote"],
                "skills": ["Python", "JavaScript", "React.js", "Django", "SQL & Relational DBs", "Docker & Containers", "AWS Cloud"],
                "career_goals": ["AI Research", "Full-Stack Development"],
                "interests": ["Machine Learning", "Cloud Infrastructure"],
                "languages_spoken": ["English", "Hindi"],
                "certifications": ["AWS Certified Solutions Architect", "Google Professional ML Engineer"],
                "projects_highlights": "Built an AI-driven automated career roadmap generator and interactive mentorship portal.",
                "github_url": "https://github.com/demo-student",
                "linkedin_url": "https://linkedin.com/in/demo-student",
                "portfolio_url": "https://sarahconnor.dev",
                "twitter_url": "https://twitter.com/demo_student",
            }
        )

        StudentSetting.objects.get_or_create(student=student_profile)

        # Mentors (Users + Profiles)
        mentors_data = [
            {
                "email": "alex.rivera@google.com",
                "first_name": "Alex",
                "last_name": "Rivera",
                "company": "Google",
                "job_title": "Principal AI Engineer",
                "years_experience": 10,
                "hourly_rate": 150.00,
                "average_rating": 4.95,
                "total_reviews": 48,
                "total_sessions": 120,
                "expertise": ["Python", "TensorFlow", "Deep Learning", "System Design"],
                "specializations": ["Mock Technical Interviews", "System Design Reviews", "AI Career Roadmap"],
                "bio": "Principal AI Engineer at Google leading large language model deployments. Passionate about mentoring students into top AI research & engineering roles.",
                "education": "M.S. Computer Science, Stanford University",
                "languages_spoken": ["English", "Spanish"],
                "session_duration": 45,
                "linkedin_url": "https://linkedin.com/in/alex-rivera-google",
                "github_url": "https://github.com/arivera-google",
            },
            {
                "email": "priya.sharma@meta.com",
                "first_name": "Priya",
                "last_name": "Sharma",
                "company": "Meta",
                "job_title": "Lead Data Scientist",
                "years_experience": 8,
                "hourly_rate": 130.00,
                "average_rating": 4.90,
                "total_reviews": 35,
                "total_sessions": 85,
                "expertise": ["Data Science", "PyTorch", "NLP", "Big Analytics"],
                "specializations": ["Data Science Coding Interviews", "Resume Strategy", "PyTorch Architecture"],
                "bio": "Lead Data Scientist at Meta working on recommendation algorithms. Expert in guiding students through data science & AI career paths.",
                "education": "M.Tech AI & Data Science, IIT Bombay",
                "languages_spoken": ["English", "Hindi"],
                "session_duration": 45,
                "linkedin_url": "https://linkedin.com/in/priya-sharma-meta",
                "github_url": "https://github.com/psharma-meta",
            },
            {
                "email": "marcus.chen@microsoft.com",
                "first_name": "Marcus",
                "last_name": "Chen",
                "company": "Microsoft",
                "job_title": "Full Stack Architect",
                "years_experience": 12,
                "hourly_rate": 140.00,
                "average_rating": 4.88,
                "total_reviews": 60,
                "total_sessions": 150,
                "expertise": ["React", "Node.js", "Django", "Azure", "Microservices"],
                "specializations": ["Full Stack Code Review", "Portfolio Preparation", "Architectural Best Practices"],
                "bio": "Full Stack Architect with 12+ years design experience in cloud applications. Helping developers excel in React, Node, and Django microservices.",
                "education": "B.S. Computer Engineering, UC Berkeley",
                "languages_spoken": ["English", "Mandarin"],
                "session_duration": 45,
                "linkedin_url": "https://linkedin.com/in/marcus-chen-microsoft",
                "github_url": "https://github.com/mchen-msft",
            },
            {
                "email": "sarah.jenkins@amazon.com",
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "company": "AWS",
                "job_title": "Senior Cloud Strategist",
                "years_experience": 9,
                "hourly_rate": 160.00,
                "average_rating": 5.00,
                "total_reviews": 29,
                "total_sessions": 70,
                "expertise": ["AWS", "DevOps", "Kubernetes", "Cybersecurity"],
                "specializations": ["Cloud Certification Mentorship", "DevOps Pipeline Architecture"],
                "bio": "Senior Cloud Strategist at AWS specializing in Kubernetes & serverless infrastructure. Guiding students in cloud devops careers.",
                "education": "M.S. Cybersecurity, Carnegie Mellon University",
                "languages_spoken": ["English"],
                "session_duration": 60,
                "linkedin_url": "https://linkedin.com/in/sarah-jenkins-aws",
                "github_url": "https://github.com/sjenkins-aws",
            },
        ]

        created_mentor_profiles = []
        for m_info in mentors_data:
            m_user, _ = User.objects.get_or_create(
                email=m_info["email"],
                defaults={
                    "first_name": m_info["first_name"],
                    "last_name": m_info["last_name"],
                    "role": Roles.MENTOR,
                    "is_email_verified": True,
                    "bio": m_info.get("bio", ""),
                }
            )
            m_user.set_password("Mentor@123")
            m_user.save()

            m_profile, _ = MentorProfile.objects.get_or_create(
                user=m_user,
                defaults={
                    "company": m_info["company"],
                    "job_title": m_info["job_title"],
                    "years_experience": m_info["years_experience"],
                    "hourly_rate": m_info["hourly_rate"],
                    "average_rating": m_info["average_rating"],
                    "total_reviews": m_info["total_reviews"],
                    "total_sessions": m_info["total_sessions"],
                    "expertise": m_info["expertise"],
                    "specializations": m_info.get("specializations", []),
                    "bio": m_info.get("bio", ""),
                    "education": m_info.get("education", ""),
                    "languages_spoken": m_info.get("languages_spoken", []),
                    "session_duration": m_info.get("session_duration", 45),
                    "linkedin_url": m_info.get("linkedin_url", ""),
                    "github_url": m_info.get("github_url", ""),
                    "is_approved": True,
                    "is_available": True,
                }
            )
            created_mentor_profiles.append(m_profile)

            # Weekly Availability Slots (Mon - Fri, 10am-11am & 2pm-3pm)
            for day_idx in range(5):
                MentorAvailability.objects.get_or_create(
                    mentor=m_profile,
                    day_of_week=day_idx,
                    start_time=datetime.time(10, 0),
                    end_time=datetime.time(11, 0),
                )
                MentorAvailability.objects.get_or_create(
                    mentor=m_profile,
                    day_of_week=day_idx,
                    start_time=datetime.time(14, 0),
                    end_time=datetime.time(15, 0),
                )

        # Skill Categories & Skills
        skills_data = [
            ("Python", "Programming"),
            ("JavaScript", "Programming"),
            ("TypeScript", "Programming"),
            ("React.js", "Frontend"),
            ("Node.js", "Backend"),
            ("Django", "Backend"),
            ("Machine Learning", "AI & Data"),
            ("Deep Learning", "AI & Data"),
            ("SQL & Relational DBs", "Data"),
            ("Power BI", "Data"),
            ("Excel", "Data"),
            ("AWS Cloud", "DevOps & Cloud"),
            ("Azure", "DevOps & Cloud"),
            ("Docker & Containers", "DevOps & Cloud"),
            ("Kubernetes", "DevOps & Cloud"),
            ("CI/CD Pipelines", "DevOps & Cloud"),
            ("Cybersecurity Essentials", "Security"),
            ("Network Security", "Security"),
            ("Figma & Wireframing", "Design"),
            ("UI/UX Design Systems", "Design"),
        ]

        skill_objs = {}
        for s_name, s_cat in skills_data:
            sk, _ = Skill.objects.get_or_create(name=s_name, defaults={"category": s_cat})
            skill_objs[s_name] = sk

        # Career Categories
        cat_tech, _ = CareerCategory.objects.get_or_create(
            name="Technology & Software",
            defaults={"description": "Full-stack development, software engineering, and AI engineering.", "icon": "code"}
        )
        cat_data, _ = CareerCategory.objects.get_or_create(
            name="Data & Analytics",
            defaults={"description": "Data analysis, business intelligence, SQL, and data visualization.", "icon": "bar-chart"}
        )
        cat_sec, _ = CareerCategory.objects.get_or_create(
            name="Security & Infrastructure",
            defaults={"description": "Protecting systems, cloud security, network defense, and ethical hacking.", "icon": "shield"}
        )
        cat_cloud, _ = CareerCategory.objects.get_or_create(
            name="Cloud & DevOps",
            defaults={"description": "Cloud architecture, containerization, and automated deployment pipelines.", "icon": "cloud"}
        )
        cat_design, _ = CareerCategory.objects.get_or_create(
            name="Design & User Experience",
            defaults={"description": "UI/UX design, prototyping, Figma, and digital product creation.", "icon": "palette"}
        )

        # Clean up all old student progress & career path entries to avoid duplicates
        StageMilestone.all_objects.all().hard_delete()
        CareerRoadmapStage.all_objects.all().hard_delete()
        StudentCareerProgress.all_objects.all().hard_delete()
        FavoriteCareer.all_objects.all().hard_delete()
        CareerPath.all_objects.all().hard_delete()

        def make_path(slug, title, category, description, summary, highlights, duration, difficulty, icon, skills):
            path = CareerPath.objects.create(
                slug=slug,
                title=title,
                category=category,
                description=description,
                overview_summary=summary,
                skill_growth_highlights=highlights,
                estimated_duration=duration,
                difficulty_level=difficulty,
                icon=icon,
                is_featured=True
            )
            path.required_skills.set(skills)
            return path

        # 1. Full-Stack Cloud Architect
        cp_se = make_path(
            "full-stack-cloud-architect",
            "Full-Stack Cloud Architect",
            cat_tech,
            "Architect, build, and scale enterprise web applications, microservices, and distributed cloud systems.",
            "The Full-Stack Cloud Architect track prepares developers to design, structure, and scale complex applications. It covers core programming languages (Python, Java, TypeScript), object-oriented and functional paradigms, system design patterns (SOLID, CQRS, DDD), microservices, API protocols (REST, GraphQL, gRPC), and cloud deployment strategies.",
            [
                "Architect resilient distributed systems using microservices, REST, GraphQL, and message queues.",
                "Master core design principles (SOLID, Design Patterns, Domain-Driven Design).",
                "Optimize data storage using relational SQL databases, NoSQL, and caching strategies.",
                "Lead technical engineering teams, enforce coding standards, and make high-impact architecture choices."
            ],
            "8 Months", "intermediate", "layers",
            [skill_objs["JavaScript"], skill_objs["TypeScript"], skill_objs["React.js"], skill_objs["Node.js"], skill_objs["Django"]]
        )

        # 2. Artificial Intelligence & ML Specialist
        cp_ai = make_path(
            "artificial-intelligence",
            "AI & ML Specialist",
            cat_tech,
            "Master machine learning algorithms, deep neural networks, computer vision, and LLM fine-tuning from scratch.",
            "The AI & ML Specialist path equips developers to build production-grade Artificial Intelligence and LLM applications. From using pre-trained models (Claude, GPT-4, Llama) to constructing Retrieval-Augmented Generation (RAG) systems, vector database similarity search engines, and autonomous AI agents with tool use.",
            [
                "Develop cutting-edge generative AI apps using OpenAI API, Anthropic Claude, and Hugging Face.",
                "Build Retrieval-Augmented Generation (RAG) architectures with Vector DBs (Chroma, Pinecone, FAISS).",
                "Construct autonomous AI Agents utilizing ReAct prompting and OpenAI Function Calling.",
                "Enforce AI safety, ethics, prompt injection protection, and guardrails."
            ],
            "10 Months", "intermediate", "cpu",
            [skill_objs["Python"], skill_objs["Machine Learning"], skill_objs["Deep Learning"]]
        )

        # 3. Data Analytics
        cp_da = make_path(
            "data-analytics",
            "Data Analytics",
            cat_data,
            "Master SQL, Excel, Power BI, Python, and statistical modeling for business intelligence.",
            "Data Analytics focuses on translating complex data into actionable business insights. You will learn data extraction, SQL querying, data cleaning with Pandas, interactive dashboard creation in Power BI, and statistical forecasting.",
            [
                "Write complex SQL analytical queries for multi-table data aggregation.",
                "Build interactive executive dashboards with Power BI and Tableau.",
                "Perform data wrangling and statistical modeling using Python & Pandas.",
                "Drive business decision-making through automated data reporting pipelines."
            ],
            "6 Months", "beginner", "pie-chart",
            [skill_objs["SQL & Relational DBs"], skill_objs["Excel"], skill_objs["Power BI"], skill_objs["Python"]]
        )

        # 4. Cybersecurity
        cp_sec = make_path(
            "cybersecurity",
            "Cybersecurity",
            cat_sec,
            "Protect enterprise networks, cloud infrastructure, and APIs against cyber threats.",
            "Cybersecurity professionals defend enterprise digital assets against attack vectors. This path covers ethical hacking, OWASP Top 10 web security, network protocol defense, encryption algorithms (PKI), and threat monitoring.",
            [
                "Perform penetration testing and vulnerability assessments on web apps.",
                "Implement enterprise authentication, OAuth 2.0, and PKI encryption.",
                "Monitor network traffic and log metrics for threat mitigation.",
                "Enforce zero-trust architecture and compliance standards."
            ],
            "9 Months", "intermediate", "lock",
            [skill_objs["Cybersecurity Essentials"], skill_objs["Network Security"]]
        )

        # 5. Cloud Computing
        cp_cloud = make_path(
            "cloud-computing",
            "Cloud Computing",
            cat_cloud,
            "Architect scalable cloud infrastructures on AWS, Azure, and Google Cloud Platform.",
            "Cloud Computing trains engineers to design high-availability, fault-tolerant infrastructure on major cloud providers (AWS, Azure, GCP). Covers serverless architecture, VPC networking, storage services, and IAM security governance.",
            [
                "Design scalable cloud architectures using AWS Lambda, EC2, S3, and RDS.",
                "Configure virtual private networks, subnets, and load balancers.",
                "Deploy serverless functions and containerized microservices.",
                "Manage enterprise cloud security, IAM policies, and cost optimization."
            ],
            "8 Months", "intermediate", "cloud-lightning",
            [skill_objs["AWS Cloud"], skill_objs["Azure"]]
        )

        # 6. DevOps
        cp_devops = make_path(
            "devops",
            "DevOps",
            cat_cloud,
            "Master Linux, Docker, Kubernetes, CI/CD pipelines, Terraform, and Site Reliability Engineering.",
            "The DevOps Engineering path bridges software development and IT infrastructure operations. DevOps engineers build automated CI/CD pipelines, containerize microservices with Docker and Kubernetes, enforce cloud infrastructure as code (Terraform), and monitor high-availability cluster health.",
            [
                "Master Infrastructure as Code (Terraform, Ansible) to automate multi-cloud deployments.",
                "Implement robust CI/CD pipelines (GitHub Actions, Jenkins) for zero-downtime release cycles.",
                "Architect containerized microservices using Docker & Kubernetes cluster orchestration.",
                "Establish automated monitoring & logging (Prometheus, Grafana, Loki, Datadog)."
            ],
            "9 Months", "advanced", "terminal",
            [skill_objs["Docker & Containers"], skill_objs["Kubernetes"], skill_objs["CI/CD Pipelines"]]
        )

        # 7. UI/UX Design
        cp_ux = make_path(
            "ui-ux-design",
            "UI/UX Design",
            cat_design,
            "Master user psychology, Figma wireframing, design systems, and product prototyping.",
            "The UI/UX Design career path combines user psychology, behavioral design, wireframing, and interactive prototyping to build intuitive digital products that engage and convert users.",
            [
                "Apply behavioral science and BJ Fogg's behavior model to design high-engagement interfaces.",
                "Create comprehensive user personas, wireframes, and interactive prototypes in Figma.",
                "Conduct user research, usability testing, and data-driven A/B optimization.",
                "Design scalable design systems, typography standards, and responsive UI components."
            ],
            "5 Months", "beginner", "layout",
            [skill_objs["Figma & Wireframing"], skill_objs["UI/UX Design Systems"]]
        )

        # Delete any obsolete career path entries outside our standard list
        CareerPath.all_objects.exclude(slug__in=[
            "full-stack-cloud-architect", "artificial-intelligence", "data-analytics",
            "cybersecurity", "cloud-computing", "devops", "ui-ux-design"
        ]).hard_delete()

        # Helper function to upsert stages and milestones cleanly
        def upsert_stage(career_path, order, title, description, duration, milestones):
            stg, _ = CareerRoadmapStage.objects.get_or_create(career_path=career_path, order=order)
            stg.title = title
            stg.description = description
            stg.estimated_duration = duration
            stg.save()

            for m_order, m_title in enumerate(milestones, start=1):
                m_obj, _ = StageMilestone.objects.get_or_create(stage=stg, order=m_order)
                m_obj.title = m_title
                m_obj.save()
            return stg

        # Populate Stages for Full-Stack Cloud Architect
        stage_se1 = upsert_stage(
            cp_se, 1,
            "Frontend Architecture & Modern Web Engineering",
            "Master HTML5/CSS3, TypeScript, React.js, Next.js (SSR/SSG), State Management, and Design Systems.",
            "6 Weeks",
            [
                "Build High-Performance Single Page Application with React, TypeScript & State Management",
                "Implement Server-Side Rendering (SSR) & Dynamic Routing with Next.js"
            ]
        )

        stage_se2 = upsert_stage(
            cp_se, 2,
            "Backend Microservices & Distributed APIs",
            "Develop scalable RESTful and GraphQL APIs using Node.js/Express and Python/Django, PostgreSQL optimization, and Redis caching.",
            "8 Weeks",
            [
                "Architect Scalable REST & GraphQL Microservice APIs",
                "Configure PostgreSQL Database Indexing, Transactions & Redis Caching Layer"
            ]
        )

        stage_se3 = upsert_stage(
            cp_se, 3,
            "Cloud-Native Systems & Message Queues",
            "Deploy containerized applications with Docker & Kubernetes (EKS/GKE), event-driven messaging with Apache Kafka / RabbitMQ, and gRPC.",
            "9 Weeks",
            [
                "Containerize Enterprise Applications with Docker & Orchestrate with Kubernetes",
                "Build Asynchronous Event-Driven Messaging Pipelines with Kafka / RabbitMQ"
            ]
        )

        stage_se4 = upsert_stage(
            cp_se, 4,
            "System Design, Cloud Infrastructure & SRE",
            "Master High-Scale Distributed System Design, SOLID/CQRS/DDD patterns, Terraform infrastructure automation, and SRE Observability.",
            "9 Weeks",
            [
                "Design Fault-Tolerant High-Scale Distributed System Architecture",
                "Automate Multi-Cloud Infrastructure Deployment using Terraform & SRE Monitoring"
            ]
        )

        # Populate Stages for DevOps
        stage_dev1 = upsert_stage(
            cp_devops, 1,
            "Programming, Operating Systems & Terminal",
            "Master Python/Go/Node.js scripting, Linux Administration (Ubuntu/Debian), Bash/PowerShell, and Vim/Nano.",
            "6 Weeks",
            [
                "Linux Kernel & System Administration",
                "Automated Bash & Python Automation Scripts"
            ]
        )

        stage_dev2 = upsert_stage(
            cp_devops, 2,
            "Networking, Web Servers & Containers",
            "Learn OSI Model, DNS, Reverse Proxies (Nginx, Caddy), Load Balancing, and Docker containerization.",
            "8 Weeks",
            [
                "Containerize Microservices with Dockerfile & Compose",
                "Configure Nginx Reverse Proxy & Load Balancer"
            ]
        )

        stage_dev3 = upsert_stage(
            cp_devops, 3,
            "CI/CD Pipelines, IaC & Kubernetes",
            "Implement Infrastructure as Code (Terraform, Ansible), CI/CD (GitHub Actions, Jenkins), and Kubernetes Cluster Orchestration (EKS/GKE).",
            "10 Weeks",
            [
                "Provision Cloud Infrastructure with Terraform",
                "Deploy Production App to Kubernetes Cluster"
            ]
        )

        # Populate Stages for AI & ML Specialist
        stage_ai1 = upsert_stage(
            cp_ai, 1,
            "Foundations of Python & Data Science",
            "Master core Python syntax, NumPy array manipulation, and Pandas dataframes.",
            "4 Weeks",
            [
                "Complete Python Data Structures Modules",
                "Build Data Cleaning & Exploratory Analysis Project"
            ]
        )

        stage_ai2 = upsert_stage(
            cp_ai, 2,
            "Pre-Trained LLM APIs & AI Safety",
            "Integrate OpenAI API, Anthropic Claude, Hugging Face models, prompt engineering, and safety guardrails.",
            "6 Weeks",
            [
                "Build Multi-Model AI Completion Pipeline",
                "Implement Adversarial Prompt Safety Guardrails"
            ]
        )

        stage_ai3 = upsert_stage(
            cp_ai, 3,
            "Embeddings, Vector DBs & RAG",
            "Implement OpenAI Embeddings, Vector Search (Chroma, Pinecone), LangChain RAG pipelines, and AI Agents.",
            "8 Weeks",
            [
                "Construct Enterprise RAG Knowledge Search Engine",
                "Build Autonomous ReAct AI Agent with Tools"
            ]
        )

        # Populate Stages for Cloud Computing
        stage_cloud1 = upsert_stage(
            cp_cloud, 1,
            "Networking, OS & Storage Foundations",
            "Master IP addressing, CIDR subnetting, Linux SysAdmin, SSH, DNS, and Cloud Storage (AWS S3, Azure Blob, EBS).",
            "6 Weeks",
            [
                "Configure Virtual Private Clouds (VPC), Subnets & Security Groups",
                "Set up High-Availability S3 Object Storage & IAM Access Policies"
            ]
        )

        stage_cloud2 = upsert_stage(
            cp_cloud, 2,
            "Cloud Compute, Load Balancing & Managed DBs",
            "Deploy AWS EC2 / Azure VMs, Application Load Balancers (ALB), Auto Scaling Groups, RDS PostgreSQL, and DynamoDB.",
            "8 Weeks",
            [
                "Deploy Auto-Scaling Instance Fleets Behind Load Balancers",
                "Configure Managed Multi-AZ Relational Databases (AWS RDS)"
            ]
        )

        stage_cloud3 = upsert_stage(
            cp_cloud, 3,
            "Serverless Architecture & Containerization",
            "Build event-driven microservices with AWS Lambda, API Gateway, Docker, and Managed Container Clusters (AWS ECS/EKS).",
            "8 Weeks",
            [
                "Build Event-Driven Serverless Microservices with AWS Lambda",
                "Deploy Containerized Apps to Amazon ECS & EKS"
            ]
        )

        stage_cloud4 = upsert_stage(
            cp_cloud, 4,
            "IaC, Security Governance & FinOps",
            "Automate multi-region infrastructure using Terraform & CloudFormation, IAM Security Governance, CloudWatch, and Cost Optimization.",
            "8 Weeks",
            [
                "Automate Cloud Provisioning with Terraform & CloudFormation",
                "Enforce Zero-Trust Security Policies & FinOps Guardrails"
            ]
        )

        # Populate Stages for Cybersecurity
        stage_sec1 = upsert_stage(
            cp_sec, 1,
            "Networking Protocols, Linux & Security Essentials",
            "Master TCP/IP OSI layers, Wireshark packet capture, Linux command line defense, PKI encryption, and SSL/TLS handshakes.",
            "6 Weeks",
            [
                "Analyze Network Traffic & Inspect Packet Headers with Wireshark",
                "Configure PKI Infrastructure, Digital Certificates & Firewalls"
            ]
        )

        stage_sec2 = upsert_stage(
            cp_sec, 2,
            "Web Security, OWASP Top 10 & Ethical Hacking",
            "Audit web apps for SQL Injection, XSS, CSRF, and perform penetration testing using Burp Suite, Nmap, and Metasploit.",
            "8 Weeks",
            [
                "Perform OWASP Vulnerability Audits on Web Applications",
                "Execute Ethical Penetration Tests with Nmap & Metasploit"
            ]
        )

        stage_sec3 = upsert_stage(
            cp_sec, 3,
            "SOC Operations, SIEM Monitoring & Incident Response",
            "Configure Splunk / Elastic SIEM log ingestion, automated intrusion detection (Snort), and incident response digital forensics.",
            "10 Weeks",
            [
                "Configure SIEM Log Aggregation & Threat Detection in Splunk",
                "Conduct Incident Response Handling & Digital Forensics Analysis"
            ]
        )

        stage_sec4 = upsert_stage(
            cp_sec, 4,
            "Cloud Security, Zero Trust & CIS Standards",
            "Implement Identity & Access Management (IAM), OAuth 2.0 / SAML, Zero Trust policies, and CIS security benchmarks.",
            "8 Weeks",
            [
                "Implement Zero-Trust Identity Governance & Multi-Factor Auth",
                "Enforce CIS Compliance & Hardening Across Cloud Assets"
            ]
        )

        # Populate Stages for Data Analytics
        stage_da1 = upsert_stage(
            cp_da, 1,
            "Advanced SQL Querying & Data Modeling",
            "Master SQL SELECT, multi-table JOINs, GROUP BY aggregations, CTEs, Window Functions, and Excel financial pivot models.",
            "5 Weeks",
            [
                "Write Advanced SQL Queries using Window Functions & CTEs",
                "Build Executive Financial & Operational Excel Pivot Models"
            ]
        )

        stage_da2 = upsert_stage(
            cp_da, 2,
            "Python Data Wrangling & Statistical Analysis",
            "Clean, transform, and analyze datasets with Pandas, NumPy, and create visualizations with Matplotlib & Seaborn.",
            "6 Weeks",
            [
                "Wrangle & Clean Raw Unstructured Datasets with Pandas",
                "Conduct Exploratory Data Analysis & Statistical Hypothesis Tests"
            ]
        )

        stage_da3 = upsert_stage(
            cp_da, 3,
            "Business Intelligence & Dashboard Engineering",
            "Design interactive dashboards in Power BI & Tableau, write DAX calculations, and query cloud data warehouses (Snowflake, BigQuery).",
            "7 Weeks",
            [
                "Design Interactive Executive Dashboards in Power BI & Tableau",
                "Query & Architect Data Models in Snowflake and Google BigQuery"
            ]
        )

        stage_da4 = upsert_stage(
            cp_da, 4,
            "Predictive Analytics & Data Storytelling",
            "Build predictive time-series forecasting models with Scikit-Learn, analyze A/B tests, and present executive data stories.",
            "6 Weeks",
            [
                "Train Predictive Sales & Customer Churn Machine Learning Models",
                "Present Data-Driven Strategic Recommendations to Stakeholders"
            ]
        )

        # Populate Stages for UX Design
        stage_ux1 = upsert_stage(
            cp_ux, 1,
            "Human Decision Making & Research",
            "Understand behavioral psychology, user personas, customer journey maps, and wireframing.",
            "4 Weeks",
            [
                "Conduct User Research & Build Personas"
            ]
        )

        stage_ux2 = upsert_stage(
            cp_ux, 2,
            "Figma Wireframing & Prototyping",
            "Create high-fidelity interactive prototypes in Figma, component libraries, and usability testing.",
            "6 Weeks",
            [
                "Design Interactive Figma Prototype"
            ]
        )

        # Enroll demo student in AI Career Path
        StudentCareerProgress.objects.get_or_create(
            student=student_profile,
            career_path=cp_ai,
            defaults={"current_stage": stage_ai1}
        )

        # ----------------------------------------------------------------------
        # 3. COURSES & LEARNING RESOURCES
        # ----------------------------------------------------------------------
        course_cat_dev, _ = CourseCategory.objects.get_or_create(name="Software Development")
        course_cat_ai, _ = CourseCategory.objects.get_or_create(name="Artificial Intelligence")

        course_1, _ = Course.objects.get_or_create(
            slug="full-stack-web-masterclass",
            defaults={
                "title": "Full-Stack Web Development with React & Django",
                "category": course_cat_dev,
                "instructor": created_mentor_profiles[2],  # Marcus Chen
                "description": "Learn to design, build, and deploy enterprise-grade web applications using React, Django REST Framework, PostgreSQL, and Docker.",
                "duration_hours": 45,
                "difficulty_level": "intermediate",
                "learning_objectives": ["Build RESTful APIs with DRF", "Master React Hooks & Context", "Deploy with Docker"],
                "status": "published",
            }
        )
        course_1.career_paths.add(cp_se)

        LearningResource.objects.get_or_create(
            course=course_1,
            order=1,
            defaults={
                "title": "Module 1: Modern Web Application Architecture",
                "resource_type": "video",
                "content_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_text": "Overview of client-server architecture, HTTP methods, and API communication.",
            }
        )
        LearningResource.objects.get_or_create(
            course=course_1,
            order=2,
            defaults={
                "title": "Module 2: Building Scalable REST APIs with Django",
                "resource_type": "video",
                "content_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_text": "Creating Django models, serializers, permissions, and custom views.",
            }
        )
        LearningResource.objects.get_or_create(
            course=course_1,
            order=3,
            defaults={
                "title": "Module 3: React Glassmorphism UI Component System",
                "resource_type": "article",
                "content_text": "Designing dark mode UI with glassmorphism CSS, flexbox, and custom design tokens.",
            }
        )

        course_2, _ = Course.objects.get_or_create(
            slug="applied-machine-learning-pytorch",
            defaults={
                "title": "Applied Machine Learning & Deep Learning with PyTorch",
                "category": course_cat_ai,
                "instructor": created_mentor_profiles[0],  # Alex Rivera
                "description": "Hands-on guide to training, evaluating, and deploying neural networks for computer vision and natural language processing.",
                "duration_hours": 60,
                "difficulty_level": "advanced",
                "learning_objectives": ["PyTorch Tensors & Autograd", "Convolutional Neural Networks", "Transformer Architectures"],
                "status": "published",
            }
        )
        course_2.career_paths.add(cp_ai)

        LearningResource.objects.get_or_create(
            course=course_2,
            order=1,
            defaults={
                "title": "Module 1: Tensors, Gradients & Autograd Mechanics",
                "resource_type": "video",
                "content_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_text": "Understanding PyTorch computational graphs and backpropagation.",
            }
        )
        LearningResource.objects.get_or_create(
            course=course_2,
            order=2,
            defaults={
                "title": "Module 2: Building CNNs for Image Recognition",
                "resource_type": "video",
                "content_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_text": "Convolutional layers, pooling, dropout, and batch normalization.",
            }
        )

        # Enroll demo student in course 1
        Enrollment.objects.get_or_create(
            student=student_profile,
            course=course_1,
            defaults={"progress_percentage": 50.00}
        )

        # ----------------------------------------------------------------------
        # 4. SKILL ASSESSMENTS
        # ----------------------------------------------------------------------
        mentor_user_alex = created_mentor_profiles[0].user

        assessment_python, _ = Assessment.objects.get_or_create(
            title="Python & Data Structures Mastery Assessment",
            defaults={
                "skill": skill_objs["Python"],
                "created_by": mentor_user_alex,
                "description": "Test your mastery of Python data structures, algorithms, object-oriented principles, and memory optimization.",
                "difficulty_level": "intermediate",
                "time_limit_minutes": 15,
                "passing_score": 70,
                "total_questions": 3,
                "assignment_type": "all",
            }
        )

        q1, _ = Question.objects.get_or_create(
            assessment=assessment_python,
            order=1,
            defaults={
                "text": "What is the time complexity of looking up a key in a Python dictionary (hash map) on average?",
                "question_type": "mcq",
                "points": 1,
                "explanation": "Python dictionaries use hash tables, offering average O(1) time complexity for lookup operations.",
            }
        )
        Option.objects.get_or_create(question=q1, order=1, defaults={"text": "O(1)", "is_correct": True})
        Option.objects.get_or_create(question=q1, order=2, defaults={"text": "O(n)", "is_correct": False})
        Option.objects.get_or_create(question=q1, order=3, defaults={"text": "O(log n)", "is_correct": False})
        Option.objects.get_or_create(question=q1, order=4, defaults={"text": "O(n^2)", "is_correct": False})

        q2, _ = Question.objects.get_or_create(
            assessment=assessment_python,
            order=2,
            defaults={
                "text": "Which built-in Python decorator is used to define a method that belongs to the class rather than an instance?",
                "question_type": "mcq",
                "points": 1,
                "explanation": "@classmethod receives the class 'cls' as implicit first argument.",
            }
        )
        Option.objects.get_or_create(question=q2, order=1, defaults={"text": "@classmethod", "is_correct": True})
        Option.objects.get_or_create(question=q2, order=2, defaults={"text": "@staticmethod", "is_correct": False})
        Option.objects.get_or_create(question=q2, order=3, defaults={"text": "@property", "is_correct": False})
        Option.objects.get_or_create(question=q2, order=4, defaults={"text": "@override", "is_correct": False})

        q3, _ = Question.objects.get_or_create(
            assessment=assessment_python,
            order=3,
            defaults={
                "text": "What does GIL stand for in CPython implementation?",
                "question_type": "mcq",
                "points": 1,
                "explanation": "Global Interpreter Lock (GIL) synchronizes execution of threads in CPython.",
            }
        )
        Option.objects.get_or_create(question=q3, order=1, defaults={"text": "Global Interpreter Lock", "is_correct": True})
        Option.objects.get_or_create(question=q3, order=2, defaults={"text": "General Interface Logic", "is_correct": False})
        Option.objects.get_or_create(question=q3, order=3, defaults={"text": "Garbage Isolation Level", "is_correct": False})
        Option.objects.get_or_create(question=q3, order=4, defaults={"text": "Grand Instance Loader", "is_correct": False})

        # Coding Test Assessment
        assessment_coding, _ = Assessment.objects.get_or_create(
            title="Python Live Coding Challenge & Algorithm Test",
            defaults={
                "skill": skill_objs["Python"],
                "created_by": mentor_user_alex,
                "description": "Practical hands-on coding test evaluating standard I/O processing, string operations, and algorithmic logic.",
                "instructions": "Write Python code that processes input test cases from stdin and outputs expected results.",
                "difficulty_level": "intermediate",
                "time_limit_minutes": 30,
                "passing_score": 75,
                "total_questions": 2,
                "assignment_type": "individual",
            }
        )

        q_code_1, _ = Question.objects.get_or_create(
            assessment=assessment_coding,
            order=1,
            defaults={
                "text": "Write a Python script that reads two space-separated integers from stdin and prints their sum.",
                "question_type": "coding",
                "points": 5,
                "explanation": "Read stdin using sys.stdin.read().split() and calculate int(a) + int(b).",
                "starter_code": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        num1, num2 = int(data[0]), int(data[1])\n        print(num1 + num2)\n\nif __name__ == '__main__':\n    main()",
                "programming_language": "python",
                "test_cases": [
                    {"input": "5 10\n", "expected_output": "15", "is_hidden": False},
                    {"input": "-3 8\n", "expected_output": "5", "is_hidden": False},
                    {"input": "100 250\n", "expected_output": "350", "is_hidden": True},
                ]
            }
        )

        q_code_2, _ = Question.objects.get_or_create(
            assessment=assessment_coding,
            order=2,
            defaults={
                "text": "Select all valid Python immutable data structures.",
                "question_type": "multi_select",
                "points": 2,
                "explanation": "Tuples and Strings are immutable in Python, whereas Lists and Dictionaries are mutable.",
            }
        )
        Option.objects.get_or_create(question=q_code_2, order=1, defaults={"text": "Tuple", "is_correct": True})
        Option.objects.get_or_create(question=q_code_2, order=2, defaults={"text": "String", "is_correct": True})
        Option.objects.get_or_create(question=q_code_2, order=3, defaults={"text": "List", "is_correct": False})
        Option.objects.get_or_create(question=q_code_2, order=4, defaults={"text": "Dictionary", "is_correct": False})

        # Create targeted assignment for student
        from apps.assessments.models import AssessmentAssignment
        AssessmentAssignment.objects.get_or_create(
            assessment=assessment_coding,
            student=student_profile,
            defaults={
                "assigned_by": mentor_user_alex,
                "target_type": "individual",
                "due_date": timezone.now() + datetime.timedelta(days=7),
            }
        )

        AssessmentAssignment.objects.get_or_create(
            assessment=assessment_python,
            target_type="all",
            defaults={
                "assigned_by": mentor_user_alex,
                "due_date": timezone.now() + datetime.timedelta(days=14),
            }
        )


        # ----------------------------------------------------------------------
        # 5. COMPANIES, JOBS & INTERNSHIPS
        # ----------------------------------------------------------------------
        comp_google, _ = Company.objects.get_or_create(
            name="Google",
            defaults={"industry": "Technology / AI", "location": "Mountain View, CA", "website": "https://google.com", "size": "100,000+"}
        )
        comp_meta, _ = Company.objects.get_or_create(
            name="Meta Platforms",
            defaults={"industry": "Social Tech / AI", "location": "Menlo Park, CA", "website": "https://meta.com", "size": "50,000+"}
        )
        comp_openai, _ = Company.objects.get_or_create(
            name="OpenAI",
            defaults={"industry": "Artificial Intelligence", "location": "San Francisco, CA", "website": "https://openai.com", "size": "1,000+"}
        )

        job_ai, _ = Job.objects.get_or_create(
            company=comp_openai,
            title="Senior AI Research Engineer (LLM & Fine-Tuning)",
            defaults={
                "description": "Join the core alignment & fine-tuning team working on frontier language models. Responsibilities include scaling distributed training jobs and developing novel RLHF algorithms.",
                "location": "San Francisco, CA / Hybrid",
                "job_type": "full_time",
                "experience_level": "Senior (5+ Yrs)",
                "salary_range": "$220,000 - $310,000 / year",
                "deadline": datetime.date.today() + datetime.timedelta(days=45),
            }
        )
        job_ai.skills_required.add(skill_objs["Python"], skill_objs["Deep Learning"])

        job_fs, _ = Job.objects.get_or_create(
            company=comp_google,
            title="Full-Stack Software Engineer (Cloud Infrastructure)",
            defaults={
                "description": "Architect responsive user interfaces and robust microservices for Google Cloud Console components using React, TypeScript, and Go.",
                "location": "Mountain View, CA",
                "job_type": "full_time",
                "experience_level": "Mid Level (3+ Yrs)",
                "salary_range": "$175,000 - $240,000 / year",
                "deadline": datetime.date.today() + datetime.timedelta(days=30),
            }
        )
        job_fs.skills_required.add(skill_objs["JavaScript"], skill_objs["React.js"], skill_objs["AWS Cloud"])

        intern_meta, _ = Internship.objects.get_or_create(
            company=comp_meta,
            title="Machine Learning & Generative AI Summer Intern 2026",
            defaults={
                "description": "12-week immersive summer internship contributing to PyTorch core development and multimodal computer vision research.",
                "location": "Menlo Park, CA (Relocation Provided)",
                "duration": "12 Weeks",
                "stipend": "$9,500 / month",
                "is_remote": False,
                "deadline": datetime.date.today() + datetime.timedelta(days=60),
            }
        )
        intern_meta.skills_required.add(skill_objs["Python"], skill_objs["Machine Learning"])

        # Sample application
        Application.objects.get_or_create(
            student=student_profile,
            job=job_fs,
            defaults={
                "opportunity_type": "job",
                "cover_letter": "I am passionate about full-stack engineering and cloud architecture with hands-on React & Django experience.",
                "status": "reviewing",
            }
        )

        # ----------------------------------------------------------------------
        # 6. CERTIFICATES & NOTIFICATIONS
        # ----------------------------------------------------------------------
        if not Certificate.objects.filter(student=student_profile, certificate_type="career").exists():
            Certificate.objects.create(
                student=student_profile,
                certificate_type="career",
                title="Certified Artificial Intelligence Specialist",
                description="Demonstrated expertise in Machine Learning, Neural Networks, and AI Pipeline Deployment.",
            )

        if not Certificate.objects.filter(student=student_profile, certificate_type="course").exists():
            Certificate.objects.create(
                student=student_profile,
                certificate_type="course",
                title="Full-Stack Web Development Masterclass",
                description="Successfully completed 45 hours of React, Django REST Framework, and Cloud deployment coursework.",
            )



        Notification.objects.get_or_create(
            user=demo_student,
            title="Welcome to KVS Skill Nexus!",
            defaults={
                "message": "Your AI-powered career roadmap has been initialized. Explore courses, schedule mentor sessions, and start building skills!",
                "notification_type": "system",
                "is_read": False,
            }
        )

        Notification.objects.get_or_create(
            user=demo_student,
            title="Application Status Updated",
            defaults={
                "message": "Your application for 'Full-Stack Software Engineer' at Google is now Under Review.",
                "notification_type": "job_application",
                "is_read": True,
            }
        )

        # Log Learning History
        LearningHistory.objects.get_or_create(
            student=student_profile,
            title="Enrolled in Full-Stack Web Development",
            defaults={
                "event_type": "course_enrolled",
                "description": "Started learning React and Django REST Framework.",
            }
        )

        self.stdout.write(self.style.SUCCESS("Database successfully populated with realistic initial data!"))
        self.stdout.write(self.style.NOTICE("Demo Credentials:"))
        self.stdout.write(self.style.NOTICE("  Admin:   email='admin@kvs.com', password='Admin@123'"))
        self.stdout.write(self.style.NOTICE("  Student: email='student@kvs.com', password='Student@123'"))
        self.stdout.write(self.style.NOTICE("  Mentors: email='alex.rivera@google.com', password='Mentor@123'"))
