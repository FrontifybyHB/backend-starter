import bcrypt from 'bcrypt';
import appError from './appError.js';

const saltRounds = 12;

export const hashPassword = (password) => {
    try {
        return bcrypt.hashSync(password, saltRounds);
    } catch {
        throw appError('Could not hash password', 500);
    }
}

export const comparePassword = (password, hashedPassword) => {
    try {
        return bcrypt.compareSync(password, hashedPassword);
    } catch {
        throw appError('Could not compare password', 500);
    }
}
