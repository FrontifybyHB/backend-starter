import bcrypt from 'bcrypt';
import AppError from './appError.js'

const saltRounds = 12;

export const hashPassword = (password) => {
    try {
        return bcrypt.hashSync(password, saltRounds);
    } catch (error) {
        throw new AppError('Could not hash password', 500);
    }
}

export const comparePassword = (password, hashedPassword) => {
    try {
        return bcrypt.compareSync(password, hashedPassword);
    } catch (error) {
        throw new AppError('Could not compare password', 500);
    }
}
