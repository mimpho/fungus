import { useState } from 'react'
import { mockArticles } from '../data/articles'
import { ArticleModal } from '../components/modals/ArticleModal'
import { IC } from '../lib/helpers'

// Importar artículos para que se registren en ARTICLE_REGISTRY
import '../articles/Micorrizas'

function ArticleCard({ article, onSelect }) {
  const isPublished = article.status === 'published'
  return (
    <div
      onClick={() => isPublished && onSelect(article)}
      className={`glass rounded-2xl overflow-hidden transition-all duration-200 ${isPublished ? 'hover-lift cursor-pointer' : 'opacity-60'}`}
      style={{ border: isPublished ? '1px solid #4a7c5930' : '1px solid #ffffff08' }}>
      <div className="px-5 py-5 flex items-start justify-between"
        style={{ background: isPublished ? 'linear-gradient(135deg, #1a2e14, #243018)' : '#161e12' }}>
        <span className="text-4xl">{article.emoji || '🍄'}</span>
        <div className="flex items-center gap-2">
          {!isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: '#ffffff10', color: '#f4ebe1', opacity: 0.5 }}>
              Próximamente
            </span>
          )}
          {isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: '#4a7c5930', color: '#84cc16' }}>
              Nuevo
            </span>
          )}
        </div>
      </div>
      <div className="px-5 pb-5">
        <h3 className="font-display text-base text-[#f4ebe1] mb-1 leading-tight mt-3">
          {article.title}
        </h3>
        <p className="text-xs text-[#d9cda1]/50 mb-3 leading-relaxed line-clamp-2">
          {article.summary}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1.5 flex-wrap">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-[#f4ebe1]/30 ml-2 flex-shrink-0">
            {article.readingTime} min
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Micologia() {
  const [selectedSlug, setSelectedSlug] = useState(null)
  const featured = mockArticles.filter(a => a.featured)
  const rest     = mockArticles.filter(a => !a.featured)

  return (
    <>
      {selectedSlug && (
        <ArticleModal slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
      )}

      <div className="max-w-5xl mx-auto anim-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {IC.book}
            <h2 className="font-display text-2xl text-[#f4ebe1]">Micología</h2>
          </div>
          <p className="text-sm text-[#f4ebe1]/45 max-w-xl">
            Artículos para entender el reino fungi: ecología, identificación, historia y ciencia.
          </p>
        </div>

        {/* Artículo destacado */}
        {featured.map(article => (
          <div key={article.id}
            onClick={() => setSelectedSlug(article.slug)}
            className="glass flex flex-col md:flex-row rounded-2xl overflow-hidden hover-lift cursor-pointer mb-8 transition-all duration-200">
            <div className="md:w-1/2 h-56 md:h-auto">
              <img src={article.heroImage} className="w-full h-full object-cover" alt={article.title} />
            </div>
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
              <h2 className="font-display text-xl sm:text-3xl text-[#f4ebe1] mb-3 leading-snug">
                {article.title}
              </h2>
              <p className="text-sm text-amber-100/80 leading-relaxed mb-4 max-w-xl">
                {article.summary}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-emerald-400 bg-emerald-400/5 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="hidden md:block text-xs text-[#f4ebe1]/30">
                  {article.readingTime} min de lectura
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Resto de artículos */}
        <div className="mb-4">
          <h3 className="font-display text-lg text-[#f4ebe1]/60 mb-4">Más artículos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={a => setSelectedSlug(a.slug)} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center py-8">
          <p className="text-xs text-[#f4ebe1]/25">
            Nuevos artículos cada mes · Basados en fuentes científicas
          </p>
        </div>
      </div>
    </>
  )
}
