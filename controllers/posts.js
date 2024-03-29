const bcrypt = require('bcryptjs');
const db = require('../models');

// Show all Posts

const showPost = (req, res) => {
    db.Post.find({}, (err, allPost) => {
        if (err) return res.status(500).json({
            status: 500,
            error: [{message: 'Something went wrong! Please try again'}],
        });
        res.json({
            status: 200,
            count: allPost.length,
            data: allPost,
            requestedAt: new Date().toLocaleString(),
        });
    });
};

// Show One post

const showOnePost = (req, res) => {
  db.Post.findById(req.params.postId, (error, foundPost) => {
    if (error) return console.log (error);
    if (foundPost) {
      res.json({
        status: 200,
        count: 1,
        data: foundPost,
        requestedAt: new Date().toLocaleString(),
      });
    } else {
      res.json({
        status: 404,
        count: 0,
        data: `Post with ID ${req.params.postId} was not found. Please try again.`
        })
      }
    })
  }

// Create Post

const createPost = (req, res) => {
    db.Post.create(req.body, (err, createdPost) => {
        if (err) return res.status(500).json({
            status: 500,
            error: [{message: 'Something went wrong. Please try again'}]
        });
        res.status(201).json({
            status: 201,
            count: 1,
            data: createdPost,
            dateCreated: new Date().toLocaleString(),
        });
        //FIND USER - PUSH POST
        db.User.findById({_id:req.params.userId}, (err, user) =>{
          console.log(req.params)
          if (err) return console.log(err)
          if (user){
            user.posts.push(createdPost._id)
            user.save((err, result) => {
              if (err) return console.log(err)
              console.log(result)
            })
          }
        })
        //FIND CITY - PUSH POST
        db.City.findOne({urlName:req.params.cityName}, (err, city) =>{
          if (err) return console.log(err)
          if (city){
            city.posts.push(createdPost._id)
            city.save((err, result) => {
              if (err) return console.log(err)
              console.log(result)
            })
          }
        });
    });
};

// Update Post

const updatePost = (req, res) => {
    db.Post.findByIdAndUpdate(
      req.params.postid,
      req.body,
      {new: true}, (err, updatedPost) => {
        if (err)  return res.status(500).json({
          status: 500,
          error: [{message: 'Something went wrong! Please try again'}],
        });
  
        res.json({
          status: 200,
          count: 1,
          data: updatedPost,
          requestedAt: new Date().toLocaleString()
        });
      });
  }

// Users posts

const userPosts = (req, res) => {
  db.User.findById({_id:req.params.id}, (err, foundUser)=>{
    if (err) return res.status(500)
    if (foundUser) {
      foundUser.populate("posts").execPopulate((err, user) => {
        if (err) return res.status(500).json({err})
        res.send({status: 200, posts: user.posts})
      })
    } else {
      res.status(500).json({message: 'User not found'})
    }
  })
}

// Cities Posts

const cityPosts = (req, res) => {
  db.City.findOne({urlName :req.params.cityName}, (err, foundCity) => {
    if (err) return res.status(500)
    if (foundCity) {
      foundCity.populate("posts").execPopulate((err, city) => {
        if (err) return res.status(500).json({err})
        res.send({status: 200, posts: city.posts})
      })
    } else {
      res.status(500).json({message: 'City not found'})
    }
  })
}



const authorName = (req, res) => {
  console.log(req.session)
  if (!req.session) return res.status(401).json({
      status:401,
      message: 'Unauthorized. Please login and try again.'
  });

  db.User.findById({_id:req.params.id}, (err, foundAuthor) => {
      if (err) return res.status(500).json({
          status: 500,
          message: err,
      });
      res.status(200).json({
          status: 200,
          data: foundAuthor,
      });
  });

};


// Destroy Post

const destroy = (req, res) => {
    db.Post.findByIdAndDelete(
      req.params.id, (err, destroyPost) =>{
        if (err)  return res.status(500).json({
          status: 500,
          error: [{message: 'Something went wrong! Please try again'}],
        });
        res.json({
          status:200,
          count: 1,
          data: destroyPost,
          requestedAt: new Date().toLocaleString(),
        })
      })
  }


module.exports = {
    showPost,
    showOnePost,
    createPost,
    updatePost,
    userPosts,
    cityPosts,
    authorName,
    destroy,
}