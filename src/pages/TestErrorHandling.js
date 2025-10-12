import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const TestErrorHandling = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test12345');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleTestRegister = async () => {
    setLoading(true);
    console.log('Testing registration with email:', email);
    
    try {
      const result = await register({
        first_name: 'Test',
        last_name: 'User',
        email: email,
        phone: '+1234567890',
        password: password,
        confirm_password: password
      });
      
      console.log('Registration result:', result);
      
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
      console.error('Unexpected error:', error);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Error Handling Test</CardTitle>
          <CardDescription>
            Test the error handling by trying to register with an existing email.
            The email "test@example.com" is already registered, so you should see an error.
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
          
          <Button 
            onClick={handleTestRegister} 
            disabled={loading || !email || !password}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Registration (Should Show Error)'}
          </Button>
          
          <div className="text-sm text-gray-600">
            <p><strong>Expected Result:</strong></p>
            <p>You should see a red toast notification with the message:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">"Email already registered"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestErrorHandling;
