import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaTasks, FaLightbulb, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="glass-card text-center py-16 px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Task Management <span className="text-primary-600 dark:text-primary-400">Simplified</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Streamline your workflow with our intelligent task management system. Create tasks manually or extract them automatically from meeting transcripts.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/dashboard">
            <Button variant="primary" size="lg" icon={<FaChartLine />}>
              View Dashboard
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="secondary" size="lg" icon={<FaTasks />}>
              Manage Tasks
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="flex justify-center mb-4">
              <FaLightbulb className="text-4xl text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Intelligent Task Creation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create tasks manually or let our AI extract them from meeting transcripts automatically.
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="flex justify-center mb-4">
              <FaChartLine className="text-4xl text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Insightful Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get a comprehensive view of your tasks with charts, statistics, and a calendar view.
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="flex justify-center mb-4">
              <FaCalendarAlt className="text-4xl text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Task Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize tasks with priorities, due dates, and status tracking for better productivity.
            </p>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Alex Johnson', role: 'Frontend Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { name: 'Sarah Williams', role: 'Backend Developer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { name: 'Michael Chen', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
            { name: 'Emily Rodriguez', role: 'Project Manager', avatar: 'https://randomuser.me/api/portraits/women/28.jpg' },
          ].map((member, index) => (
            <Card key={index} className="text-center">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 dark:border-black/30"
              />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
              <div className="flex justify-center mt-4 space-x-3">
                <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  <FaUsers className="h-5 w-5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "This task manager has transformed how our team handles meeting follow-ups. The transcript feature is a game-changer!",
              author: "David Kim",
              role: "Product Manager at TechCorp"
            },
            {
              quote: "The dashboard gives me a clear overview of all tasks. I love the clean interface and the dark mode is easy on the eyes.",
              author: "Lisa Chen",
              role: "Team Lead at InnovateCo"
            },
            {
              quote: "I've tried many task managers, but this one stands out with its beautiful UI and smart features. Highly recommended!",
              author: "Mark Johnson",
              role: "Freelance Developer"
            }
          ].map((testimonial, index) => (
            <Card key={index} className="flex flex-col">
              <div className="flex-grow">
                <p className="italic text-gray-600 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card text-center py-12 px-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Start managing your tasks more efficiently today with our powerful task management system.
        </p>
        <Link to="/tasks">
          <Button variant="primary" size="lg">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
