import { StatusCodes } from "http-status-codes"
import { AuthService } from "./auth.service.js"
import { AsyncHandlerUtil, ApiResponseUtil } from "../../shared/utils/index.utils.js"

export const register = AsyncHandlerUtil(async (req, res) => {
    const data = await AuthService.register(req.body)
    ApiResponseUtil.send(res, StatusCodes.CREATED, "Account created successfully", data)
})

export const login = AsyncHandlerUtil(async (req, res) => {
    const data = await AuthService.login(req.body)
    ApiResponseUtil.send(res, StatusCodes.OK, "Logged in successfully", data)
})

export const refreshToken = AsyncHandlerUtil(async (req, res) => {
    const data = await AuthService.refreshToken(req.user.userId)
    ApiResponseUtil.send(res, StatusCodes.OK, "Token refreshed successfully", data)
})


export const AuthController = {
    register,
    login,
    refreshToken
}