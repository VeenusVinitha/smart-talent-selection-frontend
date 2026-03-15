import React, { useState,useEffect } from 'react';
import { 
  Upload, Award, Filter, MoreHorizontal
} from 'lucide-react';
import { uploadResume, uploadJobDescription } from './services/api';
import axios from 'axios';
import './index.css';

const Dashboard = () => {
  const [jd, setJd] = useState("");
  const [uploadStatus, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]); 
  const [isRanking, setIsRanking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const dataToPaginate = rankings.length > 0 ? rankings : results;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataToPaginate.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataToPaginate.length / itemsPerPage);
   const fetchInitialCandidates = async () => {
      try {
        const res = await axios.get('http://localhost:8000/candidates'); 
        const formattedResults = res.data.map((cand: any) => ({
          ...cand.candidate_profile_json,
          name: cand.filename,
          id: cand.id
        }));
        setResults(formattedResults);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      }
    };

  useEffect(() => {
     fetchInitialCandidates();
  }, []);

   useEffect(() => {
    fetchInitialCandidates();
  }, [results]);

const handleGenerateRanking = async () => {
  if (!jd.trim()) {
    alert("Please enter a Job Description first.");
    return;
  }

  setIsRanking(true);
  setStatus("Ranking Candidates...");

  try {
    const jobRes = await uploadJobDescription(jd);  
    const newJobId = jobRes?.data?.job_id; // Extract the ID returned by BE
    const rankRes = await axios.post(`http://localhost:8000/rank-candidates/${newJobId}`);   
    setRankings(rankRes.data);
    setStatus("Ranking Complete");
    setJd("");
    setStatus(null);
  } catch (err) {
    console.error(err);
    setStatus("Ranking Failed");
  } 
  
  finally {
    setIsRanking(false);
  }
};

const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

  if (!e.target.files) return;
  
  const files = Array.from(e.target.files);
  setStatus(`Processing 0/${files.length}...`);

  for (let i = 0; i < files.length; i++) {
    try {
      setStatus(`Processing ${i + 1}/${files.length}: ${files[i].name}`);
      const res = await uploadResume(files[i]);
      setResults(prev => [...prev, res.data.profile]);
    
    } catch (err) {
      console.error(`Failed to upload ${files[i].name}`, err);
      setStatus("Failed to upload one or more files");
    }
  }

  setStatus("Upload Process Finished");
  setTimeout(() => setStatus(null), 3000);
   
};

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-900">   
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-blue gradient">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-blue gradient">
         <p className="text-lg font-bold">Smart Talent Selection</p>
        </header>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Job Description Card */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Job Requirements</h3>
                  <Award size={16} className="text-blue-500" />
                </div>
                <div className="p-5">
                  <textarea 
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Describe the role..."
                  />
                  <button 
                   onClick={handleGenerateRanking}
                   disabled={isRanking}
                  className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                    {isRanking ? "Processing..." : "Generate AI Ranking"}
                  </button>
                </div>
              </div>

              {/* Upload Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                  <Upload size={28} />
                </div>
                <h3 className="font-bold mb-1">Import Resumes</h3>
                <p className="text-xs text-slate-400 mb-4 px-4">Drag and drop PDF/DOCX files to parse into your database.</p>
                <label className="cursor-pointer bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">
                  Browse Files
                  <input type="file" multiple className="hidden" onChange={handleResumeUpload} />
                </label>
                {uploadStatus && <p className="mt-2 text-xs font-bold text-blue-600">{uploadStatus}</p>}
              </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold">Recent Candidates</h3>
                <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Experience</th>
                    <th className="px-6 py-3">Top Skills</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
              
                <tbody className="divide-y divide-slate-100">
                    {currentItems.length > 0 ? currentItems.map((cand, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{cand?.name}</div>
                          <div className="text-[10px] text-slate-400 italic max-w-xs truncate">{cand?.summary}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          Match Score: <span className="text-blue-600 font-bold">{cand?.score}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {cand?.skills.slice(0, 3).map((s: string) => (
                              <span key={s} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            cand?.score > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {cand?.score > 80 ? 'High Match' : 'Potential'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No candidates uploaded yet.</td>
                      </tr>
                    )}
              </tbody>
              </table>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
  <p className="text-xs text-slate-500 font-medium">
    Showing <span className="text-slate-900">{Math.min(indexOfFirstItem + 1, dataToPaginate.length)}</span> to{" "}
    <span className="text-slate-900">{Math.min(indexOfLastItem, dataToPaginate.length)}</span> of{" "}
    <span className="text-slate-900">{dataToPaginate.length}</span> candidates
  </p>
  
  <div className="flex items-center gap-2">
    <button 
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(prev => prev - 1)}
      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      Previous
    </button>
    
    <div className="flex items-center gap-1">
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
            currentPage === index + 1 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>

    <button 
      disabled={currentPage === totalPages || totalPages === 0}
      onClick={() => setCurrentPage(prev => prev + 1)}
      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      Next
    </button>
  </div>
</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;