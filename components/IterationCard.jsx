import React from 'react'
import Image from 'next/image'
import DownloadButton from './DownloadButton'

export default function IterationCard({ iteration, isLast, isIterativeProject }) {
  const imgSrc = iteration?.image_url || iteration?.image || null

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${isLast ? '' : ''}`}>
      <div className="flex items-start space-x-4">
        <div className="w-24 h-24 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
          {imgSrc ? (
            <Image src={imgSrc} alt={`Iteration ${iteration?.iteration_number || ''}`} width={96} height={96} className="object-cover w-full h-full" />
          ) : (
            <div className="text-sm text-gray-400">Aperçu indisponible</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Itération #{iteration?.iteration_number || '—'}</p>
              {iteration?.prompt && (
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{iteration.prompt}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              {imgSrc && (
                <DownloadButton href={imgSrc} filename={`iteration-${iteration?.id || 'img'}.png`} className="text-sm" />
              )}
            </div>
          </div>
          {iteration?.improvement_feedback && (
            <div className="mt-3 text-sm text-gray-600">Feedback: {iteration.improvement_feedback}</div>
          )}
        </div>
      </div>
    </div>
  )
}
