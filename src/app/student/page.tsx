'use client';

import { useState, useEffect } from 'react';
import { getDistinctClasses, getStudentsByClass, getStudentCredentials } from '@/app/actions/studentActions';
import { triggerEBCLogin } from '@/app/actions/automationActions';

export default function StudentFlowPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileCredentials, setMobileCredentials] = useState<{username: string, password: string} | null>(null);

  useEffect(() => {
    // Detect if device is mobile or small screen
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobile(checkMobile);
  }, []);

  useEffect(() => {
    async function fetchClasses() {
      const res = await getDistinctClasses();
      if (res.success && res.classes) {
        setClasses(res.classes);
        const savedClass = localStorage.getItem('ebc_saved_class');
        if (savedClass && res.classes.includes(savedClass)) {
          setSelectedClass(savedClass);
        }
      } else {
        setError('បរាជ័យក្នុងការទាញយកថ្នាក់។ សូមសាកល្បងម្ដងទៀត។');
      }
      setLoadingClasses(false);
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    async function fetchStudents() {
      setLoadingStudents(true);
      setError(null);
      const res = await getStudentsByClass(selectedClass);
      if (res.success && res.students) {
        setStudents(res.students);
        const savedStudentId = localStorage.getItem('ebc_saved_student_id');
        if (savedStudentId && res.students.some((s: any) => s.id.toString() === savedStudentId)) {
          setSelectedStudentId(savedStudentId);
        }
      } else {
        setError('បរាជ័យក្នុងការទាញយកបញ្ជីឈ្មោះសិស្ស។');
      }
      setLoadingStudents(false);
    }
    fetchStudents();
  }, [selectedClass]);

  const handleLogin = async () => {
    if (!selectedStudentId) return;
    
    setIsLoggingIn(true);
    setIsSuccess(false);
    setError(null);
    setMobileCredentials(null);
    
    try {
      // Desktop and Mobile Flow: Get credentials and show them to the user
      const res = await getStudentCredentials(Number(selectedStudentId));
      if (!res.success) {
        setError(res.error || 'បរាជ័យក្នុងការទាញយកគណនី។');
        setIsLoggingIn(false);
      } else {
        setMobileCredentials({ username: res.username!, password: res.password! });
        // Note: we don't set isLoggingIn to false yet, because we show the credentials in the overlay
      }
    } catch (err: any) {
      setError(err.message || 'មានបញ្ហាក្នុងការទាញយកគណនី។');
      setIsLoggingIn(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.student_id && s.student_id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden font-kantumruy">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl opacity-60"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-100/50 blur-3xl opacity-60"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center transform transition-transform hover:scale-105 duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"></path>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          EBC វិទ្យាល័យអង្គរកា
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          សូមជ្រើសរើសថ្នាក់ និងឈ្មោះរបស់អ្នក ដើម្បីចូលរៀន
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="relative bg-white/80 backdrop-blur-xl py-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-white/40 overflow-hidden">
          
          {/* Loading / Success / Mobile Credentials Overlay */}
          {(isLoggingIn || isSuccess) && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
              
              {mobileCredentials ? (
                <div className="w-full max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">គណនីរបស់អ្នករួចរាល់</h3>
                  <p className="text-sm text-slate-500 mb-4">សូមចំណាំឈ្មោះគណនីរបស់អ្នក ដើម្បីវាយបញ្ចូល</p>
                  
                  <div className="bg-slate-50 rounded-xl p-5 border border-blue-200 mb-5 text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                    <p className="text-sm text-slate-500 font-medium mb-1">ឈ្មោះអ្នកប្រើប្រាស់ (Username)</p>
                    <p className="text-xl sm:text-2xl font-black text-blue-700 tracking-wider mb-2 font-mono select-all break-all">
                      {mobileCredentials.username}
                    </p>
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2 px-3 rounded-lg flex items-start text-left mb-3 shadow-sm">
                      <svg className="w-5 h-5 mr-1.5 flex-shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span><strong>បម្រាម៖</strong> សូមទន្ទេញចាំ ឬ កត់លេខ Username នេះទុកជាដាច់ខាត! មុននឹងចុចប៊ូតុងបន្ត ដើម្បីកុំឱ្យភ្លេច។</span>
                    </div>
                    <div className="bg-yellow-50 text-yellow-800 text-xs py-2 px-3 rounded-lg flex items-start text-left">
                      <svg className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>លេខសម្ងាត់ (Password) នឹងត្រូវបាន <strong>Copy ទុកដោយស្វ័យប្រវត្តិ</strong> ពេលអ្នកចុចប៊ូតុងខាងក្រោម។</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mobileCredentials.password);
                      window.open('https://sso.ebc.edu.kh', '_blank');
                      setIsLoggingIn(false);
                      setMobileCredentials(null);
                      setSelectedStudentId('');
                    }}
                    className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg font-bold hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    ចម្លងលេខសម្ងាត់ (Password) និងបើក EBC
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsLoggingIn(false);
                      setMobileCredentials(null);
                    }}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    បោះបង់
                  </button>
                </div>
              ) : isLoggingIn ? (
                <>
                  <div className="w-20 h-20 mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    <svg className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isMobile ? 'កំពុងរៀបចំគណនី...' : 'កំពុងភ្ជាប់ទៅកាន់ EBC...'}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[250px]">
                    {isMobile ? 'សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងទាញយកព័ត៌មានរបស់អ្នក។' : 'ប្រព័ន្ធកំពុងដំណើរការចូលគណនីរបស់អ្នក សូមមេត្តារង់ចាំ និងកុំបិទផ្ទាំងនេះ។'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mb-6 relative flex items-center justify-center bg-green-100 rounded-full text-green-600 animate-bounce">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">តភ្ជាប់ជោគជ័យ! 🎉</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[250px]">
                    អ្នកបានចូលកម្មវិធី EBC ដោយជោគជ័យ។ សូមរីករាយក្នុងការសិក្សា!
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50/80 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-top-2 text-sm font-medium">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Class Selection */}
            <div>
              <label htmlFor="class-select" className="block text-sm font-semibold text-slate-700 mb-2">
                ថ្នាក់រៀន (Class)
              </label>
              <div className="relative">
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => {
                    const newClass = e.target.value;
                    setSelectedClass(newClass);
                    setSelectedStudentId('');
                    setSearchQuery('');
                    if (newClass) {
                      localStorage.setItem('ebc_saved_class', newClass);
                    } else {
                      localStorage.removeItem('ebc_saved_class');
                    }
                    localStorage.removeItem('ebc_saved_student_id');
                  }}
                  disabled={loadingClasses || isLoggingIn}
                  className="appearance-none block w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="">-- សូមជ្រើសរើសថ្នាក់ --</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {loadingClasses && (
                <p className="mt-2 text-xs text-blue-600 flex items-center animate-pulse">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  កំពុងទាញយកទិន្នន័យថ្នាក់...
                </p>
              )}
            </div>

            {/* Custom Searchable Student Selection */}
            <div className={`transition-all duration-500 ease-in-out ${selectedClass ? 'opacity-100 translate-y-0 block' : 'opacity-0 -translate-y-4 hidden'}`}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ឈ្មោះសិស្ស (Student Name)
              </label>
              
              {!selectedStudentId ? (
                <>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="ស្វែងរកឈ្មោះរបស់អ្នក..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loadingStudents || isLoggingIn}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-10 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400 disabled:opacity-50"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {loadingStudents ? (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-xs text-blue-600 flex items-center animate-pulse">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        កំពុងទាញយកទិន្នន័យ...
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            disabled={isLoggingIn}
                            onClick={() => {
                              const idStr = student.id.toString();
                              setSelectedStudentId(idStr);
                              localStorage.setItem('ebc_saved_student_id', idStr);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between text-slate-700 hover:bg-slate-200"
                          >
                            <span className="flex flex-col">
                              <span className="font-semibold">{student.name}</span>
                              <span className="text-xs opacity-70 mt-0.5">ID: {student.student_id}</span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                          មិនមានឈ្មោះនេះទេ
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col">
                    <span className="font-bold text-blue-900 text-base">{students.find(s => s.id.toString() === selectedStudentId)?.name}</span>
                    <span className="text-xs text-blue-700/80 font-medium mt-0.5">ID: {students.find(s => s.id.toString() === selectedStudentId)?.student_id}</span>
                  </div>
                  <button 
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => {
                      setSelectedStudentId('');
                      localStorage.removeItem('ebc_saved_student_id');
                    }}
                    className="text-xs font-bold text-blue-600 bg-white px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    ប្ដូរឈ្មោះ
                  </button>
                </div>
              )}
            </div>

            {/* Login Button */}
            <div className={`transition-all duration-500 ease-in-out ${selectedStudentId ? 'opacity-100 scale-100 block' : 'opacity-0 scale-95 hidden'}`}>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98]`}
              >
                {isLoggingIn && !mobileCredentials ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    កំពុងដំណើរការ...
                  </>
                ) : (
                  <>
                    {isMobile ? 'យកគណនី និងចូល EBC' : 'ចូលកម្មវិធី EBC'}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          ប្រព័ន្ធគ្រប់គ្រងសិស្ស EBC &copy; 2026
        </p>
      </div>
    </div>
  );
}
