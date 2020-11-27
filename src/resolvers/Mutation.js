const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    // encrpyt user's password
    const password = await bcrypt.hash(args.password, 10)
    
    // store new user record in db
    const user = await context.prisma.user.create({ data: { ...args, password } })
  
    // generate a yoken
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // return details to user (as AuthPayload object)
    return {
      token,
      user,
    }
}

async function login(parent, args, context, info) {
    // search for existing user
    const user = await context.prisma.user.findOne({ where: { email: args.email } })
    if (!user) {
      throw new Error('No such user found')
    }
  
    // hash supplied password and compare to user's hashed password in db
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // return details to user (as AuthPayload object)
    return {
      token,
      user,
    }
}
  
function post(parent, args, context, info) {
    const userId = getUserId(context)

    return context.prisma.link.create({
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      }
    })
    context.pubsub.publish("NEW_LINK", newLink)

    return newLink
}

async function vote(parent, args, context, info) {
  const userId = getUserId(context)

  const vote = await context.prisma.vote.findOne({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId
      }
    }
  })

  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  const newVote = context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    }
  })
  context.pubsub.publish("NEW_VOTE", newVote)

  return newVote
}

module.exports = {
    signup,
    login,
    post,
    vote,
}
