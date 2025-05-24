import { PasswordStrengthChecker } from "../services/password-strength_checker"

export interface UserProps {
    id: string
    email: string
    password: string
}

export class User {
    constructor(public props: UserProps) {}

    hasWeakPassword() {
        return !PasswordStrengthChecker.isStrong(this.props.password);
    }

    missField() {
        return this.props.email === "" || this.props.password === ""
    }

    withHashedPassword(hashed: string) {
        return new User({
            ...this.props,
            password: hashed
        })
    }

    validateOrThrow() {
        if(this.missField()) throw new Error("Missing field required")
        if(this.hasWeakPassword()) throw new Error("Weak password error");
    }
}