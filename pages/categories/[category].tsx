import { GetStaticPaths, GetStaticProps } from 'next'
import { Article, TECH_CATEGORIES, TechCategory } from '@/types'
import { getAllArticles } from '@/lib/notionAPI'
import ArticleList from '@/components/Article/ArticleList'
import { CATEGORY_INFO } from '@/constants/categories'
import Link from 'next/link'

type Props = {
  category: TechCategory
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(CATEGORY_INFO).map((category) => ({
    params: { category },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as keyof typeof CATEGORY_INFO
  if (!CATEGORY_INFO[category]) {
    return { notFound: true }
  }

  const allArticles = await getAllArticles()
  const categoryArticles = allArticles
    .filter(article => article.tags.some(tag => tag.toLowerCase().includes(category)))
    .map(article => ({
      ...article,
      description: article.description ?? null,
      content: article.content ?? null,
      updated_on: article.updated_on ?? null,
      slug: article.slug ?? null
    }))

  return {
    props: {
      category: {
        id: category,
        ...CATEGORY_INFO[category],
        articles: categoryArticles
      },
    },
    revalidate: 60,
  }
}

const CategoryPage = ({ category }: Props) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{category.name}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
      </div>
      {category.articles.length > 0 ? (
        <ArticleList articles={category.articles.map(article => ({
          ...article,
          isPaginationPage: false,
          description: article.description || undefined,
          content: article.content || undefined,
          updated_on: article.updated_on || undefined,
          slug: article.slug || undefined
        }))} />
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">このカテゴリーの記事はまだありません</p>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            トップページに戻る
          </Link>
        </div>
      )}
    </div>
  )
}

export default CategoryPage
