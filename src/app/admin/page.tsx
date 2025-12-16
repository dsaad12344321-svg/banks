'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, Key } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading
    setTimeout(() => {
      if (password === 'admin@1234') {
        // Store authentication
        localStorage.setItem('adminAuth', 'admin@1234');
        // Redirect to admin panel
        router.push('/admin/admin@1234');
      } else {
        setError('كلمة المرور غير صحيحة');
      }
      setLoading(false);
    }, 1000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto mt-20">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">
            يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Key className="w-5 h-5 text-blue-600" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription>
              إدارة بيانات شهادات البنوك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="أدخل كلمة المرور"
                    className={`pr-10 text-lg h-12 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg h-12 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">ملاحظات أمنية:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• هذه الصفحة محمية بكلمة مرور</li>
                    <li>• لا تشارك كلمة المرور مع الآخرين</li>
                    <li>• استخدم متصفح آمن للدخول</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6 pt-4 border-t">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-2 justify-center"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>نظام إدارة شهادات البنوك المصرية</p>
          <p className="mt-1">© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}