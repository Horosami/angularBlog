import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import { Post } from './../../shared/models/post';
import { Tag } from './../../shared/models/tag';
import { Category } from './../../shared/models/category';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Injectable()
export class PostService {
    private postsUrl = 'http://localhost:3000/posts';
    private tagsUrl = 'http://localhost:3000/tags';
    private categoriesUrl = 'http://localhost:3000/categories';

    private posts = new Subject<Post[]>();
    public posts$ = this.posts.asObservable();

    private postsCount = new Subject<number>();
    public postsCount$ = this.postsCount.asObservable();

    public length: number = 0;
    public pageSize: number = 5;
    public pageSizeOptions: number[] = [5, 10, 25, 100];
    public pageIndex: number = 0;

    constructor(private http: HttpClient) { }

    getPosts(count: number = 0, page: number = 0): Observable<Post[]> {
        const offset = count * page;
        const url = `${this.postsUrl}?page=${page}&limit=${count}&offset=${offset}`;
        this.http.get<Post[]>(url, httpOptions)
            .subscribe((posts) => {
                this.posts.next(posts['rows']);
                this.postsCount.next(posts['count']);
            });
        return this.posts;
    }

    createPost(post: Post): Observable<Post> {
        const url = `${this.postsUrl}`;
        return this.http.post<Post>(url, post, httpOptions);
    }

    getPost(id: number): Observable<Post> {
        const url = `${this.postsUrl}/${id}`;
        return this.http.get<Post>(url, httpOptions);
    }

    editPost(post: Post) {
        const url = `${this.postsUrl}/${post.id}`;
        return this.http.put(url, post, httpOptions);
    }

    deletePost(id: number) {
        const url = `${this.postsUrl}/${id}`;
        return this.http.delete(url, httpOptions);
    }

    getPopularTags(): Observable<Tag[]> {
        const url = `${this.tagsUrl}`;
        return this.http.get<Tag[]>(url, httpOptions);
    }

    getPostsByTag(tagname: string, count: number, page: number): Observable<Object> {
        const offset = count * page;
        const url = `${this.postsUrl}/tag/${tagname}?page=${page}&limit=${count}&offset=${offset}`;
        this.http.get(url, httpOptions)
            .subscribe((posts) => {
                this.postsCount.next(posts['count']);
                this.posts.next(posts['rows']);
            });
        return this.posts;
    }

    getCategories(): Observable<Category[]> {
        const url = `${this.categoriesUrl}`;
        return this.http.get<Category[]>(url, httpOptions);
    }
}
