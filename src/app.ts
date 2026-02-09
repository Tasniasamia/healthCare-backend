import  express ,{type Application, type Request, type Response} from "express";
import route from "./routes";
import cors from 'cors';

const app:Application=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const allowedOrigins = [
    process.env.APP_URL || "http://localhost:3000",
    process.env.PROD_APP_URL, // Production frontend URL
  ].filter(Boolean); // Remove undefined values
  
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
  
app.use('/api/v1',route);

app.get('/',(req:Request,res:Response)=>{
    res.send("Hello World");
})

export default app;