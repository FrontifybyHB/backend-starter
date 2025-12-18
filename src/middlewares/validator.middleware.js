import { validationResult } from "express-validator";

/**
 * Validate request using express-validator rules
 */
export const validate = (rules = []) => {
    return async (req, res, next) => {
        // Run all validation rules
        for (const rule of rules) {
            await rule.run(req);
        }

        // Collect validation errors
        const errors = validationResult(req);

        // If no errors, continue
        if (errors.isEmpty()) {
            return next();
        }

        // Format errors: field -> message
        const formattedErrors = {};
        for (const err of errors.array()) {
            if (!formattedErrors[err.path]) {
                formattedErrors[err.path] = err.msg;
            }
        }

        return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors,
        });
    };
};

/**
 * Custom Validators
 * -----------------
 * Only validators actually used in the package
 */

export const customValidators = {
    /**
     * Strong password validator
     * - Min 8 chars
     * - At least 1 uppercase
     * - At least 1 lowercase
     * - At least 1 number
     */
    strongPassword(value) {
        if (!value) return false;

        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasMinLength = value.length >= 8;

        return (
            hasUppercase &&
            hasLowercase &&
            hasNumber &&
            hasMinLength
        );
    },
};
