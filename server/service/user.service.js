const UserModel = require('../db/models/user.model.js')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail.service.js')
const tokenService = require('../service/token.service.js')
const UserDto = require('../dtos/user.dtos.js')

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) {
      throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
    }
    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    })
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    )
    const userDto = new UserDto(user) // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) {
      throw new ('Неккоректная ссылка активации')
    }
    user.isActivated = true
    await user.save()
  }
}

module.exports = new UserService()
