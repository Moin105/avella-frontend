import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Demo component to showcase error handling
 * This component demonstrates how API errors are properly handled and displayed
 */
const ErrorHandlingDemo = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLoginTest = async () => {
    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Login Successful!",
          description: "You have been logged in successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTest = async () => {
    setLoading(true);
    try {
      const result = await register({
        first_name: 'Test',
        last_name: 'User',
        email: email,
        phone: '+1234567890',
        password: password,
        confirm_password: password
      });
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Account created successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Demo</CardTitle>
          <CardDescription>
            Test the error handling by trying different scenarios:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Try registering with an existing email to see "Email already registered"</li>
              <li>Try logging in with wrong credentials to see "Invalid email or password"</li>
              <li>Try with invalid email format to see validation errors</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={handleLoginTest} 
              disabled={loading || !email || !password}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </Button>
            
            <Button 
              onClick={handleRegisterTest} 
              disabled={loading || !email || !password}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Register'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">✅ Implemented Features:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Extracts specific error messages from API responses</li>
                <li>Handles different error response formats (detail, message, error)</li>
                <li>Shows validation errors for form fields</li>
                <li>Displays user-friendly error messages</li>
                <li>Handles network errors gracefully</li>
                <li>Uses toast notifications for error display</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">🔧 Error Response Examples:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>• Email exists: <code>{"detail": "Email already registered"}</code></div>
                <div>• Invalid credentials: <code>{"detail": "Invalid credentials"}</code></div>
                <div>• Validation errors: <code>{"errors": {"email": ["Invalid email format"]}}</code></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorHandlingDemo;
