import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn:60 * 60 * 1000 * 24 , 
    updateAge:60 * 60 * 1000 * 24 * 7,
    cookieCache:{
      enabled:true,
      maxAge:60 * 60 * 1000 * 24
    }
},
  user: {
    additionalFields: {
        role: {
            type: "string",
            required:true,
            defaultValue:Role.PATIENT
          },
          status: {
            type: "string",
            required:true,
            defaultValue:UserStatus.ACTIVE
          },
        
          needPasswordChanges: {
            type: "boolean",
            defaultValue: false,
          },
    
          isDeleted: {
            type: "boolean",
            defaultValue:false
          },
    
          deletedAt: {
            type: "date",
            required: false,
            defaultValue: null
          }
      }
  },
});
