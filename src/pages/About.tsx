import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const developers = [
    {
      name: "Saish",
      role: "Full Stack Developer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saish",
      github: "https://github.com/saish",
      linkedin: "https://linkedin.com/in/saish",
      email: "saish@example.com",
      bio: "Passionate about building scalable web applications and creating seamless user experiences."
    },
    {
      name: "Madhav",
      role: "Full Stack Developer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madhav",
      github: "https://github.com/madhav",
      linkedin: "https://linkedin.com/in/madhav",
      email: "madhav@example.com",
      bio: "Enthusiastic developer focused on innovative solutions and modern web technologies."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-gradient-pink mb-4">
              About Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the developers behind Pixematch - a platform designed to connect people and create meaningful relationships.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {developers.map((dev, index) => (
              <motion.div
                key={dev.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card-surface rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-pink-deep p-1 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={dev.image}
                        alt={dev.name}
                        className="w-full h-full rounded-full object-cover bg-background"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">👨‍💻</span>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                    {dev.name}
                  </h3>
                  <p className="text-primary font-medium mb-4">{dev.role}</p>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {dev.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.open(dev.github, '_blank')}
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.open(dev.linkedin, '_blank')}
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => window.location.href = `mailto:${dev.email}`}
                  >
                    <Mail className="w-4 h-4" />
                    {dev.email}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="card-surface rounded-2xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                About Pixematch
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Pixematch is a modern video chat and matching platform built with cutting-edge technologies. 
                Our mission is to help people connect authentically through real-time video conversations. 
                Built with React, TypeScript, Node.js, and WebRTC, we're committed to providing a seamless 
                and secure experience for all our users.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">🚀</div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">Fast & Secure</h3>
                  <p className="text-sm text-muted-foreground">Built with modern tech stack</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">💬</div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">Real-time Chat</h3>
                  <p className="text-sm text-muted-foreground">Instant video connections</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">🌍</div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">Global Reach</h3>
                  <p className="text-sm text-muted-foreground">Connect worldwide</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
