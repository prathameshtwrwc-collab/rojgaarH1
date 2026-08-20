import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, LogIn, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { useData } from '../../context/DataContext';

function AdminLogin() {
  const { adminLogin, isAdminLoggedIn } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdminLoggedIn) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Try admin@rojgaarhai.com / admin123');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] flex items-center justify-center p-4" style={{ fontFamily: 'var(--font)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--orange)] rounded-xl mb-4 shadow-lg">
            <Briefcase size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--navy)]">Admin Login</h1>
          <p className="text-[var(--charcoal)] mt-1">ROJGAARHAI</p>
        </div>
        <Card className="form-card-landing">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="admin@rojgaarhai.com" />
            <Input label="Password" type="password" required value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter password" />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" className="btn-landing-primary gap-2">
              <LogIn size={18} /> Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--charcoal)]">Demo: admin@rojgaarhai.com / admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminLogin;
