export interface AdminReview {
    _id: string;
    product: {
        _id: string;
        name: string;
        image: string;
    };
    user: {
        _id: string;
        name: string;
        email: string;
    };
    rating: number;
    title: string;
    comment: string;
    helpful: number;
    unhelpful: number;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}
