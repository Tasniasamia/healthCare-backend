import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
    //   sendVerificationEmail: async ( { user, url, token }, request) => {

    // },
  },
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    updateAge: 60 * 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },

      needPasswordChanges: {
        type: "boolean",
        defaultValue: false,
      },

      isDeleted: {
        type: "boolean",
        defaultValue: false,
      },

      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },



  
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true, 

      async sendVerificationOTP({ email, otp, type }) {
        const user=await prisma.user.findUnique({where:{email:email}});
        if (!user) return ;
        if (type === "email-verification") {
          if(user && !user?.emailVerified){
            await  sendEmail({
              to: email,
              subject: "Email Verification",
              templateName: "emailVerification",
              templateData: { email:email, otp:otp },
            });
          }
          
        

        } else if(type === "forget-password") {
          if(user && (user?.status === UserStatus.ACTIVE) && !(user?.isDeleted)){
            await  sendEmail({
              to: email,
              subject: "Reset Password",
              templateName: "emailVerification",
              templateData: { email:email, otp:otp },
            });
          }
       
        }
       
      },
      otpLength: 6,
      expiresIn: 600
    }),
  ],
});
