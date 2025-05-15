import React from 'react';

interface LoadingScreenProps {
  progress: {
    status: string;
    message: string;
    progress: number;
  };
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className='fixed inset-0 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center z-50'>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          {/* 로고 애니메이션 */}
          <div className='flex justify-center mb-8'>
            <div className='relative'>
              <div className='w-24 h-24 border-4 border-blue-200 rounded-full animate-pulse'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <svg
                  className='w-12 h-12 text-blue-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 진행 상태 메시지 */}
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              영상 분석 중
            </h2>
            <p className='text-gray-600'>{progress.message}</p>
          </div>

          {/* 진행 상태바 */}
          <div className='space-y-4'>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all duration-500 relative'
                style={{ width: `${progress.progress}%` }}
              >
                <div className='absolute -right-4 -top-8 bg-blue-600 text-white px-2 py-1 rounded text-xs'>
                  {progress.progress}%
                </div>
              </div>
            </div>
          </div>

          {/* 분석 단계 표시 */}
          <div className='mt-8'>
            <div className='space-y-4'>
              <Step
                completed={progress.progress >= 20}
                current={progress.progress < 20}
                label='파일 업로드'
              />
              <Step
                completed={progress.progress >= 40}
                current={progress.progress >= 20 && progress.progress < 40}
                label='로고 감지'
              />
              <Step
                completed={progress.progress >= 60}
                current={progress.progress >= 40 && progress.progress < 60}
                label='음성 추출'
              />
              <Step
                completed={progress.progress >= 80}
                current={progress.progress >= 60 && progress.progress < 80}
                label='컨텍스트 분석'
              />
              <Step
                completed={progress.progress === 100}
                current={progress.progress >= 80 && progress.progress < 100}
                label='결과 생성'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  completed: boolean;
  current: boolean;
  label: string;
}

function Step({ completed, current, label }: StepProps) {
  return (
    <div className='flex items-center'>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
          completed
            ? 'bg-green-500'
            : current
            ? 'bg-blue-500 animate-pulse'
            : 'bg-gray-200'
        }`}
      >
        {completed && (
          <svg
            className='w-4 h-4 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M5 13l4 4L19 7'
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm ${
          completed
            ? 'text-green-500 font-medium'
            : current
            ? 'text-blue-500 font-medium'
            : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
