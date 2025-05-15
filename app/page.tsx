'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingScreen from './components/LoadingScreen';

interface ProgressData {
  status: string;
  message: string;
  progress: number;
}

interface WebSocketMessage extends ProgressData {
  update_time?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startWebSocketConnection = async (fileId: string) => {
    try {
      // 먼저 현재 분석 상태 확인
      const response = await fetch(
        `http://127.0.0.1:8000/api/video/analysis/${fileId}`
      );
      const result = await response.json();

      // 이미 완료된 경우 바로 결과 페이지로 이동
      if (result.status === 'completed') {
        router.push(`/result?filename=${fileId}`);
        return;
      }

      // 진행 중인 경우 웹소켓 연결 시작
      connectWebSocket(fileId);
    } catch (error) {
      console.error('상태 확인 실패:', error);
      setMessage('분석 상태 확인 중 오류가 발생했습니다.');
      setProgress(null);
      setUploading(false);
    }
  };

  const connectWebSocket = (fileId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = '127.0.0.1:8000'; // 개발 환경용

    console.log('WebSocket 연결 시도:', fileId);
    const ws = new WebSocket(`${protocol}//${host}/api/video/ws/${fileId}`);

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      setProgress({
        status: 'processing',
        message: '분석 진행 중...',
        progress: 0,
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket 메시지 수신:', data);

        if (data.status === 'completed') {
          setProgress({
            status: 'completed',
            message: '분석이 완료되었습니다. 결과 페이지로 이동합니다...',
            progress: 100,
          });

          // 완료 메시지를 보여준 후 결과 페이지로 이동
          setTimeout(() => {
            router.push(`/result?filename=${fileId}`);
          }, 1500);
        } else if (data.status === 'error') {
          setMessage(data.message);
          setProgress(null);
          setUploading(false);
        } else {
          setProgress({
            status: data.status,
            message: data.message,
            progress: data.progress,
          });
        }
      } catch (error) {
        console.error('메시지 처리 중 오류:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket 연결 종료:', event.code);

      // 정상 종료(1000) 또는 서버 오류(1011)가 아닌 경우에만 재연결 시도
      if (event.code !== 1000 && event.code !== 1011) {
        console.log('재연결 시도...');
        setTimeout(() => connectWebSocket(fileId), 1000);
      } else if (event.code === 1011) {
        setMessage('서버에서 오류가 발생했습니다.');
        setProgress(null);
        setUploading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    return ws;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');
    setProgress({
      status: 'uploading',
      message: '파일 업로드 중...',
      progress: 0,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/api/video/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // 웹소켓 연결 시작
        startWebSocketConnection(data.file_id);
      } else {
        setMessage(data.detail || '업로드 중 오류가 발생했습니다.');
        setProgress(null);
        setUploading(false);
      }
    } catch (error) {
      setMessage('업로드 중 오류가 발생했습니다.');
      setProgress(null);
      setUploading(false);
    }
  };

  // 로딩 화면 표시
  if (progress) {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

      <main className='relative max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 mb-4'>
            AI 기반 PPL 분석
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            YOLO와 LLM을 활용한 고급 영상 분석으로 PPL 효과를 정확하게
            측정하세요
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold mb-2'>실시간 분석</h3>
            <p className='text-gray-600'>
              YOLO를 통한 실시간 로고 감지 및 분석
            </p>
          </div>

          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold mb-2'>정확한 측정</h3>
            <p className='text-gray-600'>
              노출 시간, 빈도, 신뢰도를 정밀하게 측정
            </p>
          </div>

          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold mb-2'>AI 분석</h3>
            <p className='text-gray-600'>GPT-4를 활용한 PPL 효과성 분석</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors duration-200'>
              <input
                type='file'
                onChange={handleFileChange}
                accept='video/*'
                className='hidden'
                id='file-upload'
              />
              <label
                htmlFor='file-upload'
                className='cursor-pointer flex flex-col items-center'
              >
                <svg
                  className='w-12 h-12 text-gray-400 mb-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                  />
                </svg>
                <span className='text-lg font-medium text-gray-600'>
                  {file ? file.name : '영상 파일을 선택하거나 드래그하세요'}
                </span>
                <span className='text-sm text-gray-500 mt-2'>
                  MP4, MOV, AVI 형식 지원
                </span>
              </label>
            </div>

            <button
              type='submit'
              disabled={!file || uploading}
              className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 ${
                !file || uploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {uploading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  업로드 중...
                </span>
              ) : (
                '분석 시작하기'
              )}
            </button>
          </form>

          {message && !progress && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                message.includes('성공')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='mt-16 text-center text-gray-500 text-sm'>
          <p>© 2024 PPL Analysis. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
