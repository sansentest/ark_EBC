'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { importStudentsAction, ImportStudentDTO } from '@/app/actions/importStudents';

export default function ImportPage() {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; imported?: number; skipped?: number; error?: string } | null>(null);
  
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [selectedClass, setSelectedClass] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const ab = evt.target?.result;
        const wb = XLSX.read(ab, { type: 'array' });
        let allData: any[] = [];
        
        wb.SheetNames.forEach(wsname => {
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          const normalizedData = data.map((row: any) => {
            const newRow: any = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
              newRow[normalizedKey] = String(row[key]);
            });
            // Inject the sheet name to be used as class name later
            newRow['_sheet_name'] = wsname;
            return newRow;
          });
          
          allData = allData.concat(normalizedData);
        });
        
        setDataPreview(allData);
      } catch (err) {
        console.error('Error reading Excel file:', err);
        setResult({ success: false, error: 'Invalid Excel file format.' });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processImport = async () => {
    if (dataPreview.length === 0) return;
    
    if (selectedRole === 'STUDENT') {
      const hasClassColumn = dataPreview.some(row => row['class'] || row['class_name'] || row['_sheet_name']);
      if (!selectedClass && !hasClassColumn) {
        toast.error('⚠️ សូមបញ្ចូលឈ្មោះថ្នាក់រៀនជាមុនសិន!');
        return;
      }
    }
    
    setIsImporting(true);
    setResult(null);

    // Map the excel columns to DTO
    const dtos: ImportStudentDTO[] = dataPreview.map((row, index) => ({
      studentId: row['student_id'] || row['id'] || `auto-${index}-${Date.now()}`,
      name: row['student_name'] || row['name'] || row['name_kh'] || row['ឈ្មោះជាភាសាខ្មែរ'] || '',
      className: row['class'] || row['class_name'] || selectedClass || row['_sheet_name'] || 'N/A',
      role: selectedRole,
      username: row['username'] || row['ឈ្មោះអ្នកប្រើ'] || '',
      passwordRaw: row['password'] || row['ពាក្យសម្ងាត់'] || '',
    }));

    const res = await importStudentsAction(dtos);
    setResult(res);
    setIsImporting(false);
    if (res.success) {
      if (res.skipped && res.skipped > 0) {
        toast.warning(`បញ្ចូលបាន ${res.imported} នាក់, រំលង ${res.skipped} នាក់ (ដោយសារជាន់ Username ឬអត់មាន Username/Password)`);
        console.log('Skipped details:', res.skippedDetails);
      } else {
        toast.success(`ជោគជ័យ! បានបញ្ចូលទិន្នន័យ ${res.imported} គណនី។`);
      }
      setDataPreview([]); // Clear preview on success
    } else {
      toast.error(res.error || 'មានបញ្ហាក្នុងការបញ្ចូលទិន្នន័យ!');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          Import Students
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Upload an Excel or CSV file to bulk import student accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Configuration</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  <option value="STUDENT">Student (សិស្ស)</option>
                  <option value="TEACHER">Teacher (គ្រូ)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">កំណត់ឈ្មោះថ្នាក់រួម (Optional)</label>
                <input 
                  type="text" 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  placeholder="e.g. 12A, 11B..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">ទុកចោល (ទទេ) បើ Excel របស់អ្នកបានបែងចែក Sheet តាមថ្នាក់រួចហើយ។ វានឹងយកឈ្មោះ Sheet ធ្វើជាឈ្មោះថ្នាក់ស្វ័យប្រវត្តិ។</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 border-t border-slate-200 dark:border-slate-800/60 pt-4">Upload File</h3>
            
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-indigo-500/50 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">XLSX, XLS, or CSV (MAX. 10MB)</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload} 
              />
            </label>

            {isUploading && (
              <div className="mt-4 flex items-center justify-center text-sm text-indigo-400">
                <Loader2 className="animate-spin mr-2" size={16} /> Reading file...
              </div>
            )}
          </div>

          {/* Results Card */}
          {result && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl ${result.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-start gap-4">
                {result.success ? (
                  <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                )}
                <div>
                  <h3 className={`font-semibold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.success ? 'Import Complete' : 'Import Failed'}
                  </h3>
                  <div className="mt-2 text-sm text-slate-300">
                    {result.success ? (
                      <ul className="space-y-1">
                        <li>Successfully imported: <strong>{result.imported}</strong> students</li>
                        {result.skipped! > 0 && (
                          <li className="text-amber-400">Skipped (duplicates/invalid): <strong>{result.skipped}</strong></li>
                        )}
                      </ul>
                    ) : (
                      <p>{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-[#11131a]/60 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Data Preview</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {dataPreview.length > 0 ? `Found ${dataPreview.length} records ready to import.` : 'Upload a file to see preview.'}
                </p>
              </div>
              
              <button 
                onClick={processImport}
                disabled={dataPreview.length === 0 || isImporting}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isImporting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {dataPreview.length > 0 ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Student ID</th>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Class</th>
                      <th className="px-6 py-4 font-medium">Username</th>
                      <th className="px-6 py-4 font-medium">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {dataPreview.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{row['student_id'] || row['id'] || row['ល.រ.'] || row['លេខរៀង'] || '-'}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{row['student_name'] || row['name'] || row['name_kh'] || row['ឈ្មោះជាភាសាខ្មែរ'] || '-'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row['class'] || row['class_name'] || selectedClass || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono">{row['username'] || row['ឈ្មោះអ្នកប្រើ'] || '-'}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono">••••••••</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-24 px-4 text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border-4 border-white dark:border-[#11131a] shadow-xl shadow-slate-200/20 dark:shadow-none">
                    <FileSpreadsheet size={40} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">មិនទាន់មានទិន្នន័យនៅឡើយទេ</h3>
                  <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    សូមជ្រើសរើសឯកសារ Excel (.xlsx) ឬ CSV ដើម្បីមើលទិន្នន័យព្រាងមុននឹងបញ្ចូនចូលប្រព័ន្ធ។
                  </p>
                </div>
              )}
            </div>
            
            {dataPreview.length > 50 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
                Showing first 50 rows. Total rows: {dataPreview.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
