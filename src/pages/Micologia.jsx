import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockArticles } from '../data/articles'
import { ArticleModal } from '../components/modals/ArticleModal'
import { slugify } from '../lib/helpers'
// Importar artículos para que se registren en ARTICLE_REGISTRY
import '../articles/Micorrizas'
import '../articles/Esporas'
import '../articles/Venenos'

function ArticleCard({ article, onSelect }) {
  const isPublished = article.status === 'published'
  return (
    <div
      onClick={() => isPublished && onSelect(article)}
      className={`glass rounded-2xl overflow-hidden transition-all duration-200 ${isPublished ? 'hover-lift cursor-pointer border border-green-f/20' : 'opacity-60 border border-white/[0.05]'}`}>
      <div className="h-56">
        <div className="absolute top-4 right-4">
          {!isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-cream/50">
              Próximamente
            </span>
          )}
          {isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-f/20 text-lime-400">
              Nuevo
            </span>
          )}
        </div>
        <img src={article.heroImage} className="w-full h-full object-cover" alt={article.title} />
      </div>
      <div className="px-5 pb-5">
        <h3 className="font-display text-xl text-cream mb-1 leading-tight mt-3">
          {article.title}
        </h3>
        <p className="text-sm text-cream/70 mb-3 leading-relaxed line-clamp-2">
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
          <span className="text-xs text-cream/30 ml-2 flex-shrink-0">
            {article.readingTime} min
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Micologia() {
  const { slug } = useParams()
  const navigate = useNavigate()

  // Artículo activo determinado por la URL
  const selectedArticle = slug
    ? mockArticles.find(a => slugify(a.title) === slug) || null
    : null

  const featured = mockArticles.filter(a => a.featured)
  const rest     = mockArticles.filter(a => !a.featured)

  const openArticle = (article) => {
    if (article.status !== 'published') return
    navigate(`/micologia/${slugify(article.title)}`)
  }

  const closeArticle = () => navigate(-1)

  return (
    <>
      {selectedArticle && (
        <ArticleModal slug={selectedArticle.slug} onClose={closeArticle} />
      )}

      <div className="max-w-5xl mx-auto anim-up">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-4xl font-semibold text-cream mb-1">Micología</h2>
          <p className="text-muted text-sm">Artículos para entender el reino fungi: ecología, identificación, historia y ciencia.</p>
        </div>

        {/* Artículo destacado */}
        {featured.map(article => (
          <div key={article.id}
            onClick={() => openArticle(article)}
            className="glass flex flex-col md:flex-row rounded-2xl overflow-hidden hover-lift cursor-pointer mb-8 transition-all duration-200">
            <div className="md:w-1/2 h-56 md:h-auto">
              <img src={article.heroImage} className="w-full h-full object-cover" alt={article.title} />
            </div>
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
              <h2 className="font-display text-xl sm:text-3xl text-cream mb-3 leading-snug">
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
                <span className="hidden md:block text-xs text-cream/30">
                  {article.readingTime} min de lectura
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Resto de artículos */}
        <div className="mb-4">
          <h3 className="text-muted text-sm font-medium uppercase mb-4">Más artículos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={openArticle} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center py-8">
          <p className="text-xs text-cream/25">
            Nuevos artículos cada mes · Basados en fuentes científicas
          </p>
        </div>
      </div>
    </>
  )
}
