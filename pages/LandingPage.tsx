
import React from 'react';
import { 
  ShieldAlert, Target, Users, BookOpen, BrainCircuit, LayoutGrid, ArrowRight, Zap, 
  BarChart3, Users2, TrendingUp, Send, Award, Lightbulb, Rocket, ShieldCheck, 
  Database, Activity, Sparkles, CheckCircle, Package, Cog, Server, FileText, ClipboardEdit, Home, ListChecks, Palette, LogIn
} from 'lucide-react';
import { APP_NAME } from '../constants';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

interface SlideProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  id?: string;
}

const Slide: React.FC<SlideProps> = ({ children, className = '', bgClassName = 'bg-light-bg', id }) => (
  <section 
    id={id} 
    className={`min-h-screen w-full flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden presentation-slide ${bgClassName} ${className}`}
  >
    <div className="container mx-auto relative z-10 max-w-5xl text-center">
      {children}
    </div>
  </section>
);

const FeatureCard: React.FC<{icon: React.ElementType, title: string, description: string, delay: number}> = ({icon: Icon, title, description, delay}) => (
    <div className={`slide-content-new delayed-${delay} bg-input-bg p-8 rounded-xl shadow-landing-card border border-border-color text-left hover:border-primary/60 hover:shadow-landing-card-hover transition-all duration-300 transform hover:-translate-y-1`}>
        <Icon className="text-primary mb-4" size={40} strokeWidth={1.5}/>
        <h3 className="text-xl font-semibold text-dark-text mb-2">{title}</h3>
        <p className="text-md text-dark-text/80 leading-relaxed">{description}</p>
    </div>
);

