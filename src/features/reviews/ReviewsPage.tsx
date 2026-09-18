import { Toolbar } from '../../components/ui'
import type { DashboardReview } from '../../types'

export function ReviewsPage({ reviews }: { reviews: DashboardReview[] }) {
    return (
        <section className="panel table-panel full-panel">
            <Toolbar title="Ratings and reviews" text={`${reviews.length} reviews from customers`} />
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Feedback</th>
                        <th>Received</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            <td>
                                <strong>{review.product}</strong>
                            </td>
                            <td>{review.customer}</td>
                            <td>
                                <span className="rating">
                                    {'★'.repeat(review.rating)} <b>{review.rating}.0</b>
                                </span>
                            </td>
                            <td className="review-text">{review.text}</td>
                            <td>{new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                        </tr>
                    ))}
                    {!reviews.length && (
                        <tr>
                            <td colSpan={5} className="empty-state">
                                No reviews submitted yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    )
}
