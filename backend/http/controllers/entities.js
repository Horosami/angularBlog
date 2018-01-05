var mysql      = require('mysql');
var express   = require('express');
var dbconfig   = require('../../config/database');

var connection = mysql.createConnection(dbconfig.connection);

var app       = express();
var router    = express.Router();

connection.query(`USE ${dbconfig.database}`);
console.log('conn-entites', dbconfig.database);

router.get('/posts', (req, res) => {
    connection.query(`SELECT posts.id, posts.title, posts.subtitle, posts.dateCreate, posts.text, posts.excerpt, posts.userId,
    (SELECT COUNT(*) FROM comments WHERE posts.id = comments.postId) AS comments
    FROM posts`, (err, rows) => {
        if (err) {
            res.status(500).json(err);
        }
        res.status(200).json(rows);
    });
});

router.get('/posts/count', (req, res) => {
    connection.query(`SELECT COUNT(posts.id) as count FROM posts`, (err, rows) => {
        if (err) {
            res.status(500).json(err);
        }
        console.log(rows);
        res.status(200).json(rows);
    });
});

router.post('/post', (req, res) => {
    const postInsert = req.body;
    const query = `INSERT INTO posts (title, subtitle, text, dateCreate, dateUpdate, userId, excerpt)
    VALUES ("${postInsert.title}", "${postInsert.subtitle}", "${postInsert.text}", ${postInsert.dateCreate}, ${postInsert.dateUpdate}, ${postInsert.userId}, "${postInsert.excerpt}")`;
    connection.query(query, (err, rows) => {
        if (err) {
            res.status(500).json(err);
        }
        if(rows) {
            let tags = postInsert.tags;
            for(let i = 0; i < tags.length; i++) {
                addTag(tags[i], postInsert.id, (idTag) => {  
                    addPostTag(idTag, rows.insertId);                
                })
            }
            res.status(200).send((rows.insertId).toString());
        }
    });
});

router.get('/post/:id', (req, res) => {
    const postQuery = `SELECT posts.id, posts.title, posts.subtitle, posts.dateCreate, posts.text, posts.userId, users.name, users.surname
    FROM posts
    INNER JOIN users ON posts.userId = users.id
    WHERE posts.id = ${req.params.id}`;
    let tagsArray = [];
    connection.query(postQuery, (err, rows) => {
        if(err) {
            res.status(500).json(err);
        }
        if(rows.length) {
            const tagQuery = `SELECT tags.name
            FROM tags
            INNER JOIN tagsinpost ON tags.id = tagsinpost.tagId
            INNER JOIN posts ON posts.id = tagsinpost.postId
            WHERE posts.id = ${req.params.id}`;
            connection.query(tagQuery, (err, tagRows) => {
                if(err) {
                    res.status(500).json(err);
                }
                if(tagRows.length) {
                    tagRows.forEach(element => {
                        tagsArray.push(element.name);
                    });
                    let answer = {
                        id: rows[0].id,
                        title: rows[0].title,
                        subtitle: rows[0].subtitle,
                        dateCreate: rows[0].dateCreate,
                        text: rows[0].text,
                        tags: tagsArray,
                        authorName: rows[0].name,
                        authorSurname: rows[0].surname,
                        userId: rows[0].userId
                    }
                    res.status(200).send(answer);
                }
            })
            
        }
    });
});

router.put('/post/:id', (req, res) => {
    const post = req.body;
    const postQuery = `UPDATE posts
    SET title = "${post.title}", subtitle = "${post.subtitle}", text = "${post.text}", dateUpdate = ${post.dateUpdate}, excerpt = "${post.excerpt}"
    WHERE id = ${post.id}`;
    connection.query(postQuery, (err, rows) => {
        if(err) {
            res.status(500).json(err);
        }
        deleteOldTags(post.tags, post.id, () => {
            let tags = post.tags;
            for(let i = 0; i < tags.length; i++) {
                addTag(tags[i], post.id, (idTag) => {  
                    addPostTag(idTag, post.id);                
                })
            }
        });
        res.status(200).send((post.id).toString());
    })
});

