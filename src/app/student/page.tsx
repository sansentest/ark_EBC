'use client';

import { useState, useEffect } from 'react';
import { getDistinctClasses, getStudentsByClass, getStudentCredentials, markStudentLoginSuccess } from '@/app/actions/studentActions';
import { triggerEBCLogin } from '@/app/actions/automationActions';

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      fallbackCopy(text);
    }
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
};

export default function StudentFlowPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileCredentials, setMobileCredentials] = useState<{ username: string, password: string } | null>(null);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

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
          setIsReturningUser(true);
        }
      } else {
        setError('បរាជ័យក្នុងការទាញយកបញ្ជីឈ្មោះសិស្ស។');
      }
      setLoadingStudents(false);
    }
    fetchStudents();
  }, [selectedClass]);

  const handleLogin = async (overrideId?: string) => {
    const idToUse = typeof overrideId === 'string' ? overrideId : selectedStudentId;
    if (!idToUse) return;

    setIsLoggingIn(true);
    setIsSuccess(false);
    setError(null);
    setMobileCredentials(null);

    try {
      // Universal: Always show Copy & Paste overlay for all devices (mobile + desktop)
      const res = await getStudentCredentials(Number(idToUse));
      if (!res.success) {
        setError(res.error || 'បរាជ័យក្នុងការទាញយកគណនី។');
        setIsLoggingIn(false);
      } else {
        setMobileCredentials({ username: res.username!, password: res.password! });
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
  const filteredClasses = classes.filter(cls =>
    cls.toLowerCase().includes(classSearchQuery.toLowerCase())
  );


  return (
    <div className="min-h-[100dvh] relative flex flex-col justify-center py-4 sm:py-8 sm:px-6 lg:px-8 bg-[#f4f7f9] font-kantumruy overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">

      {/* Premium Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] -translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[100px] translate-x-1/3 translate-y-1/4"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-sky-300/20 blur-[100px] translate-y-1/2"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4 sm:px-0">

        {/* Header / Logo */}
        <div className="text-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-[20px] sm:rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white mb-3 sm:mb-4 relative group cursor-default transform transition-transform hover:scale-105 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-[20px] sm:rounded-[24px]"></div>
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 drop-shadow-sm relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"></path>
            </svg>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-black text-slate-800 tracking-tight mb-1.5">
            EBC វិទ្យាល័យអង្គរកា
          </h2>
          <p className="text-[15px] text-slate-500/90 font-medium">
            សូមស្វាគមន៍! ការចូលរៀនតាម EBC
          </p>
        </div>

        {/* Main Card */}
        <div className="relative bg-white/70 backdrop-blur-2xl px-5 py-3 sm:px-8 sm:py-4 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white rounded-[2rem] sm:rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">

          {/* Subtle top glare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

          {/* Loading / Success Overlay */}
          {(isLoggingIn && !mobileCredentials) || isSuccess ? (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300 rounded-[2rem] sm:rounded-[2.5rem]">
              {isLoggingIn ? (
                <>
                  <div className="w-20 h-20 mb-8 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    <svg className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-[22px] font-bold text-slate-800 mb-3 tracking-tight">
                    កំពុងរៀបចំគណនី...
                  </h3>
                  <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-[260px]">
                    សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងទាញយកព័ត៌មានរបស់អ្នក។
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mb-8 relative flex items-center justify-center bg-emerald-50 rounded-full text-emerald-500 border border-emerald-100 animate-in zoom-in duration-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-[22px] font-bold text-slate-800 mb-3 tracking-tight">តភ្ជាប់ជោគជ័យ! 🎉</h3>
                  <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-[260px]">
                    អ្នកបានចូលកម្មវិធី EBC ដោយជោគជ័យ។ សូមរីករាយក្នុងការសិក្សា!
                  </p>
                </>
              )}
            </div>
          ) : null}

          {error && (
            <div className="mb-8 bg-red-50/80 border border-red-100 text-red-600 p-4 rounded-[1.25rem] shadow-sm animate-in fade-in slide-in-from-top-2 text-[13px] sm:text-sm font-semibold flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-7">
            {!selectedStudentId || !isReturningUser ? (
              <>
                {/* Custom Class Dropdown */}
                <div className="relative mb-6 z-20">
                  <label className="block text-[12px] sm:text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    ថ្នាក់រៀនរបស់អ្នក
                  </label>

                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggingIn) setIsClassDropdownOpen(!isClassDropdownOpen);
                    }}
                    disabled={loadingClasses || isLoggingIn}
                    className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border text-left rounded-[1.25rem] shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${isClassDropdownOpen ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-blue-300'
                      } disabled:opacity-50`}
                  >
                    {loadingClasses ? (
                      <span className="text-[14px] sm:text-[15px] font-medium text-slate-500 flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        កំពុងទាញយក...
                      </span>
                    ) : selectedClass ? (
                      <span className="text-[15px] sm:text-[16px] font-bold text-blue-600">{selectedClass}</span>
                    ) : (
                      <span className="text-[14px] sm:text-[15px] font-medium text-slate-400">-- សូមជ្រើសរើសថ្នាក់រៀន --</span>
                    )}

                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isClassDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`transition-all duration-300 ease-in-out origin-top absolute top-full left-0 right-0 mt-2 ${isClassDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 visible'
                    : 'opacity-0 scale-95 -translate-y-2 invisible'
                    }`}>
                    <div className="bg-white border border-slate-200 rounded-[1.25rem] shadow-xl shadow-slate-200/50 p-3">

                      {/* Search Input inside Dropdown */}
                      <div className="relative mb-3">
                        <input
                          type="text"
                          placeholder="ស្វែងរកថ្នាក់ (ឧ. 12A)..."
                          value={classSearchQuery}
                          onChange={(e) => setClassSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-colors text-[14px]"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Class List */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((cls) => (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => {
                                setSelectedClass(cls);
                                setSelectedStudentId('');
                                setClassSearchQuery('');
                                setIsClassDropdownOpen(false);
                                localStorage.setItem('ebc_saved_class', cls);
                                localStorage.removeItem('ebc_saved_student_id');
                              }}
                              className={`flex items-center justify-center py-2.5 px-2 rounded-xl border text-[14px] font-bold transition-all duration-200 ${selectedClass === cls
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                : 'bg-white text-slate-700 border-slate-100 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                              {cls}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-5 text-[13px] text-slate-400 font-medium">
                            រកមិនឃើញថ្នាក់ "{classSearchQuery}" ទេ
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Searchable Student Selection */}
                <div className={`transition-all duration-500 ease-out ${selectedClass ? 'opacity-100 translate-y-0 block' : 'opacity-0 -translate-y-4 hidden'}`}>
                  <label className="block text-[12px] sm:text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    ឈ្មោះសិស្ស
                  </label>

                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="ស្វែងរកឈ្មោះរបស់អ្នក..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loadingStudents || isLoggingIn}
                      className="w-full bg-white/60 hover:bg-white border border-slate-200 text-slate-800 rounded-[1.25rem] pl-11 pr-5 py-3 sm:py-3.5 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400 font-medium text-[14px] sm:text-[15px] disabled:opacity-50"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {loadingStudents ? (
                    <div className="flex items-center justify-center p-6">
                      <p className="text-[12px] text-blue-600 font-semibold flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        កំពុងស្វែងរក...
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[1.25rem] max-h-40 sm:max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1 shadow-sm">
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
                              setIsReturningUser(false);
                              handleLogin(idStr);
                            }}
                            className="w-full text-left px-5 py-3.5 rounded-[1rem] text-[15px] font-semibold transition-all duration-200 flex items-center justify-between text-slate-700 hover:bg-slate-100/80 hover:text-blue-700 group"
                          >
                            <span className="flex flex-col gap-0.5">
                              <span>{student.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium font-mono uppercase tracking-wider group-hover:text-blue-400">ID: {student.student_id}</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center text-[13px] font-medium text-slate-400">
                          មិនមានឈ្មោះនេះទេ
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // WELCOME BACK FAST PATH
              <div className="bg-white/50 backdrop-blur-sm border border-blue-100/60 rounded-[2rem] p-6 sm:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80"></div>

                <div className="relative z-10">
                  <div className="w-[72px] h-[72px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/20 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 border-2 border-white">
                    <span className="text-4xl font-black">
                      {students.length > 0
                        ? students.find(s => s.id.toString() === selectedStudentId)?.name?.charAt(0) || '👤'
                        : '...'}
                    </span>
                  </div>
                  <h3 className="text-[20px] sm:text-[24px] font-black text-slate-800 mb-2 tracking-tight">
                    សួស្ដី, <span className="text-blue-600">
                      {students.length > 0
                        ? students.find(s => s.id.toString() === selectedStudentId)?.name || 'សិស្ស'
                        : 'កំពុងរៀបចំ...'}
                    </span>! 👋
                  </h3>
                  <p className="text-[14px] font-medium text-slate-500 mb-6">រួចរាល់ក្នុងការចូលរៀនហើយឬនៅ?</p>

                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => {
                      setSelectedStudentId('');
                      localStorage.removeItem('ebc_saved_student_id');
                      setIsReturningUser(false);
                    }}
                    className="inline-flex items-center gap-2.5 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-all bg-white/60 hover:bg-white px-5 py-2.5 rounded-[1rem] border border-slate-200/50 shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    ប្ដូរគណនី
                  </button>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className={`transition-all duration-500 ease-in-out ${selectedStudentId && isReturningUser ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-4 hidden'}`}>
              <button
                type="button"
                onClick={() => handleLogin()}
                disabled={isLoggingIn}
                className={`w-full flex justify-center items-center py-3.5 sm:py-4 px-6 border border-transparent rounded-[1.25rem] shadow-[0_8px_20px_rgb(59,130,246,0.25)] hover:shadow-[0_10px_25px_rgb(59,130,246,0.3)] text-[15px] font-bold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] group`}
              >
                <>
                  <span className="tracking-wide">យកគណនី និងចូល EBC</span>
                  <svg className="ml-2.5 w-5 h-5 opacity-90 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] text-slate-400/80 font-semibold tracking-wider uppercase animate-in fade-in duration-1000 delay-500">
          ប្រព័ន្ធគ្រប់គ្រងសិស្ស EBC &copy; 2026
        </p>
      </div>

      {/* Root Level Modal for Credentials */}
      {mobileCredentials && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-[380px] mx-auto bg-white/95 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="pt-8 pb-4 px-8 text-center shrink-0 flex flex-col items-center">
              <div className="w-[60px] h-[60px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[20px] mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-black text-slate-800 tracking-tight mb-1">គណនីរបស់អ្នក</h3>
              <p className="text-slate-500 text-[13px] font-medium mb-4">សូមចម្លងUSERNAMEនិងPASSWORDទៅប្រអប់ខាងក្រោម</p>

              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="w-5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8 overflow-y-auto custom-scrollbar">

              {/* Username Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">ឈ្មោះអ្នកប្រើ (USERNAME)</span>
                </div>

                <div className="flex items-center p-2.5 sm:p-3 border border-slate-200 rounded-[1rem] bg-white shadow-sm">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0 pl-1 pr-2">
                    <p className="text-[16px] sm:text-[18px] font-bold text-slate-800 font-mono break-all leading-tight">
                      {mobileCredentials.username}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await copyToClipboard(mobileCredentials.username);
                      setCopiedUsername(true);
                      setTimeout(() => setCopiedUsername(false), 2000);
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors shrink-0 active:scale-95"
                    title="Copy Username"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              </div>

              {/* Copied Success Message */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${copiedUsername ? 'max-h-12 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
                <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-2.5 rounded-[1rem] border border-emerald-100/50 text-[13px] font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>បានចម្លង (Copy) រួចរាល់!</span>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">ពាក្យសម្ងាត់ (PASSWORD)</span>
                </div>

                <div className="flex items-center p-2.5 sm:p-3 border border-slate-200 rounded-[1rem] bg-white shadow-sm">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0 pl-1 pr-2">
                    <p className="text-[16px] sm:text-[18px] font-bold text-slate-800 font-mono break-all leading-tight">
                      {mobileCredentials.password}
                    </p>
                  </div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                </div>
              </div>

              {/* Warning Banner */}

              {/* Step Guide */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-[1rem] p-3 mb-4">
                <p className="text-[13px] font-bold text-blue-800 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  តើត្រូវធ្វើអ្វីបន្តទៀត?
                </p>
                <ol className="space-y-3 list-none">
                  <li className="text-[12.5px] text-blue-900 font-medium flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-200">1</span>
                    <span>ចម្លង Username</span>
                  </li>
                  <li className="text-[12.5px] text-blue-900 font-medium flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-200">2</span>
                    <div className="flex flex-col gap-1.5">
                      <span>ចូលទៅកាន់ Moodle ហើយចុចប៊ូតុង EBC</span>
                    </div>
                  </li>
                  <li className="text-[12.5px] text-blue-900 font-medium flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-200">3</span>
                    <span>Paste Username + វាយ Password ចូលជាការស្រេច!</span>
                  </li>
                </ol>
              </div>

              {/* Main Button */}
              <button
                onClick={async () => {
                  await copyToClipboard(mobileCredentials.username);
                  window.open('https://elearning-ar.ebc.edu.kh/login/index.php', '_blank');
                  await markStudentLoginSuccess(Number(selectedStudentId));
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[1rem] font-bold text-[16px] transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-[0.98] mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>ចូលប្រព័ន្ធ EBC</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Close Button / Go Back */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60"></div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLoggingIn(false);
                  setMobileCredentials(null);
                }}
                className="w-full flex items-center justify-center gap-2 text-blue-600 font-bold text-[14px] hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>ត្រលប់ក្រោយដើម្បីប្ដូរឈ្មោះ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
