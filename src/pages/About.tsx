import { motion } from 'framer-motion';
import { Building2, Users, Award, Target, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every decision we make is guided by what is best for our tenants and property owners.',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We verify every listing and maintain complete transparency in all our dealings.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in service, constantly improving our platform and processes.',
  },
];

const team = [
  { name: 'Amit Kumar', role: 'Founder & CEO', initial: 'A' },
  { name: 'Sneha Patel', role: 'Head of Operations', initial: 'S' },
  { name: 'Raj Malhotra', role: 'Tech Lead', initial: 'R' },
  { name: 'Priya Singh', role: 'Customer Success', initial: 'P' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Making Room Finding Simple & Trustworthy
            </h1>
            <p className="text-lg text-primary-foreground/80">
              We're on a mission to connect people with their perfect living spaces while ensuring 
              safety, transparency, and convenience at every step.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Started from a Simple Problem
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                RoomFinder was born out of frustration. Our founders, having experienced the challenges 
                of finding rental accommodation firsthand, knew there had to be a better way.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                In 2020, we launched with a simple goal: create a platform where finding a room is as 
                easy as booking a hotel. We started in Bangalore with just 50 verified listings.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we've helped over 10,000 people find their homes across 50+ cities in India. 
                But we're just getting started. Our vision is to become the most trusted platform 
                for rental accommodation in the country.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '10K+', label: 'Happy Tenants' },
                { value: '5K+', label: 'Properties' },
                { value: '50+', label: 'Cities' },
                { value: '99%', label: 'Satisfaction Rate' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <value.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">
              The passionate people behind RoomFinder.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">{member.initial}</span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Join Us?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Whether you're looking for a room or want to list your property, we're here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/rooms">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                  Find a Room
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="hero-outline" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
