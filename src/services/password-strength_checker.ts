export class PasswordStrengthChecker{
    static isStrong(password: string) {
        if(password.length < 8) return false;
        if(!password.match(/[A-Z]/)) return false;
        if(!password.match(/[0-9]/)) return false;
        if(!password.match(/[@#$%^&*]/)) return false;
        return true
    }
}