router.delete('/post/:id', (req, res) => {
    const id = req.params.id;
    const queryDelete = `DELETE FROM posts WHERE id = ${id}`;
    connection.query(queryDelete, (err, rows) => {
        if(err) {
            res.status(500).json(err);
        }
        if(rows) {
            const message = {
                status: 'success'
            }
            res.send(message);
        }
    })
})

router.get('/tags', (req, res) => {
    const queryTags = `SELECT tags.name, COUNT(tagsinpost.tagId) AS countTagsId
    FROM tagsinpost INNER JOIN tags ON tags.id = tagsinpost.tagId
    GROUP BY tagId
    ORDER BY countTagsId DESC
    LIMIT 10`;
    connection.query(queryTags, (err, rows) => {
        if (err) {
            const message = {
                success: false
            };
            res.send(message);
        }
        if (rows) {
            res.send(rows);
        }
    })
})

router.get('/tag/:tag', (req, res) => {
    const tag = req.params.tag;
    const queryPostTag = `SELECT 
                        posts.id,
                        posts.title,
                        posts.subtitle,
                        posts.text,
                        posts.dateCreate,
                        posts.dateUpdate,
                        posts.userId,
                        posts.excerpt,
                        tagsinpost.tagId
                    FROM
                        posts INNER JOIN tagsinpost ON posts.id = tagsinpost.postId
                    WHERE
                        tagsinpost.tagId IN (SELECT id FROM tags WHERE name = '${tag}')`;
    connection.query(queryPostTag, (err, rows) => {
        if (err) {
            const message = {
                'success': false
            };
            res.send(message);
        }
        if (rows) {
            res.send(rows);
        }
    })
})

router.post('/comment', (req, res) => {
    const comment = req.body;
    console.log('comment', comment);
    const queryComment = `INSERT INTO creative.comments(text, dateCreate, dateUpdate, postId, userId, previousId) VALUES ("${comment.text}", ${comment.dateCreate}, ${comment.dateUpdate}, ${comment.postId}, ${comment.userId}, ${comment.previousId});`
    connection.query(queryComment, (err, rows) => {
        if(err) {
            const message = {
                success: false
            };
            res.send(message);
        }
        if(rows) {
            res.send(rows);
        }
    })
})

router.get('/:id/comments', (req, res) => {
    const postId = req.params.id;
    const queryComments = `SELECT comments.id, comments.text, comments.dateUpdate, comments.userId, comments.postId, users.name as 'author', comments.previousId
    FROM comments
    INNER JOIN users ON comments.userId = users.id
    INNER JOIN posts ON comments.postId = posts.id
    WHERE postId = ${postId}`;
    connection.query(queryComments, (err, rows) => {
        if(err) {
            const message = {
                success: false
            };
            res.send(message);
        }
        if(rows) {
            res.send(rows);
        }
    })
})

router.delete('/comment/:id', (req, res) => {
    const commentId = req.params.id;
    const queryDeleteComment = `DELETE FROM comments WHERE id = ${commentId}`;
    connection.query(queryDeleteComment, (err, rows) => {
        if(err) {
            res.send({status: 'fail'});
        }
        if(rows.affectedRows) {
            res.send({status: 'success'});
        }
    });
})

function addTag(tag, postId, callback) {
    let tagQuery = `INSERT INTO tags (name) VALUE ('${tag}')`;
    let resultId = 0;
    connection.query(tagQuery, (err, rows) => {
        if(err) {
            connection.query(`SELECT id from tags WHERE name = '${tag}'`, (err, rows) => {
                if(err) {
                    res.status(500).json(err);
                }
                if(rows) {
                    resultId = rows[0].id;

                    callback(resultId);
                }
            });
        }
        if(rows) {
            resultId = rows.insertId;
            callback(resultId);
        }
    });
}

function addPostTag(idTag, postId) {
    let insertTagPost = `INSERT INTO tagsinpost(tagId, postId) VALUES (${idTag}, ${postId})`;
    connection.query(insertTagPost, (err, rows) => {
        if(err) {
            return err;
        }
        if(rows) {
            return rows;
        }
    });
}

function deleteOldTags(tags, postId, callback) {
    let deleteTagsQuery = `DELETE from tagsinpost WHERE postId = ${postId}`;
    connection.query(deleteTagsQuery, (err, rows) => {
        if(err) {
            return err;
        }
        if(rows.affectedRows) {
            callback();
        }
    });
}

module.exports = router;