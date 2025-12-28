import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">RoomFinder</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Find your perfect room with ease. We connect you with the best rental properties across major cities.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Rooms', 'About Us', 'Contact', 'FAQ'].map(link => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Room Types</h4>
            <ul className="space-y-2">
              {['Studio', '1BHK', '2BHK', 'PG Accommodation', 'Hostel', 'Flat'].map(type => (
                <li key={type}>
                  <Link
                    to="/rooms"
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Business Park, Koramangala, Bangalore - 560034</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+91 756481 7434</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>akashw6666@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {new Date().getFullYear()} RoomFinder. All rights reserved.</p>
            <div className="flex items-center gap-2 text-background/70">
              <span>Designed & Developed with</span>
              <Heart className="w-4 h-4 text-accent fill-accent" />
              <span>by</span>
              <a
                href="https://github.com/akashray398"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-background hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                Akash Yadav
              </a>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