const BenefitPill: React.FC<{icon: React.ElementType, text: string, delay: number}> = ({icon: Icon, text, delay}) => (
    <div className={`slide-content-new delayed-${delay} flex items-center bg-sidebar-bg p-4 rounded-lg shadow-sm border border-border-color hover:border-success/50 transition-colors`}>
        <Icon className="text-success mr-3 flex-shrink-0" size={24} strokeWidth={2}/>
        <span className="text-md font-medium text-dark-text">{text}</span>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const contentBaseClass = "slide-content-new"; 

  const scrollSmoothTo = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-dark-text font-sans antialiased scroll-smooth snap-y snap-mandatory overflow-y-scroll h-screen">
      
      {/* Slide 1: Hero - Welcome & Core Promise */}
      <Slide id="hero" bgClassName="bg-light-bg dynamic-hero-bg">
        <BrainCircuit size={60} className={`${contentBaseClass} text-primary mb-6 mx-auto`} strokeWidth={1.5} />
        <h1 className={`${contentBaseClass} text-5xl md:text-6xl font-bold mb-5 leading-tight text-dark-text`}>
          Unlock Operational Excellence with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">{APP_NAME}.</span>
        </h1>
        <p className={`${contentBaseClass} delayed-1 text-lg md:text-xl text-dark-text/90 mb-8 max-w-3xl mx-auto`}>
          Your intelligent command center for streamlined Solvo operations, audit readiness, and empowered teams.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollSmoothTo('challenge')}
            className={`${contentBaseClass} delayed-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-8 rounded-lg text-lg shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 group flex items-center justify-center`}
            aria-label="Discover how SolvoIQ can help"
          >
            Discover {APP_NAME} <ArrowRight className="ml-2.5 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
           <button
            onClick={onEnterDashboard}
            className={`${contentBaseClass} delayed-3 bg-transparent hover:bg-primary-light text-primary font-semibold py-3 px-7 rounded-lg text-lg border-2 border-primary hover:border-primary-dark transition-all duration-300 transform hover:scale-105 group flex items-center justify-center shadow-md hover:shadow-primary/20`}
            aria-label="Enter SolvoIQ Dashboard directly"
          >
            Enter Dashboard <LogIn className="ml-2.5 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </Slide>

      {/* Slide 2: The Challenge - "Feeling Overwhelmed?" */}
      <Slide id="challenge" bgClassName="bg-sidebar-bg">
         <h2 className={`${contentBaseClass} text-4xl md:text-5xl font-bold mb-6 text-dark-text`}>Feeling <span className="text-warning">Overwhelmed by Daily Operations?</span></h2>
         <p className={`${contentBaseClass} delayed-1 text-lg text-dark-text/90 mb-12 max-w-2xl mx-auto`}>If these sound familiar, {APP_NAME} is here to help:</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {icon: Users, title:"Juggling Multiple Client Needs?", desc:"Struggling to keep track of diverse client requirements, communication logs, and overall satisfaction?"},
            {icon: ListChecks, title:"Scattered Team Tasks & Performance Data?", desc:"Finding it hard to manage team assignments, monitor progress, and assess performance effectively?"},
            {icon: ShieldAlert, title:"Audit & Compliance Worries?", desc:"Concerned about maintaining audit-ready documentation and ensuring adherence to SOPs and compliance standards?"},
            {icon: Database, title:"Information Silos & Inefficiencies?", desc:"Wasting time searching for information across different platforms or dealing with inconsistent data?"}
          ].map((item, idx) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.desc} delay={idx+1} />
          ))}
        </div>
      </Slide>

      {/* Slide 3: The Solution - "Introducing SolvoIQ: Your Partner in Success" */}
      <Slide id="solution" bgClassName="bg-input-bg">
        <Palette size={56} className={`${contentBaseClass} text-primary mb-6 mx-auto`} strokeWidth={1.5} />
        <h2 className={`${contentBaseClass} text-4xl md:text-5xl font-bold mb-8 text-dark-text`}>
          Introducing {APP_NAME}: Your <span className="text-primary">Unified Operations Hub</span>.
        </h2>
        <p className={`${contentBaseClass} delayed-1 text-lg md:text-xl text-dark-text/90 mb-12 max-w-3xl mx-auto`}>
            {APP_NAME} is a comprehensive platform designed specifically for Solvo supervisors and staff. It brings together all critical aspects of your daily work into one intuitive, intelligent, and easy-to-use system.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: LayoutGrid, title: "Centralized Control", desc: "One place for clients, team tasks, KPIs, documentation, and AI-powered tools. No more scattered information." },
            { icon: BrainCircuit, title: "AI-Powered Assistance", desc: "Leverage smart features to automate summaries, enhance communications, and gain quick insights." },
            { icon: ShieldCheck, title: "Audit Confidence", desc: "Easily track compliance, manage SOPs, and access audit-related data, ensuring you're always prepared." }
          ].map((item, idx) => (
             <div key={item.title} className={`${contentBaseClass} delayed-${idx+1} bg-sidebar-bg p-8 rounded-xl shadow-landing-card border border-border-color transition-all duration-300 hover:shadow-landing-card-hover hover:border-primary/50 transform hover:-translate-y-1.5`}>
              <item.icon className="text-primary mb-5 mx-auto" size={48} strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-dark-text mb-3">{item.title}</h3>
              <p className="text-md text-dark-text/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Slide>
      
      {/* Slide 4: What SolvoIQ Can Do For YOU (Key Features & Benefits - Part 1) */}
       <Slide id="features1" bgClassName="bg-light-bg">
        <h2 className={`${contentBaseClass} text-4xl md:text-5xl font-bold mb-12 text-dark-text`}>How {APP_NAME} <span className="text-success">Empowers Your Daily Work</span>.</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {[
            { icon: Users2, title: "Master Client Management", desc: `Gain a complete view of each client: status, contact info, key documents (SOPs, KPI reports), communication logs (Pulse & Email), and assigned team members. Proactively manage client health and ensure all audit requirements are met.` },
            { icon: Target, title: "Drive Team Performance", desc: `Oversee your team effectively. Manage member profiles, track assigned KPIs, conduct 1-on-1s, monitor ActivTrack and Home Office compliance, and log PTL reports & Coaching Feed Forward sessions to foster growth and manage risk.` },
            { icon: ListChecks, title: "Organize & Conquer Tasks", desc: `Centralize all team and client-related tasks. Assign responsibilities, set due dates, track progress through list or Kanban views, and ensure nothing falls through the cracks.` },
            { icon: BookOpen, title: "Centralize Knowledge & Templates", desc: `Access a shared knowledge base for important information and procedures. Create and use standardized templates for emails, reports, and more to ensure consistency and save time.` }
          ].map((item, idx) => (
             <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.desc} delay={idx+1} />
          ))}
        </div>
      </Slide>

      {/* Slide 5: The AI Edge - "Work Smarter, Not Harder" */}
      <Slide id="ai-edge" bgClassName="bg-sidebar-bg relative">
        <div className="relative z-10">
            <Sparkles size={56} className={`${contentBaseClass} text-primary mb-6 mx-auto animate-pulse`} strokeWidth={1.5}/>
            <h2 className={`${contentBaseClass} delayed-1 text-4xl md:text-5xl font-bold mb-6 text-dark-text`}>
            Work <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Smarter</span> with AI Assistance.
            </h2>
            <p className={`${contentBaseClass} delayed-2 text-lg md:text-xl text-dark-text/90 mb-10 max-w-3xl mx-auto`}>
            {APP_NAME} integrates AI to simplify your tasks and provide valuable insights, without needing technical expertise.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
            {[  
                {icon: FileText, title: "Quick Email Summaries", desc: "Instantly get the gist of long emails with AI-generated briefings."},
                {icon: Send, title: "Enhanced Communications", desc: "Improve your emails for clarity, tone, and impact with AI suggestions."}, 
                {icon: ClipboardEdit, title: "Coaching & PTL Support", desc: "Receive AI-suggested findings, root causes, and actions for PTL reports and coaching sessions."},
                ].map((item, idx) => (
                <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.desc} delay={idx+2} />
            ))}
            </div>
        </div>
      </Slide>

      {/* Slide 6: Why SolvoIQ? The Benefits Summarized */}
      <Slide id="benefits" bgClassName="bg-input-bg">
        <Award size={56} className={`${contentBaseClass} text-primary mb-6 mx-auto`} strokeWidth={1.5}/>
        <h2 className={`${contentBaseClass} text-4xl md:text-5xl font-bold mb-12 text-dark-text`}>
          The {APP_NAME} Difference: <span className="text-primary">Making Your Job Easier.</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <BenefitPill icon={CheckCircle} text="Save Time & Reduce Daily Stress" delay={1}/>
          <BenefitPill icon={CheckCircle} text="Improve Team Coordination & Accountability" delay={2}/>
          <BenefitPill icon={CheckCircle} text="Enhance Client Service & Satisfaction" delay={3}/>
          <BenefitPill icon={CheckCircle} text="Ensure Audit Readiness & Compliance Peace of Mind" delay={4}/>
          <BenefitPill icon={CheckCircle} text="Make Informed, Data-Driven Decisions Quickly" delay={5}/>
          <BenefitPill icon={CheckCircle} text="Boost Overall Operational Efficiency" delay={6}/>
        </div>
      </Slide>
      
      {/* Slide 7: Final Call to Action - Step Into the Future */}
      <Slide id="cta" bgClassName="bg-light-bg dynamic-hero-bg">
        <Rocket size={56} className={`${contentBaseClass} text-primary mb-6 mx-auto`} strokeWidth={1.5} />
        <h2 className={`${contentBaseClass} delayed-1 text-4xl md:text-5xl font-bold mb-6 text-dark-text`}>
          Ready to Elevate Your Operations?
        </h2>
        <p className={`${contentBaseClass} delayed-2 text-lg md:text-xl text-dark-text/90 mb-10 max-w-2xl mx-auto`}>
          Step into a more organized, intelligent, and efficient way of working. {APP_NAME} is designed for you.
        </p>
        <button
          onClick={onEnterDashboard}
          className={`${contentBaseClass} delayed-3 bg-gradient-to-r from-primary to-blue-400 hover:from-primary-dark hover:to-blue-500 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group flex items-center justify-center mx-auto animate-ctaPulseStrong`}
          aria-label="Launch SolvoIQ Dashboard"
        >
          Launch {APP_NAME} <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={24} />
        </button>
        <p className={`${contentBaseClass} delayed-4 text-xs text-medium-text mt-20`}>
          &copy; {new Date().getFullYear()} {APP_NAME}. Empowering Solvo Excellence. Version 1.6.0_local_storage
        </p>
      </Slide>
    </div>
  );
};

export default LandingPage;
