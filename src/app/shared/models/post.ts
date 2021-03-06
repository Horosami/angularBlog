export class Post {
    id: number;
    title: string;
    subtitle: string;
    text: string;
    dateCreate: number;
    dateUpdate: number;
    tags: string[];
    excerpt: string;
    author: string;
    userId: number;
    comments: number;
    categoryId: number;

    constructor (
        id: number = 0,
        title: string = '',
        subtitle: string = '',
        text: string = '',
        tags: string[] = [],
        author: string = '',
        userId: number = 0,
        comments: number = 0,
        categoryId: number = 0
    ) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.text = text;
        this.tags = tags;
        this.author = author;
        this.userId = userId;
        this.comments = comments;
        this.categoryId = categoryId;
    }
}
