import ApprovalStatusController from './ApprovalStatusController'
import EmailVerificationController from './EmailVerificationController'
const Auth = {
    ApprovalStatusController: Object.assign(ApprovalStatusController, ApprovalStatusController),
EmailVerificationController: Object.assign(EmailVerificationController, EmailVerificationController),
}

export default Auth