import { Link } from 'react-router-dom';
import { FileText, Shield, Cloud, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Cloud Synced',
    description: 'Your notes are automatically synced across all your devices in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Enterprise-grade encryption keeps your notes safe and private.',
  },
  {
    icon: Sparkles,
    title: 'AI Powered',
    description: 'Smart suggestions and organization powered by machine learning.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CloudNotes</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AWS Cloud</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your Personal{' '}
            <span className="gradient-text">Cloud Notes</span>{' '}
            App
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Store, edit, and organize your notes securely on AWS. Access your thoughts from anywhere, anytime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/login" className="btn-hero group">
              Start Writing Notes
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 text-lg font-medium text-foreground border-2 border-border rounded-xl hover:border-primary hover:text-primary transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* App Preview */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card p-2 md:p-4">
            <div className="bg-sidebar-bg rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-hover">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-accent/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex h-64 md:h-80">
                {/* Sidebar preview */}
                <div className="w-16 md:w-48 border-r border-sidebar-hover p-3">
                  <div className="h-8 bg-sidebar-hover rounded-lg mb-3" />
                  <div className="h-6 bg-sidebar-hover/50 rounded mb-2 w-3/4" />
                  <div className="h-6 bg-sidebar-hover/50 rounded mb-2 w-1/2" />
                  <div className="h-6 bg-primary/30 rounded w-full" />
                </div>
                {/* Notes list preview */}
                <div className="w-24 md:w-64 border-r border-sidebar-hover p-3">
                  <div className="h-8 bg-sidebar-hover rounded-lg mb-3" />
                  <div className="h-16 bg-primary/20 rounded-lg mb-2" />
                  <div className="h-16 bg-sidebar-hover/50 rounded-lg mb-2" />
                  <div className="h-16 bg-sidebar-hover/50 rounded-lg" />
                </div>
                {/* Editor preview */}
                <div className="flex-1 p-3">
                  <div className="h-8 bg-sidebar-hover rounded mb-3 w-1/2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-sidebar-hover/50 rounded w-full" />
                    <div className="h-4 bg-sidebar-hover/50 rounded w-5/6" />
                    <div className="h-4 bg-sidebar-hover/50 rounded w-4/5" />
                    <div className="h-4 bg-sidebar-hover/50 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              CloudNotes combines powerful features with beautiful design to help you capture and organize your ideas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who trust CloudNotes for their daily note-taking needs.
          </p>
          <Link to="/signup" className="btn-hero inline-flex">
            Create Your Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">CloudNotes</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CloudNotes. Built with AWS.
          </p>
        </div>
      </footer>
    </div>
  );
}
