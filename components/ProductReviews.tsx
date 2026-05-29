'use client';

import { useEffect, useState } from 'react';
import { Edit2, Star, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  createProductReview,
  deleteProductReview,
  fetchProductReviews,
  getApiErrorMessage,
  ProductReview,
  updateProductReview,
} from '@/lib/api';

interface ProductReviewsProps {
  productId: string | number;
  onRequireAuth: () => void;
}

export function ProductReviews({ productId, onRequireAuth }: ProductReviewsProps) {
  const locale = useLocale();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number | null>(5);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = async (nextPage = page) => {
    try {
      const response = await fetchProductReviews(productId, nextPage, 5);
      setReviews(response.reviews);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(response.page);
      setError('');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    }
  };

  useEffect(() => {
    loadReviews(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user?.id]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createProductReview(productId, { rating, content: content.trim() });
      setContent('');
      setRating(5);
      await loadReviews(0);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (review: ProductReview) => {
    setEditingId(review.id);
    setEditRating(review.rating ?? 5);
    setEditContent(review.content);
  };

  const saveEdit = async (reviewId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await updateProductReview(reviewId, {
        rating: editRating,
        content: editContent.trim(),
      });
      setEditingId(null);
      await loadReviews(page);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeReview = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
      await deleteProductReview(reviewId);
      await loadReviews(page);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'vi' ? 'Danh gia va binh luan' : 'Reviews and comments'}
          </h2>
          <p className="text-sm text-gray-500">
            {totalElements}{' '}
            {locale === 'vi' ? 'binh luan tu khach hang' : 'customer comments'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={submitReview} className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="text-amber-500"
              aria-label={`Rate ${value}`}
            >
              <Star
                className={`h-5 w-5 ${
                  rating && value <= rating ? 'fill-amber-500' : ''
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
          placeholder={
            user
              ? locale === 'vi'
                ? 'Viet binh luan cua ban...'
                : 'Write your comment...'
              : locale === 'vi'
                ? 'Dang nhap de binh luan'
                : 'Sign in to comment'
          }
          disabled={!user || isSubmitting}
        />
        <div className="mt-3 flex justify-end">
          <button
            type={user ? 'submit' : 'button'}
            onClick={!user ? onRequireAuth : undefined}
            disabled={isSubmitting}
            className="rounded-lg bg-amber-900 px-5 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
          >
            {locale === 'vi' ? 'Gui binh luan' : 'Post comment'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{review.userName}</p>
                <p className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat(locale).format(new Date(review.createdAt))}
                  {review.edited ? ` - ${locale === 'vi' ? 'da sua' : 'edited'}` : ''}
                </p>
              </div>
              {review.mine && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(review)}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-900"
                    aria-label="Edit review"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReview(review.id)}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {editingId === review.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditRating(value)}
                      className="text-amber-500"
                      aria-label={`Rate ${value}`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          editRating && value <= editRating ? 'fill-amber-500' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {locale === 'vi' ? 'Huy' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(review.id)}
                    disabled={isSubmitting}
                    className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
                  >
                    {locale === 'vi' ? 'Luu' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {review.rating && (
                  <div className="mb-2 flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= (review.rating ?? 0) ? 'fill-amber-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p className="whitespace-pre-line text-gray-700">{review.content}</p>
              </>
            )}
          </article>
        ))}

        {reviews.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            {locale === 'vi' ? 'Chua co binh luan nao.' : 'No comments yet.'}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => loadReviews(page - 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {locale === 'vi' ? 'Truoc' : 'Previous'}
          </button>
          <span className="text-sm text-gray-500">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => loadReviews(page + 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {locale === 'vi' ? 'Sau' : 'Next'}
          </button>
        </div>
      )}
    </section>
  );
}
