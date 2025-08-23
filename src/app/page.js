"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Brain, 
  Heart, 
  Activity, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle,
  Stethoscope,
  AlertTriangle,
  UserPlus
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediVoice AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors"></Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-green-500 transition-colors">
              </Link>
              <Link href="#organ-matching" className="text-gray-600 hover:text-blue-600 transition-colors"></Link>
              <Link href="#organ-matching" className="text-muted-foreground hover:text-green-500 transition-colors">
                Organ Matching
              </Link>
              <Link href="#safety" className="text-muted-foreground hover:text-green-500 transition-colors">
                Safety
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" className="text-muted-foreground hover:text-green-500">
                Sign In
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                  AI-Powered Medical Diagnosis
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Your Voice, Our
                  <span className="text-green-500"> AI Diagnosis</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Experience the future of healthcare with our AI-powered voice diagnosis system. 
                  Get instant medical assessments, connect with doctors when needed, and access 
                  life-saving organ matching services.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4">
                  <Mic className="mr-2 h-5 w-5" />
                  Start Voice Diagnosis
                </Button>
                <Button size="lg" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 px-8 py-4">
                  <Heart className="mr-2 h-5 w-5" />
                  Organ Matching
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">50k+</div>
                  <div className="text-sm text-muted-foreground">Diagnoses Made</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">98%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Mic className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium">Voice Analysis Active</div>
                      <div className="text-teal-100 text-sm">Listening for symptoms...</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-teal-100">Patient Report</div>
                      <div className="font-medium">"I have a persistent headache and feeling dizzy"</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-teal-100">AI Analysis</div>
                          <div className="font-medium">Potential migraine detected</div>
                        </div>
                        <Badge className="bg-yellow-500 text-yellow-900">Medium Risk</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Advanced AI Healthcare Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive healthcare technology that understands, analyzes, and connects patients with the care they need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mb-6">
                  <Brain className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">AI Voice Diagnosis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced natural language processing to understand and analyze patient symptoms through conversational AI.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full w-fit mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Severity Detection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Intelligent risk assessment that automatically flags severe conditions and alerts medical professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mb-6">
                  <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Organ Matching</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect organ donors with recipients through our secure matching platform and availability tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mb-6">
                  <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Reports</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instant generation of comprehensive medical reports with actionable insights and recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full w-fit mb-6">
                  <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Doctor Integration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Seamless connection with healthcare professionals when urgent intervention is required.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full w-fit mb-6">
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">24/7 Availability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Round-the-clock access to AI diagnosis and medical support whenever you need it most.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              How Voice Diagnosis Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered system makes medical diagnosis as simple as having a conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-green-500 p-6 rounded-full w-fit mx-auto">
                <Mic className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">1. Voice Conversation</h3>
                <p className="text-muted-foreground">
                  Simply speak to our AI about your symptoms, concerns, or how you're feeling today.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-blue-500 p-6 rounded-full w-fit mx-auto">
                <Brain className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced AI processes your information and generates a comprehensive medical assessment.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-teal-500 p-6 rounded-full w-fit mx-auto">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">3. Get Results</h3>
                <p className="text-muted-foreground">
                  Receive your diagnosis report and connect with doctors if further care is needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organ Matching Section */}
      <section id="organ-matching" className="py-20 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Life-Saving</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Organ Donor Matching Platform
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our secure platform connects organ donors with recipients, helping save lives through 
                advanced matching algorithms and real-time availability tracking.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-foreground">Secure donor-recipient matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-foreground">Real-time organ availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-foreground">HIPAA-compliant privacy protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-foreground">24/7 emergency coordination</span>
                </div>
              </div>

              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <UserPlus className="mr-2 h-5 w-5" />
                Join Organ Network
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Current Availability</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-6 w-6 text-red-500" />
                      <div>
                        <div className="font-medium text-foreground">Heart</div>
                        <div className="text-sm text-muted-foreground">Type O, A+</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">Available</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-6 w-6 text-green-500" />
                      <div>
                        <div className="font-medium text-foreground">Kidney</div>
                        <div className="text-sm text-muted-foreground">Type B+, AB</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500 text-white">Matching</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-6 w-6 text-purple-500" />
                      <div>
                        <div className="font-medium text-foreground">Liver</div>
                        <div className="text-sm text-muted-foreground">Type A, O+</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">Available</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust */}
      <section id="safety" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Trust & Security</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Your Health Data is Safe
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We maintain the highest standards of medical data protection and privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-fit mx-auto">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">HIPAA Compliant</h3>
              <p className="text-sm text-muted-foreground">Full compliance with healthcare privacy regulations</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-fit mx-auto">
                <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground">Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">End-to-end encryption for all medical information</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-fit mx-auto">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground">Licensed Doctors</h3>
              <p className="text-sm text-muted-foreground">All connected healthcare professionals are verified</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full w-fit mx-auto">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-foreground">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock technical and medical support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">MediVoice AI</span>
              </div>
              <p className="text-muted-foreground">
                Advanced AI healthcare solutions for voice diagnosis and organ matching.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Features</h3>
              <div className="space-y-2">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Voice Diagnosis</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Organ Matching</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Doctor Connect</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Health Reports</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <div className="space-y-2">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Help Center</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Contact Us</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Emergency</div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">Privacy Policy</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Emergency: 911</div>
                <div>Support: 1-800-MEDIAI</div>
                <div>Email: help@medivoice.ai</div>
                <div>Available 24/7</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 MediVoice AI. All rights reserved. | Licensed Medical Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}