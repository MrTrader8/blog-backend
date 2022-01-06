const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0)
    return 0
  else
    return blogs.map(post => post.likes).reduce((acc, likes) => acc + likes)
}

module.exports = {
  dummy,
  totalLikes
}
