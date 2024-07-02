let express = require('express')
let router = express.Router();
const blogController = require('../controllers/blogController');

// Routers to GET posts
router.get('/', blogController.get_posts_list);
router.get('/last/:number', blogController.get_last_post_list);
router.get('/:postid', blogController.get_post);

// Router to POST a comment on a post
router.post('/:postid/comment', blogController.post_comment);

// Router to get the like on a post
router.get('/:postid/liked', blogController.check_like);

// Router to POST a like on a post
router.post('/:postid/like', blogController.post_like);


module.exports = router;