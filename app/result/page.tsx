'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Detection {
  class: string;
  timestamp: number;
  confidence: number;
}

interface AnalysisResult {
  total_duration: number;
  frequency: number;
  avg_confidence: number;
  llm_analysis: string;
}

interface AnalysisResults {
  [key: string]: AnalysisResult;
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const filename = searchParams.get('filename');
        if (!filename) {
          throw new Error('파일 이름이 없습니다.');
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/video/analysis/${encodeURIComponent(
            filename
          )}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              '분석이 아직 완료되지 않았습니다. 잠시 후 다시 시도해주세요.'
            );
          }
          if (response.status === 202) {
            throw new Error('분석이 진행 중입니다. 잠시 후 다시 시도해주세요.');
          }
          throw new Error('분석 결과를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setAnalysisResults(data.analysis);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get('filename')) {
      fetchResults();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <a href='/' className='text-blue-500 hover:text-blue-600'>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>분석 결과를 찾을 수 없습니다.</p>
          <a href='/' className='text-blue-500 hover:text-blue-600'>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

      <main className='relative max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8'>
        {/* 헤더 섹션 */}
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              PPL 분석 결과
            </h1>
            <p className='text-lg text-gray-600'>
              AI 기반 브랜드 노출 분석 리포트
            </p>
          </div>
          <a
            href='/'
            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            새로운 분석 시작하기
          </a>
        </div>

        {/* 분석 결과 섹션 */}
        <div className='space-y-8'>
          {Object.entries(analysisResults).map(([brand, result]) => (
            <div
              key={brand}
              className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'
            >
              {/* 브랜드 헤더 */}
              <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6'>
                <h3 className='text-2xl font-bold text-white'>{brand}</h3>
              </div>

              {/* 주요 지표 */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-8'>
                <div className='bg-blue-50 rounded-xl p-6 transform hover:scale-105 transition-transform duration-200'>
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4'>
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
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        총 노출 시간
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {result.total_duration.toFixed(2)}초
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-green-50 rounded-xl p-6 transform hover:scale-105 transition-transform duration-200'>
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4'>
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
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        노출 빈도
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {result.frequency}회
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-purple-50 rounded-xl p-6 transform hover:scale-105 transition-transform duration-200'>
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4'>
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
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        평균 신뢰도
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {(result.avg_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 분석 결과 */}
              <div className='px-8 pb-8'>
                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-center mb-4'>
                    <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4'>
                      <svg
                        className='w-6 h-6 text-indigo-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                        />
                      </svg>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900'>
                      AI 분석 결과
                    </h4>
                  </div>
                  <div className='prose prose-indigo max-w-none'>
                    <div className='whitespace-pre-wrap text-gray-700 bg-white rounded-lg p-6 shadow-sm'>
                      {result.llm_analysis}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div className='mt-16 text-center'>
          <p className='text-gray-500 text-sm'>
            © 2024 PPL Analysis. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
