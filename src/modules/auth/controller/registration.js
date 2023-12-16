import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findOne, findOneAndUpdate, updateOne } from '../../../../DB/DBMethods.js'
import userModel from '../../../../DB/model/User.model.js'
import { sendEmail } from '../../../services/email.js'
import { asyncHandler } from '../../../services/errorHandling.js'
export const signup = asyncHandler(
    async (req, res, next) => {
        const { userName, email, password } = req.body
        const user = await findOne({ model: userModel, filter: { email }, select: 'email' })
        if (user) {
            return next(Error('Email Exist', { cause: 409 }))
        } else {
            const hash = bcrypt.hashSync(password, parseInt(process.env.SALTROUND))
            const newUser = new userModel({ userName, email, password: hash })

            const token = jwt.sign({ id: newUser._id }, process.env.emailToken)
            const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
        
            const message = `<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #88BDBF;margin: 0px;}
                </style>
                <body style="margin:0px;"> 
                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                <tr>
                <td>
                <table border="0" width="100%">
                <tr>
                <td>
                <h1>
                    <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
                </h1>
                </td>
                <td>
                <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                <tr>
                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                </td>
                </tr>
                <tr>
                <td>
                <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
                </td>
                </tr>
                <tr>
                <td>
                <p style="padding:0px 100px;">
                </p>
                </td>
                </tr>
                <tr>
                <td>
                <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:20px;">

                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                
                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>

                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>`

            const info = await sendEmail(email, 'Confirm Email', message)
            if (info?.accepted?.length) {
                const savedUser = await newUser.save()
                return res.status(201).json({ message: "Done", savedUerID: savedUser._id })
            } else {
                return next(Error('Email rejected', { cause: 400 }))
            }
        }
    }
)

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.emailToken)
    if (!decoded?.id) {
        return next(new Error('In-valid Payload', { cause: 400 }))
    } else {
        const user = await findOneAndUpdate({
            model: userModel,
            filter: { _id: decoded.id, confirmEmail: false },
            data: { confirmEmail: true },
            options: { new: true },
        })
        return res.status(200).redirect(`${process.env.FEURL}#/login`)
    }
})

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.emailToken)
    if (!decoded?.id) {
        return next(new Error('In-valid Payload', { cause: 400 }))
    } else {
        const user = await findOne({
            model: userModel,
            filter: { _id: decoded.id },
        })
        if (user && !user.confirmEmail && !user.blocked) {
            const token = jwt.sign({ id: user._id }, process.env.emailToken, { expiresIn: '1h' })
            const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`
            const message = `
            <a href='${link}'>ConfirmEmail </a>
            `
            const info = await sendEmail(user.email, 'Confirm-Email', message)
            return res.status(200).send(`
            <h1> Email Sent  Successfully Please check your Email</h1>
            `)
        } else {
            return res.status(200).redirect(process.env.FEURL)
        }
    }
})

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await findOne({ model: userModel, filter: { email } })
    if (!user) {
        return next(new Error("Email not Exist", { cause: 404 }))
    } else {
        if (!user.confirmEmail) {
            return next(new Error("Email not confirmed yet", { cause: 400 }))
        } else {
            if (user.blocked) {
                return next(new Error("Blocked", { cause: 400 }))
            } else {
                const match = bcrypt.compareSync(password, user.password)
                if (!match) {
                    return next(new Error("In-valid Password", { cause: 400 }))
                } else {
                    const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.tokenSignature)
                    return res.status(200).json({ message: "Done", token })
                }
            }

        }
    }
})



export const sendCode = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email }).select('email')
    if (!user) {
        return next(new Error('Not register user', { cause: 404 }))
    } else {
        const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
        await updateOne({
            model: userModel,
            filter: { _id: user._id },
            data: { code }
        })

        const message = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>
    <tr>
    <td>
    <h4>Reset Code : ${code}</h4>
    <p>Enter this code to  reset your account password
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">
    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`
        await sendEmail(user.email, 'Forget password', message)
        return res.status(200).json({ message: "Done" })
    }
})


export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new Error('Not register account', { cause: 404 }))
    } else {
        if (user.code != code || code == null) {
            return next(new Error('In-valid Code', { cause: 400 }))
        } else {
            const hashPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SaltRound))
            await updateOne({
                model: userModel,
                filter: { _id: user._id },
                data: { password: hashPassword, code: null }
            })
            return res.status(200).json({ message: "Done" })
        }
    }
})