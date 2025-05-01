import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-4 font-inter">Habitify</h5>
            <p className="text-gray-300 text-sm">Track your habits, improve your health, and reach your goals with our comprehensive wellness platform.</p>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Features</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/habits"><a className="hover:text-white">Habit Tracking</a></Link></li>
              <li><Link href="/analytics"><a className="hover:text-white">Health Analytics</a></Link></li>
              <li><Link href="/dashboard"><a className="hover:text-white">Goal Setting</a></Link></li>
              <li><Link href="/analytics"><a className="hover:text-white">Progress Reports</a></Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Resources</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Guides</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
              <li><a href="#" className="hover:text-white">API</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Company</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Habitify. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
