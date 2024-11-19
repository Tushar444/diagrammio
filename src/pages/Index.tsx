import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Class Diagram Tool</h1>
          <p className="text-muted-foreground">Create and manage UML class diagrams with ease</p>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-secondary hover:text-primary"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;