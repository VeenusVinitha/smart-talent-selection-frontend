import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('files', file);
  return api.post('/parse-resume', formData); 
};

export const uploadJobDescription = (jdText: string) => {
  return api.post('/upload-job', { jd_text: jdText }); 
};