import  express ,{type Application, type Request, type Response} from "express";
import cors from 'cors';
import route from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { NotfoundHandler } from "./app/middleware/notFoundHandler";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";


const app:Application=express();
// app.set("view engine", "ejs");
// app.set("views", path.join(process.cwd(), "src/app/template"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


const allowedOrigins = [
  process.env.APP_URL,
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "http://localhost:5050",
].filter(Boolean);
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
  
        // Check if origin is in allowedOrigins or matches Vercel preview pattern
        const isAllowed =
          allowedOrigins.includes(origin) ||
          /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
          /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment
  
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["Set-Cookie"],
    }),
  );
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use('/api/v1',route);

app.use(globalErrorHandler);
app.use(NotfoundHandler);
app.get('/',(req:Request,res:Response)=>{
    res.send("Hello World");
})

export default app;