'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Clock, DollarSign, AlertCircle, Play, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Certificate {
  id: string;
  name: string;
  duration: number;
  interestRate: number;
  returnType: 'fixed' | 'variable' | 'graduated';
  graduatedRates?: {
    year1: number;
    year2: number;
    year3: number;
  };
  type: 'monthly' | 'quarterly' | 'annual';
  minAmount: number;
  description: string;
  features: string[];
}

interface Bank {
  id: string;
  name: string;
  logo: string;
  certificates: Certificate[];
}

interface CalculationResult {
  totalProfit: number;
  monthlyProfit: number;
  totalAmount: number;
  yearlyBreakdown?: {
    year1: { monthlyProfit: number; yearlyProfit: number };
    year2: { monthlyProfit: number; yearlyProfit: number };
    year3: { monthlyProfit: number; yearlyProfit: number };
  };
}

export default function Home() {
  // Static data for now - will be replaced with API call later
  const staticBanks: Bank[] = [
    {
      id: "banque-misr",
      name: "بنك مصر",
      logo: "misr.png",
      certificates: [
        {
          id: "bm-3-year",
          name: "شهادة 3 سنوات",
          duration: 36,
          interestRate: 16.5,
          returnType: "fixed",
          type: "monthly",
          minAmount: 1500,
          description: "شهادة ادخارية لمدة 3 سنوات بسعر فائدة 16.5% سنوياً",
          features: ["فائدة شهرية", "قابلة للتجديد", "ضد التضخم"]
        },
        {
          id: "bm-5-year",
          name: "شهادة 5 سنوات",
          duration: 60,
          interestRate: 17.5,
          returnType: "fixed",
          type: "quarterly",
          minAmount: 1500,
          description: "شهادة ادخارية لمدة 5 سنوات بسعر فائدة 17.5% سنوياً",
          features: ["فائدة ربع سنوية", "أعلى سعر فائدة", "مضمونة"]
        }
      ]
    },
    {
      id: "National bank of egypt",
      name: "البنك الأهلي المصري",
      logo: "elahly.png",
      certificates: [
        {
          id: "nbe-3-year",
          name: "شهادة الأمل 3 سنوات",
          duration: 36,
          interestRate: 16.25,
          returnType: "fixed",
          type: "monthly",
          minAmount: 1000,
          description: "شهادة الأمل لمدة 3 سنوات بسعر فائدة 16.25% سنوياً",
          features: ["فائدة شهرية", "تجديد تلقائي", "مرونة في السحب"]
        }
      ]
    }
  ];

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
// Unlimited attempts - no attempts system needed
  // No ad modal needed
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  useEffect(() => {
    // Load bank data from API to sync with admin panel
    const loadBankData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/bank-data');
        if (!response.ok) {
          throw new Error(`Failed to fetch bank data: ${response.status}`);
        }
        const data = await response.json();
        setBanks(data.banks || []);
      } catch (error) {
        console.error('Error loading bank data:', error);
        setError(`فشل في تحميل بيانات البنوك: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };



    loadBankData();

    // Listen for admin panel changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bankDataUpdated') {
        loadBankData();
      }
    };

    // Add event listener for storage changes
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const calculateProfit = () => {
    // Open smart link in new window
    const smartLink = 'https://www.effectivegatecpm.com/ngvies4ma?key=966ee45d7440f496adf848c7d99bec8d';
    window.open(smartLink, '_blank', 'noopener,noreferrer');

    // Load and execute popunder script (only once)
    const scriptId = 'popunder-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://pl28247794.effectivegatecpm.com/81/49/bb/8149bb712100ce0f4086e01c7efb5832.js';
      document.head.appendChild(script);
    }

    if (!selectedCertificate || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const certificate = banks
      .flatMap(bank => bank.certificates)
      .find(cert => cert.id === selectedCertificate);

    if (!certificate) return;

    const principal = parseFloat(amount);
    const years = certificate.duration / 12;
    let totalProfit = 0;
    let monthlyProfit = 0;
    let yearlyBreakdown;

    if (certificate.returnType === 'graduated' && certificate.graduatedRates) {
      // Calculate graduated profit with yearly breakdown
      const year1Rate = certificate.graduatedRates.year1 / 100;
      const year2Rate = certificate.graduatedRates.year2 / 100;
      const year3Rate = certificate.graduatedRates.year3 / 100;
      
      const year1Profit = principal * year1Rate * Math.min(1, years);
      const year2Profit = principal * year2Rate * Math.max(0, Math.min(1, years - 1));
      const year3Profit = principal * year3Rate * Math.max(0, Math.min(1, years - 2));
      
      totalProfit = year1Profit + year2Profit + year3Profit;
      
      // Calculate monthly profits for each year
      const year1Monthly = year1Profit / 12;
      const year2Monthly = year2Profit / 12;
      const year3Monthly = year3Profit / 12;
      
      yearlyBreakdown = {
        year1: { monthlyProfit: year1Monthly, yearlyProfit: year1Profit },
        year2: { monthlyProfit: year2Monthly, yearlyProfit: year2Profit },
        year3: { monthlyProfit: year3Monthly, yearlyProfit: year3Profit }
      };
      
      // Calculate payment frequency based on certificate type
      if (certificate.type === 'monthly') {
        monthlyProfit = totalProfit / certificate.duration;
      } else if (certificate.type === 'quarterly') {
        monthlyProfit = totalProfit / (certificate.duration / 3);
      } else if (certificate.type === 'annual') {
        monthlyProfit = totalProfit / (certificate.duration / 12);
      }
    } else {
      // Calculate fixed or variable profit
      const annualRate = certificate.interestRate / 100;
      totalProfit = principal * annualRate * years;
      
      if (certificate.type === 'monthly') {
        monthlyProfit = totalProfit / certificate.duration;
      } else if (certificate.type === 'quarterly') {
        monthlyProfit = totalProfit / (certificate.duration / 3);
      } else if (certificate.type === 'annual') {
        monthlyProfit = totalProfit / (certificate.duration / 12);
      }
    }

    const totalAmount = principal + totalProfit;

    setResult({
      totalProfit,
      monthlyProfit,
      totalAmount,
      yearlyBreakdown
    });

    if (!hasCalculated) {
      setHasCalculated(true);
    }
  };

  const resetCalculator = () => {
    setSelectedBank('');
    setSelectedCertificate('');
    setAmount('');
    setResult(null);
    setHasCalculated(false);
  };

  const getSelectedCertificate = () => {
    return banks
      .flatMap(bank => bank.certificates)
      .find(cert => cert.id === selectedCertificate);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} شهر`;
    } else if (remainingMonths === 0) {
      return `${years} سنوات`;
    } else {
      return `${years} سنوات و ${remainingMonths} شهر`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Banking Calculator Logo" 
                className="w-20 h-20 object-cover rounded-full shadow-lg"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
             شهادات وودائع البنكية المصرية
          </h1>
          <p className="text-gray-600 text-lg">
            استكشف أفضل شهادات الادخار واحسب أرباحك بسهولة
          </p>
        </header>

        {/* Banks Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            قائمة البنوك
          </h2>
          
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">جاري تحميل بيانات البنوك...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  تحديث الصفحة
                </Button>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank) => (
                <Card key={bank.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">
                      <Image src={`/${bank.logo}`} alt={bank.name} height={100} width={100}/>
                      </div>
                    <CardTitle className="text-xl">{bank.name}</CardTitle>
                    <CardDescription>
                      {bank.certificates.length} شهادة متاحة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bank.certificates.map((cert) => (
                        <div key={cert.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-center">
                          <div className="text-center flex-1">
                            <p className="font-medium text-sm">{cert.name}</p>
                            <p className="text-xs text-gray-600">{formatDuration(cert.duration)}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Badge variant={cert.returnType === 'graduated' ? 'default' : cert.returnType === 'variable' ? 'secondary' : 'outline'} className="text-xs">
                                {cert.returnType === 'fixed' ? 'ثابت' : cert.returnType === 'variable' ? 'متغير' : 'متدرج'}
                              </Badge>
                              {cert.returnType === 'graduated' && cert.graduatedRates && (
                                <span className="text-xs text-blue-600">
                                  ({cert.graduatedRates.year1}%|{cert.graduatedRates.year2}%|{cert.graduatedRates.year3}%)
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-green-700 bg-green-100">
                            {cert.returnType === 'graduated' && cert.graduatedRates ? cert.graduatedRates.year1 : cert.interestRate}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Calculator Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calculator className="w-6 h-6 text-green-600" />
              حاسبة الأرباح
            </CardTitle>
            <CardDescription>
              احسب أرباحك من شهادات الادخار البنكية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-center">
                    <Label htmlFor="bank">اختر البنك</Label>
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="text-center">
                        <SelectValue placeholder="اختر البنك" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.logo} {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-center">
                    <Label htmlFor="certificate">اختر الشهادة</Label>
                    <Select 
                      value={selectedCertificate} 
                      onValueChange={setSelectedCertificate}
                      disabled={!selectedBank}
                    >
                      <SelectTrigger className="text-center">
                        <SelectValue placeholder="اختر الشهادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks
                          .find(bank => bank.id === selectedBank)
                          ?.certificates.map((cert) => (
                            <SelectItem key={cert.id} value={cert.id}>
                              {cert.name} ({cert.returnType === 'graduated' && cert.graduatedRates ? `${cert.graduatedRates.year1}%-${cert.graduatedRates.year2}%-${cert.graduatedRates.year3}%` : `${cert.interestRate}%`})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedCertificate && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {getSelectedCertificate()?.description}
                    </p>
                    {getSelectedCertificate()?.returnType === 'graduated' && getSelectedCertificate()?.graduatedRates && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <h6 className="font-medium text-sm text-blue-700 mb-2">أسعار الفائدة المتدرجة:</h6>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs text-gray-600">السنة الأولى</p>
                            <p className="font-bold text-blue-600">{getSelectedCertificate()?.graduatedRates?.year1}%</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs text-gray-600">السنة الثانية</p>
                            <p className="font-bold text-blue-600">{getSelectedCertificate()?.graduatedRates?.year2}%</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs text-gray-600">السنة الثالثة</p>
                            <p className="font-bold text-blue-600">{getSelectedCertificate()?.graduatedRates?.year3}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getSelectedCertificate()?.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <Label htmlFor="amount">مبلغ الاستثمار (جنيه مصري)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={getSelectedCertificate()?.minAmount || 0}
                    className="text-center"
                  />
                  {getSelectedCertificate() && (
                    <p className="text-xs text-gray-600">
                      الحد الأدنى: {formatCurrency(getSelectedCertificate()!.minAmount)}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={calculateProfit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!selectedCertificate || !amount || parseFloat(amount) <= 0}
                  >
                    <Calculator className="w-4 h-4 ml-2" />
                    حساب الأرباح
                  </Button>
                  <Button variant="outline" onClick={resetCalculator}>
                    إعادة تعيين
                  </Button>
                </div>

                {result && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                      📊 نتائج الحساب
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <p className="text-sm text-gray-600">إجمالي الربح</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(result.totalProfit)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">
                          {getSelectedCertificate()?.type === 'monthly' ? 'ربح شهري' : 
                           getSelectedCertificate()?.type === 'quarterly' ? 'ربح ربع سنوي' : 
                           'ربح سنوي'}
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(result.monthlyProfit)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                        <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                        <p className="text-xl font-bold text-purple-600">
                          {formatCurrency(result.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Yearly Breakdown for Graduated Certificates */}
                    {result.yearlyBreakdown && 
                     getSelectedCertificate()?.returnType === 'graduated' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-md font-bold text-blue-800 mb-4 text-center">
                          📈 تفصيل الربح حسب السنة
                          {getSelectedCertificate()?.type === 'monthly' ? '(شهري)' : 
                           getSelectedCertificate()?.type === 'quarterly' ? '(ربع سنوي)' : 
                           '(سنوي)'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p className="text-sm text-gray-600">السنة الأولى</p>
                            <p className="text-xs text-gray-500 mb-1">سعر الفائدة</p>
                            <p className="text-lg font-bold text-blue-600">
                              {getSelectedCertificate()?.graduatedRates?.year1}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ربح {getSelectedCertificate()?.type === 'monthly' ? 'شهري' : getSelectedCertificate()?.type === 'quarterly' ? 'شهري' : 'سنوي'}</p>
                            {getSelectedCertificate()?.type !== 'annual' && (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year1.monthlyProfit)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">إجمالي السنة</p>
                            {getSelectedCertificate()?.type === 'annual' ? (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year1.yearlyProfit)}
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-blue-700">
                                {formatCurrency(result.yearlyBreakdown.year1.yearlyProfit)}
                              </p>
                            )}
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p className="text-sm text-gray-600">السنة الثانية</p>
                            <p className="text-xs text-gray-500 mb-1">سعر الفائدة</p>
                            <p className="text-lg font-bold text-blue-600">
                              {getSelectedCertificate()?.graduatedRates?.year2}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ربح {getSelectedCertificate()?.type === 'monthly' ? 'شهري' : getSelectedCertificate()?.type === 'quarterly' ? 'شهري' : 'سنوي'}</p>
                            {getSelectedCertificate()?.type !== 'annual' && (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year2.monthlyProfit)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">إجمالي السنة</p>
                            {getSelectedCertificate()?.type === 'annual' ? (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year2.yearlyProfit)}
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-blue-700">
                                {formatCurrency(result.yearlyBreakdown.year2.yearlyProfit)}
                              </p>
                            )}
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p className="text-sm text-gray-600">السنة الثالثة</p>
                            <p className="text-xs text-gray-500 mb-1">سعر الفائدة</p>
                            <p className="text-lg font-bold text-blue-600">
                              {getSelectedCertificate()?.graduatedRates?.year3}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ربح {getSelectedCertificate()?.type === 'monthly' ? 'شهري' : getSelectedCertificate()?.type === 'quarterly' ? 'شهري' : 'سنوي'}</p>
                            {getSelectedCertificate()?.type !== 'annual' && (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year3.monthlyProfit)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">إجمالي السنة</p>
                            {getSelectedCertificate()?.type === 'annual' ? (
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(result.yearlyBreakdown.year3.yearlyProfit)}
                              </p>
                            ) : (
                              <p className="text-sm font-semibold text-blue-700">
                                {formatCurrency(result.yearlyBreakdown.year3.yearlyProfit)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg text-center">
                          <p className="text-sm text-blue-800">
                            <strong>ملاحظة:</strong> الفائدة تختلف حسب كل سنة بسبب العائد المتدرج
                            {getSelectedCertificate()?.type === 'annual' && ' - يتم دفع الربح سنوياً'}
                            {getSelectedCertificate()?.type === 'monthly' && ' - يتم دفع الربح شهرياً'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="border-t pt-6">
                <p className="text-gray-600 mb-4">
                  🏦 <strong>شهادات الودائع البنكية المصرية</strong>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  أفضل أداة لحساب أرباح شهادات الادخار في البنوك المصرية
                </p>
                <div className="flex justify-center gap-6 text-sm text-gray-400 mb-4">
                  <span>📱 متوافق مع جميع الأجهزة</span>
                  <span>🔒 آمن ومجاني بالكامل</span>
                  <span>🔄 تحديثات مستمرة</span>
                </div>
                <div className="flex justify-center">
                  <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    لوحة التحكم
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}